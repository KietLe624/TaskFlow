import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Import các service vừa tạo
import { ChatRestService } from '../../../../core/services/chat/chat-rest-service';
import { ChatSocketService } from '../../../../core/services/chat-socket/chat-socket-service';
import { AttachmentService } from '../../../../core/services/attachment/attachment-service';
import { AuthService } from '../../../../core/services/auth/auth';

// Import các component con
import { UserAvatarComponent } from '../user-avatar/user-avatar';

@Component({
  selector: 'app-chatbox',
  imports: [CommonModule, FormsModule, UserAvatarComponent],
  templateUrl: './chatbox.html',
  styleUrls: ['./chatbox.css'],
})
export class ChatboxComponent implements OnInit, OnDestroy {
  @Input() conve_id!: number; // ID phòng chat (vd: từ @Input() của tab Thảo luận)
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  messages: any[] = [];
  newMessageContent: string = '';
  currentUserId: number = 0;
  isUploading = false;
  isLoadingHistory = true;

  private msgSub!: Subscription;
  private errSub!: Subscription;

  constructor(
    private chatRestService: ChatRestService,
    private chatSocketService: ChatSocketService,
    private attachmentService: AttachmentService,
    private authService: AuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    if (!this.conve_id) {
      console.error('ChatBox: Không có conve_id!');
      this.isLoadingHistory = false;
      return;
    }

    this.currentUserId = this.authService.getUserIdFromToken();

    // 1. Tham gia phòng chat qua Socket
    this.chatSocketService.joinRoom(this.conve_id);

    // 2. Tải lịch sử tin nhắn
    this.loadHistory();

    // 3. Lắng nghe tin nhắn mới
    this.msgSub = this.chatSocketService.onNewMessage().subscribe((message) => {
      this.messages.push(message);
      this.cdr.detectChanges(); // Báo Angular cập nhật view
      this.scrollToBottom();
    });

    // 4. Lắng nghe lỗi (nếu có)
    this.errSub = this.chatSocketService
      .onSendMessageError()
      .subscribe((error) => {
        this.toastr.error(error.error || 'Không thể gửi tin nhắn');
      });
    afterNextRender(() => {
      this.scrollToBottom();
    });
  }

  ngOnDestroy(): void {
    // Rời khỏi subscription khi component bị hủy
    this.msgSub?.unsubscribe();
    this.errSub?.unsubscribe();
  }

  loadHistory(): void {
    this.isLoadingHistory = true;
    this.chatRestService.getMessages(this.conve_id).subscribe({
      next: (history) => {
        this.messages = history;
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (err) => {
        this.toastr.error('Lỗi tải lịch sử tin nhắn');
        this.isLoadingHistory = false;
      },
    });
  }

  sendText(): void {
    if (!this.newMessageContent.trim()) return;

    // Gửi qua socket
    this.chatSocketService.sendMessage({
      conve_id: this.conve_id,
      sender_id: this.currentUserId,
      content: this.newMessageContent.trim(),
    });
    this.newMessageContent = '';
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    this.toastr.info(`Đang tải lên: ${file.name}...`);

    this.attachmentService
      .uploadFile(file, { conve_id: this.conve_id })
      .subscribe({
        next: (res) => {
          // Backend (controller uploadAttachment) sẽ emit socket
          // Chúng ta không cần làm gì ở đây, chỉ cần chờ `onNewMessage`
          this.isUploading = false;
        },
        error: (err) => {
          this.isUploading = false;
          this.toastr.error(`Lỗi tải file: ${err.message || 'Thất bại'}`);
        },
      });
    event.target.value = null; // Reset input
  }

  scrollToBottom(): void {
    // Dùng setTimeout để đợi Angular render xong message mới
    setTimeout(() => {
      try {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      } catch (err) { }
    }, 50);
  }

  selectedFiles: File[] = [];

  // Xóa file khỏi preview
  removeFile(file: File) {
    this.selectedFiles = this.selectedFiles.filter((f) => f !== file);
  }
  sendMessage() {
    if (!this.newMessageContent.trim() && this.selectedFiles.length === 0)
      return;

    // Gửi file trước
    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file) => {
        this.attachmentService
          .uploadFile(file, { conve_id: this.conve_id })
          .subscribe({
            next: () => { }, // backend sẽ emit socket → onNewMessage sẽ bắt
            error: (err) => this.toastr.error('Upload file thất bại'),
          });
      });
      this.selectedFiles = [];
    }

    // Gửi text
    if (this.newMessageContent.trim()) {
      this.chatSocketService.sendMessage({
        conve_id: this.conve_id,
        sender_id: this.currentUserId,
        content: this.newMessageContent.trim(),
      });
      this.newMessageContent = '';
    }
  }

  // Helper format file size
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
