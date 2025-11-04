import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-avatar',
  imports: [CommonModule],
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.css'
})
export class UserAvatarComponent {
  @Input() src: string | null | undefined;
  @Input() avatar_url: string | null | undefined;
  @Input() username: string | null | undefined;
  @Input() textSize: string = 'text-base';
  @Input() size: string = 'w-8 h-8'; // Kích thước mặc định
  public initial: string = '?';
  public bgColor: string = '#000000'; // Màu nền mặc định

  private colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722', '#795548', '#9E9E9E', '#607D8B'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['username'] && !this.src) {
      this.updateAvatar();
    }
  }

  private updateAvatar(): void {
    this.initial = this.getInitial(this.username);
    this.bgColor = this.getColorByName(this.username);
  }

  private getInitial(username: string | null | undefined): string {
    if (!username) return '?';
    return username.trim().charAt(0).toUpperCase();
  }

  private getColorByName(username: string | null | undefined): string {
    if (!username) return '#000000';

    // Tạo một "hash" đơn giản từ tên để chọn màu
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % this.colors.length);
    return this.colors[index];
  }

  // debug
  consoleLog() {
    console.log('UserAvatarComponent:', {
      src: this.src,
      username: this.username,
      initial: this.initial,
      bgColor: this.bgColor
    });
  }
}

