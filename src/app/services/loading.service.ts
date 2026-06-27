import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequest = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show() {
    this.activeRequest++;
    if (this.activeRequest === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide() {
    this.activeRequest--;
    if (this.activeRequest === 0) {
      this.loadingSubject.next(false);
    }
  }
}
