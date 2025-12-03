import { Component } from '@angular/core';
import { SideBarComponent } from "../side-bar/side-bar";
import { RouterModule } from '@angular/router';
import { MainHeaderComponent } from "../main-header/main-header";
import { CommonModule } from '@angular/common'; // [Thêm mới] Để dùng ngClass

@Component({
  selector: 'app-main-layout',
  imports: [SideBarComponent, MainHeaderComponent, RouterModule, CommonModule], // [Cập nhật] Thêm CommonModule
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout {
  isMobileSidebarOpen = false;
  isSidebarCollapsed = false; // Biến này sẽ nhận giá trị từ sidebar con

  // Hàm này sẽ được gọi khi sidebar con emit sự kiện thay đổi trạng thái
  onSidebarCollapsed(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }
}
