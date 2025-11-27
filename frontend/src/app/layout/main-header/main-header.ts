import { Component, HostListener, ElementRef, inject, OnInit, ChangeDetectorRef, Input, EventEmitter, Output } from '@angular/core';
import { ThemeToggle } from "../../shared/theme-toggle/theme-toggle";
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter, map, mergeMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth/auth';
import { NotificationsComponent } from '../../features/user/components/notifications/notifications';
import { UserAvatarComponent } from '../../features/user/components/user-avatar/user-avatar';
import { MyJwtPayload } from '../../models/users';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [ThemeToggle, CommonModule, RouterModule, NotificationsComponent, UserAvatarComponent],
  templateUrl: './main-header.html',
  styleUrls: ['./main-header.css']
})
export class MainHeaderComponent implements OnInit {
  pageTitle: string = 'Dashboard';

  private routerSubscription: Subscription | undefined;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  authService = inject(AuthService);
  elementRef = inject(ElementRef);
  isDropdownOpen = false; // trạng thái nút dropdown
  isCollapsed: boolean = false;
  isOpenNoti: boolean = false;

  currentUser: MyJwtPayload | null = null;

  @Output() toggleSidebar = new EventEmitter<void>();

  onMenuClick() {
    // Phát tín hiệu ra ngoài
    this.toggleSidebar.emit();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.cdr.detectChanges(); // 3. Gọi detectChanges()
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isDropdownOpen) { // Chỉ chạy nếu đang mở
        this.isDropdownOpen = false;
        this.cdr.detectChanges(); // 4. Cũng gọi ở đây khi đóng từ bên ngoài
      }
    }
  }
  ngOnInit(): void {
    this.isDropdownOpen = false; // Khởi tạo trạng thái dropdown

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute), // Lấy route gốc
      map(route => {
        // Đi vào route con cuối cùng (route đang active)
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary'), // Chỉ lấy route chính
      mergeMap(route => route.data) // Lấy 'data' object từ route
    ).subscribe(data => {
      this.pageTitle = data['title'] || 'Dashboard';
    });
    this.authService.currentUser$.subscribe(userPayload => {
      this.currentUser = userPayload;

      // Log kiểm tra xem trong token có avatar/name không
      console.log('Current User Payload:', this.currentUser);
    });

  }
  ngOnDestroy(): void {
    // 9. Hủy subscription khi component bị hủy
    this.routerSubscription?.unsubscribe();
  }
  onLogout() {
    this.authService.logout();
    this.isDropdownOpen = false;
  }

  openNotifications() {
    this.isOpenNoti = true;
    this.isDropdownOpen = false;
  }

  closeNotifications() {
    this.isOpenNoti = false;
    this.cdr.detectChanges();
  }

}
