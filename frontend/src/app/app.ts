import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeModeService } from './core/services/theme/theme-mode';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  constructor(private themeService: ThemeModeService, private toastr: ToastrService) { }
  testToastr() {
    this.toastr.success('Giao diện mới đã hoạt động!', 'Thành công');
    this.toastr.error('Thử nghiệm thông báo lỗi.', 'Lỗi');
    this.toastr.warning('Cảnh báo điều gì đó...', 'Cảnh báo');
    this.toastr.info('Đây là thông tin thêm.', 'Thông tin');
  }
}
