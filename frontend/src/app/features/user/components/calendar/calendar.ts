import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core'; // Import core
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin xem theo tháng
import listPlugin from '@fullcalendar/list'; // Plugin xem theo danh sách
import interactionPlugin from '@fullcalendar/interaction'; // Plugin tương tác
import { CalendarService } from '../../../../core/services/calendar/calendar-service';
import { CommonModule, formatDate } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarComponent {
  calendarEvents: EventInput[] = [];

  // Cấu hình lịch
  calendarOptions: CalendarOptions = {
    height: 'auto',
    aspectRatio: 2,
    expandRows: true,
    plugins: [dayGridPlugin, listPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    initialView: window.innerWidth < 768 ? 'listWeek' : 'dayGridMonth',
    editable: false,
    events: this.calendarEvents, // Bind biến sự kiện vào đây

    datesSet: (arg) => {
      this.loadEvents(arg.startStr, arg.endStr);
    },

    // Xử lý khi click vào task
    eventClick: (info) => {
      alert('Bạn vừa bấm vào task: ' + info.event.title);
      // Mở modal chi tiết task ở đây...
    },
    handleWindowResize: true,

    // Hàm này chạy khi resize, giúp đổi view động (tuỳ chọn nâng cao)
    windowResize: (arg) => {
      if (arg.view.type === 'dayGridMonth' && window.innerWidth < 768) {
        this.calendarOptions.initialView = 'listWeek'; // Gợi ý đổi view
      }
    }
  };

  constructor(private calendarService: CalendarService) { }

  loadEvents(start: string, end: string) {
    const startDate = start.split('T')[0];
    const endDate = end.split('T')[0];

    this.calendarService.getTasks(startDate, endDate).subscribe({
      next: (res: any) => {
        if (res.success) {
          const tasks = res.data.map((task: any) => ({
            id: task.task_id.toString(),
            title: task.task_name,
            start: task.start_date, // Ngày bắt đầu
            end: task.due_date,     // Ngày kết thúc

            // Tô màu theo Project
            backgroundColor: task.project?.color || '#3b82f6',
            borderColor: task.project?.color || '#3b82f6',

            // Lưu thêm data gốc để dùng khi click
            extendedProps: {
              priority: task.priority,
              status: task.status,
              creator: task.creator?.full_name
            }
          }));

          // Cập nhật lại lịch
          this.calendarOptions.events = tasks;
        }
      },
      error: (err) => console.error('Lỗi tải lịch:', err)
    });
  }
}
