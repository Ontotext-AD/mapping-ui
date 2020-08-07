import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {RestService} from './rest/rest.service';

@Injectable({
  providedIn: 'root',
})
export class CookiesService {
  constructor(protected cookies: CookieService) {
  }

  getRepositoryCookie() {
    return this.cookies.get('com.ontotext.graphdb.repository' + RestService.getPort());
  }
}
