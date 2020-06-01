import {environment} from 'src/environments/environment';
import {HttpHeaders} from '@angular/common/http';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

export class RestService {
  dataProviderID: Observable<string>;
  apiName: String = '';
  apiUrl = environment.apiUrl;

  constructor(protected route: ActivatedRoute) {
    this.dataProviderID = this.route.queryParams.pipe(switchMap((params: Params) => {
      return (params.dataProviderID) ? of(params.dataProviderID) : of('');
    }));
  }

  getAPIURL() : Observable<string> {
    return this.dataProviderID.pipe(switchMap((dataProviderID) => {
      return of(`${this.apiUrl}` + this.apiName + ((dataProviderID) ? dataProviderID : ''));
    }));
  }


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
