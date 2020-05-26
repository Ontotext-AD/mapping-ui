import {Injectable} from '@angular/core';
import {RestService} from 'src/app/services/rest/rest.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ColumnsService extends RestService {
  constructor(protected httpClient: HttpClient) {
    super();
  }

  getColumnNames(): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/`, this.httpOptions);
  }
}
