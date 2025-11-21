import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output, Input } from '@angular/core';
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-side-bar',
  imports: [RouterModule, CommonModule],
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.css']
})
export class SideBarComponent implements OnInit {
  constructor(private cdr: ChangeDetectorRef) { }
  ngOnInit(): void {
    const saved = localStorage.getItem('sidebarCollapsed');
    this.isCollapsed = saved === 'true';
  }

  isCollapsed: boolean = false;
  isDropdownOpen: boolean = false;


  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    // Lưu trạng thái để lần sau vào vẫn giữ
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }

  @Input() isOpen = false;

  // Báo lại cho cha khi muốn đóng (ví dụ click vào overlay)
  @Output() closeSidebar = new EventEmitter<void>();

  close() {
    this.closeSidebar.emit();
  }
}
