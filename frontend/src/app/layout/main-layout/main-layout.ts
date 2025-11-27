import { Component } from '@angular/core';
import { SideBarComponent } from "../side-bar/side-bar";
import { RouterModule, Route } from '@angular/router';
import { MainHeaderComponent } from "../main-header/main-header";

@Component({
  selector: 'app-main-layout',
  imports: [SideBarComponent, MainHeaderComponent, RouterModule],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout {
  isMobileSidebarOpen = false;

  // Hàm nhận sự kiện từ Header
  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  // Hàm đóng sidebar (dùng khi click vào overlay hoặc chọn menu)
  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }
}
