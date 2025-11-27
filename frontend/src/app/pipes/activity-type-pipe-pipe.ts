import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'activityTypePipe'
})
export class ActivityTypePipe implements PipeTransform {

  transform(value: string): string {
    const map: Record<string, string> = {
      'created_project': 'đã tạo dự án',
      'created_task': 'đã tạo công việc',
      'updated_task': 'đã cập nhật công việc',
      'invited_team': 'đã mời thành viên',
      'completed_task': 'đã hoàn thành công việc',
      'invited_project': 'đã mời vào dự án',
      'assigned_task': 'đã giao công việc',
    };
    return map[value] || value; // Fallback nếu không tìm thấy
  }

}
