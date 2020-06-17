import {Injectable} from '@angular/core';
import {RestService} from 'src/app/services/rest/rest.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, EMPTY} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Source} from 'src/app/models/source';
import {environment} from 'src/environments/environment';


import {ActivatedRoute} from '@angular/router';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';

@Injectable({
  providedIn: 'root',
})
export class MapperService extends RestService {
  constructor(protected httpClient: HttpClient,
              protected route: ActivatedRoute) {
    super(route);
    this.apiUrl = environment.restApiUrl;
  }

  getAPIURL(apiName: string) : Observable<string> {
    return this.dataProviderID.pipe(switchMap((dataProviderID) => {
      if (dataProviderID) {
        return of(`${this.apiUrl}${apiName}${dataProviderID}`);
      } else {
        return EMPTY;
      }
    }));
  }

  getColumns(): Observable<Array<Source>> {
    return this.getAPIURL('/columns/').pipe(switchMap((fullUrl) => {
      return this.httpClient.get<Array<Source>>(fullUrl, this.httpOptions)
          .pipe(map((res) => res.map((c) => new Source(c))));
    }));
  }

  getRDF(mappingDefinition: MappingDefinitionImpl): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({'Accept': 'text/turtle'}),
      responseType: 'blob' as 'json',
    };
    return this.getAPIURL('/rdf/').pipe(switchMap((fullUrl) => {
      return this.httpClient.post(fullUrl, mappingDefinition, httpOptions);
    }));
  }

  getSPARQL(mappingDefinition: MappingDefinitionImpl): Observable<string> {
    const httpOptions = this.httpOptions;
    httpOptions['reponseType'] = 'text';
    return this.getAPIURL('/sparql/').pipe(switchMap((fullUrl) => {
      return this.httpClient.post<string>(fullUrl, mappingDefinition, httpOptions);
    }));
  }
}
