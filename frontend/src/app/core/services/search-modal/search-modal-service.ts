import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class SearchModalService {
  private openSource = new Subject<void>();
  open$ = this.openSource.asObservable();

  open() {
    this.openSource.next();
  }
}
