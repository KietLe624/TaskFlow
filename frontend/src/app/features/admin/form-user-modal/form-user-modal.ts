import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-user-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './form-user-modal.html',
  styleUrl: './form-user-modal.css'
})
export class FormUserModal {

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  isOpen = false;
  form = {
    username: '',
    email: '',
    full_name: '',
    role: 'member' as 'member' | 'admin'
  };

  open() {
    this.isOpen = true;
  }

  onClose() {
    this.isOpen = false;
    this.close.emit();
  }

  onSubmit() {
    if (!this.form.username || !this.form.email) {
      alert('Vui lòng điền username và email!');
      return;
    }
    this.create.emit(this.form);
    this.onClose();
  }
}
