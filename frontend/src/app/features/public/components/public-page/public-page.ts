import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Footer } from "../../../../layout/footer/footer";
import { Header } from "../../../../layout/header/header";

@Component({
  selector: 'app-public-page',
  imports: [CommonModule, RouterModule, Footer, Header],
  templateUrl: './public-page.html',
  styleUrls: ['./public-page.css']
})
export class PublicPageComponent {
  private platformId = inject(PLATFORM_ID);
  theme = 'light';

  ngOnInit(): void {
    // Kiểm tra chỉ chạy trên browser
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('theme');
      this.theme = saved ?? 'light';
      document.documentElement.classList.toggle('dark', this.theme === 'dark');
    }
  }

  toggleTheme() {
    if (isPlatformBrowser(this.platformId)) {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', this.theme);
      document.documentElement.classList.toggle('dark', this.theme === 'dark');
    }
  }
}
