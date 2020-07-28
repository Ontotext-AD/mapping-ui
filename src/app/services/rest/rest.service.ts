import {environment} from 'src/environments/environment';
import {HttpHeaders} from '@angular/common/http';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable, of, EMPTY} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {CookieService} from "ngx-cookie-service";

export class RestService {
  dataProviderID: Observable<string>;
  apiUrl = environment.restApiUrl;
  httpHeaders: any;

  static getPort() {
    let port = window.location.port;
    if (!port) {
      if (window.location.protocol === 'https:') {
        port = '443';
      } else {
        port = '80';
      }
    }
    return port;
  }

  getCookie(cookieName): string {
    return this.cookies.get(cookieName + RestService.getPort());
  }


  constructor(protected route: ActivatedRoute,
              protected cookies: CookieService) {
    const auth = this.getCookie('com.ontotext.graphdb.auth');
    this.httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': auth,
    });
    this.dataProviderID = this.route.queryParams.pipe(switchMap((params: Params) => {
      return (params.dataProviderID) ? of(params.dataProviderID) : EMPTY;
    }));
  }

  readonly httpOptions = {
    /**
     * ESLint incorrectly finds it as error.
     */
    // eslint-disable-next-line no-invalid-this
    headers: this.httpHeaders,
  };
}
