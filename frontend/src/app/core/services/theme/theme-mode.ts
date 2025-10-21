// src/app/core/services/theme/theme-mode.ts

// 1. Import thêm các mục này
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ThemeModeService {
  private isDarkMode = false;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {

    // Chỉ chạy code này đang ở trên trình duyệt
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      if (savedTheme === 'dark') {
        this.isDarkMode = true;
      } else if (!savedTheme && prefersDark) {
        this.isDarkMode = true;
      }
      this.updateTheme();
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.updateTheme();
  }

  private updateTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const theme = this.isDarkMode ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  getIsDarkMode(): boolean {
    return this.isDarkMode;
  }

}
