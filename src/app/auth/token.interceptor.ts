import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LocalStorageService} from 'src/app/services/local-storage.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(protected localStorageService: LocalStorageService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = this.localStorageService.getAuthToken();
    if (auth) {
      request = request.clone({
        setHeaders: {
          Authorization: auth,
        },
      });
    }
    return next.handle(request);
  }
}
