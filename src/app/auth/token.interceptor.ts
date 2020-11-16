import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {Observable} from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(protected cookies: CookieService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = localStorage.getItem('com.ontotext.graphdb.auth');
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
