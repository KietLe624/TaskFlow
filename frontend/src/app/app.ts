import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeModeService } from './core/services/theme/theme-mode';
import { AuthService } from './core/services/auth/auth';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeModeService, private authService: AuthService) { }
  ngOnInit(): void {
    this.authService.autoLogin();
  }
}
