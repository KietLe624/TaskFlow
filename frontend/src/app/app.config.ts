import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

// 2. Cấu hình kết nối đến backend
const config: SocketIoConfig = {
  url: 'http://localhost:3000',
  options: {}
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideZonelessChangeDetection(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideToastr({
      timeOut: 3000,                 // Thời gian tự tắt (ms)
      positionClass: 'toast-top-right', // Vị trí (thử top-right cho dễ nhìn)
      preventDuplicates: true,       // Chống spam tin giống nhau
      progressBar: true,             // Hiển thị thanh thời gian
      progressAnimation: 'decreasing', // Hiệu ứng thanh thời gian
      enableHtml: true,              // Cho phép dùng thẻ HTML trong thông báo (ví dụ in đậm <b>)
      closeButton: true,             // Hiện nút đóng X
      newestOnTop: true,             // Tin mới nhất hiện trên cùng
      tapToDismiss: false,            // Click vào không tự tắt (để người dùng đọc kỹ nếu muốn), hoặc để true tùy thích
      toastClass: 'ngx-toastr custom-toast', // Thêm lớp CSS tùy chỉnh
    }),
    importProvidersFrom(SocketIoModule.forRoot(config))
  ]
};
