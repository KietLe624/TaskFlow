import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'projectStatus',
  standalone: true // Đảm bảo pipe là standalone
})
export class ProjectStatusPipe implements PipeTransform {

  // Định nghĩa mapping object
  private statusMap: { [key: string]: string } = {
    'in_progress': 'Đang xử lý',
    'to_do': 'Cần làm',
    'in_review': 'Đang xem xét',
    'blocked': 'Bị chặn',
    'completed': 'Hoàn thành',
    'testing': 'Đang kiểm thử',
    'paused': 'Tạm dừng',
    'cancelled': 'Đã hủy',
    'on_hold': 'Đang chờ',
    'over_due': 'Quá hạn'
  };

  transform(statusKey: string): string {
    return this.statusMap[statusKey] || statusKey;
  }
}
