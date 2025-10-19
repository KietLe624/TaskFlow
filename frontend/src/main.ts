import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),          // 👈 BẮT BUỘC: kích hoạt Angular Router
    provideHttpClient(withFetch()), // 👈 Để dùng HttpClient
  ],
}).catch(err => console.error(err));
