import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
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
    this.isCollapsed = false; // Khởi tạo trạng thái sidebar
  }
  isCollapsed: boolean = false;
  isDropdownOpen: boolean = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.cdr.detectChanges(); 
  }
}
