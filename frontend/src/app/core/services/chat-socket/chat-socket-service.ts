import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {

  constructor(private socket: Socket) { }

  joinRoom(conve_id: number | string) {
    this.socket.emit('joinRoom', conve_id);
  }
  sendMessage(data: { conve_id: number, sender_id: number, content: string }) {
    this.socket.emit('sendMessage', data);
  }
  onNewMessage(): Observable<any> {
    return this.socket.fromEvent('receiveMessage');
  }
  onSendMessageError(): Observable<any> {
    return this.socket.fromEvent('sendMessageError');
  }
}
