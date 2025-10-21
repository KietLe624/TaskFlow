import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeModeService } from '../../core/services/theme/theme-mode';


@Component({
  selector: 'app-theme-toggle',
  imports: [],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.css'
})
export class ThemeToggle {
  private platformId = inject(PLATFORM_ID);
  themeService = inject(ThemeModeService);

  isDark = signal(this.themeService.getIsDarkMode());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      this.isDark.set(savedTheme === 'dark');
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDark.set(this.themeService.getIsDarkMode());
  }
}
