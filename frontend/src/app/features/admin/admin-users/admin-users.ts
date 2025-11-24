import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin/admin-service';
import { CommonModule } from '@angular/common'
import { UserDetailComponent } from "../user-detail/user-detail";
import { FormUserModal } from '../form-user-modal/form-user-modal';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, UserDetailComponent, FormUserModal, FormsModule],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.css']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading: boolean = false;
  createUserModal: any = { open: () => { }, isOpen: false }; // sẽ được gán sau

  constructor(private adminService: AdminService) { }
  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.adminService.getAllUsers({ page: 1, limit: 50 }).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);

        // Backend trả về { users: [...] } → lấy res.users
        this.users = res.users || [];

        // Chuẩn hóa roles thành mảng string để dễ hiển thị
        this.users = this.users.map((user: any) => ({
          ...user,
          roleNames: user.roles?.map((r: any) => r.name) || ['member']
        }));

        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi load users:', err);
        this.users = [];
        this.loading = false;
      }
    });
  }

  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  resetPassword(userId: number) {
    this.adminService.adminResetPassword(userId).subscribe({
      next: (res) => {
        console.log(`Password reset for user ${userId}:`, res);
        alert(`Password has been reset. ${res.message}`);
      },
      error: (err) => {
        console.error(`Lỗi reset password cho user ${userId}:`, err);
        alert(`Failed to reset password: ${err.error?.message || err.message}`);
      }
    });
  }

  isBanned(userId: string): boolean {
    const user = this.users.find(u => u.user_id === userId);
    return user ? user.is_banned : false;
  }

  banUser(userId: string) {
  }

  openCreateUserModal() {
    this.createUserModal.isOpen = true;
    console.log('Opening create user modal');
  }
  createUser(formData: any) {
    this.adminService.createUser(formData).subscribe({
      next: (res) => {
        alert(`Tạo thành công!\nUser: ${res.username}\nMật khẩu mặc định: 123456`);
        this.loadUsers(); // reload danh sách
      },
      error: (err) => {
        alert('Lỗi: ' + err.error.message);
      }
    });
  }

  // dùng trong user-detail component
  selectedUser: any = null;

  openDetail(user: any) {
    this.selectedUser = user;
  }

  closeDetail() {
    this.selectedUser = null;
  }

  // delete user
  showDeleteModal = false;
  userToDelete: any = null;

  // Hàm mở modal confirm
  openDeleteModal(user: any) {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  // Hàm xóa
  deleteUser(userId: number) {
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.loadUsers();
        this.selectedUser = null; // đóng modal
        alert('Xóa thành công!');
      },
      error: (err) => {
        alert('Lỗi: ' + err.error.message);
      }
    });
  }

  // search, filter
  searchTerm = '';
  selectedRole = 'all'; // all, member, admin, super_admin
  filteredUsers: any[] = [];

  // Hàm lọc
  filterUsers() {
    let temp = this.users;

    // Lọc theo từ khóa
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(user =>
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.full_name?.toLowerCase().includes(term)
      );
    }

    // Lọc theo role
    if (this.selectedRole !== 'all') {
      temp = temp.filter(user => user.roleNames.includes(this.selectedRole));
    }

    this.filteredUsers = temp;
  }
}

