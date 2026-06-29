import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize} from 'rxjs/operators';
import { LoadingService} from '../services/loading.service';


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const lodingService = inject(LoadingService);
  lodingService.show();
  return next(req).pipe(
    finalize(() => lodingService.hide())
  );
};