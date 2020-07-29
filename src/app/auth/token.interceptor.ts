import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {Observable} from 'rxjs';
import {RestService} from '../services/rest/rest.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(protected cookies: CookieService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        Authorization: this.cookies.get('com.ontotext.graphdb.auth' + RestService.getPort()),
      },
    });
    return next.handle(request);
  }
}
