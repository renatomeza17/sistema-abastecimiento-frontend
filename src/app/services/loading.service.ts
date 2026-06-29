import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequest = 0;
  private loadingSubject = new Subject<boolean>();
  loading$ = this.loadingSubject.asObservable();
  private hideTimeout: any = null;

  show() {
    this.activeRequest++;
    if (this.activeRequest === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide() {
    this.activeRequest--;
    if (this.activeRequest === 0 && !this.hideTimeout) {
      this.hideTimeout = setTimeout(() => {
        this.hideTimeout = null;
        this.loadingSubject.next(false);
      }, 300);
    }
  }
}
