import {Injectable} from '@angular/core';
import {RestService} from 'src/app/services/rest/rest.service';
import {ErrorReporterService} from '../error-reporter.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of, EMPTY} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Source} from 'src/app/models/source';
import {environment} from 'src/environments/environment';
import {ActivatedRoute} from '@angular/router';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {Column} from '../../models/mapping-definition';

@Injectable({
  providedIn: 'root',
})
export class MapperService extends RestService {
  constructor(protected httpClient: HttpClient,
              protected route: ActivatedRoute,
              private errorReporterService: ErrorReporterService) {
    super(route);
    this.apiUrl = environment.restApiUrl;
  }

  getAPIURL(apiName: string): Observable<string> {
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
      return this.httpClient.get<Array<Source>>(fullUrl, this.httpOptions).pipe(map((res) => res.map((c) => new Source(c))),
          catchError((error) => this.errorReporterService.handleError('Loading columns failed.', error)));
    }));
  }

  getRDF(mappingDefinition: MappingDefinitionImpl): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({Accept: 'text/turtle'}),
      responseType: 'blob' as 'json',
    };
    return this.getAPIURL('/rdf/').pipe(switchMap((fullUrl) => {
      return this.httpClient.post(fullUrl, mappingDefinition, httpOptions).pipe(
          catchError((error) => this.errorReporterService.handleError('Loading rdf failed.', error)));
    }));
  }

  preview(mappingDefinition: MappingDefinitionImpl): Observable<any> {
    return this.getAPIURL('/preview/').pipe(switchMap((fullUrl) => {
      return this.httpClient.post(fullUrl, mappingDefinition).pipe(
          catchError((error) => this.errorReporterService.handleError('Loading preview failed.', error)));
    }));
  }

  previewGREL(valueSource: Column, grelExpression: string, limit?: number): Observable<Array<any>> {
    const payload = {valueSource, grel: grelExpression};
    return this.getAPIURL('/grel/').pipe(switchMap((fullUrl) => {
      return this.httpClient.post<Array<any>>(fullUrl + '?limit=' + (limit || 10), payload).pipe(
          catchError((error) => this.errorReporterService.handleError('Loading grel failed.', error)));
    }));
  }

  getSPARQL(mappingDefinition: MappingDefinitionImpl): Observable<string> {
    return this.getAPIURL('/sparql/').pipe(switchMap((fullUrl) => {
      return this.httpClient.post(fullUrl, mappingDefinition,
          {headers: this.httpOptions.headers, responseType: 'text'})
          .pipe(catchError((error) => this.errorReporterService.handleError('Loading sparql failed.', error)));
    }));
  }
}
