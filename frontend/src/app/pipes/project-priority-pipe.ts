import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'projectPriority',
  standalone: true
})
export class ProjectPriorityPipe implements PipeTransform {

  private priorityMap: { [key: string]: string } = {
    'high': 'Cao',
    'medium': 'Trung bình',
    'low': 'Thấp'
  };

  transform(priorityKey: string): string {
    // Trả về giá trị đã map, hoặc trả về chính nó nếu không tìm thấy
    return this.priorityMap[priorityKey] || priorityKey;
  }
}
