import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'projectStatus',
  standalone: true // Đảm bảo pipe là standalone
})
export class ProjectStatusPipe implements PipeTransform {

  // Định nghĩa mapping object
  private statusMap: { [key: string]: string } = {
    'in_progress': 'Đang xử lý',
    'todo': 'Cần làm',
    'done': 'Hoàn thành',
    'completed': 'Hoàn thành',
    'testing': 'Đang kiểm thử',
    'paused': 'Tạm dừng',
    'cancelled': 'Đã hủy'
  };

  transform(statusKey: string): string {
    // Trả về giá trị đã map, hoặc trả về chính nó nếu không tìm thấy
    return this.statusMap[statusKey] || statusKey;
  }
}
