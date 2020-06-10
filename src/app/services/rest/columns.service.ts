import {Injectable} from '@angular/core';
import {RestService} from 'src/app/services/rest/rest.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Source} from 'src/app/models/source';
import {environment} from 'src/environments/environment';


import {ActivatedRoute} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ColumnsService extends RestService {
  constructor(protected httpClient: HttpClient,
              protected route: ActivatedRoute) {
    super(route);
    this.apiName = '/columns/';
    this.apiUrl = environment.restApiUrl;
  }

  getColumns(): Observable<Array<Source>> {
    return this.getAPIURL().pipe(switchMap((fullUrl) => {
      return this.httpClient.get<Array<Source>>(fullUrl, this.httpOptions)
          .pipe(map((res) => res.map((c) => new Source(c))));
    }));
  }
}
