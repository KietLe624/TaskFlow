import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-modal.html',
  styleUrl: './search-modal.css'
})
export class SearchModal {
  @Input() projects: any[] = []; // Nhận danh sách project từ cha để hiển thị dropdown
  @Output() searchEvent = new EventEmitter<any>(); // Bắn kết quả lọc ra ngoài
  @Output() closeEvent = new EventEmitter<void>();

  // Object chứa dữ liệu lọc
  filters = {
    keyword: '',
    projectId: null,
    status: '',
    priority: '',
    dueDateFrom: '',
  };

  constructor() { }

  onSearch() {
    this.searchEvent.emit(this.filters);
  }

  // Xoá trắng bộ lọc
  resetFilters() {
    this.filters = {
      keyword: '',
      projectId: null,
      status: '',
      priority: '',
      dueDateFrom: '',
    };
  }

  close() {
    this.closeEvent.emit();
  }
}
