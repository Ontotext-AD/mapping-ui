import {environment} from 'src/environments/environment';
import {HttpHeaders} from '@angular/common/http';

export class RestService {
  apiUrl = environment.apiUrl;

  httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  readonly httpOptions = {
    /**
     * ESLint incorrectly finds it as error.
     */
    // eslint-disable-next-line no-invalid-this
    headers: this.httpHeaders,
  };
}
