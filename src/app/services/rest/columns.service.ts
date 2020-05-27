import {Injectable} from '@angular/core';
import {RestService} from 'src/app/services/rest/rest.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';


import {Source} from "src/app/models/source";
import { Response } from 'selenium-webdriver/http';


@Injectable({
  providedIn: 'root',
})
export class ColumnsService extends RestService {
  constructor(protected httpClient: HttpClient) {
    super();
  }

  getColumns(): Observable<Array<Source>> {
    return this.httpClient.get<Array<Source>>(`${this.apiUrl}/`, this.httpOptions)
    .pipe(map(res => res.map(function(c) {return new Source(c)})));
  }
}
