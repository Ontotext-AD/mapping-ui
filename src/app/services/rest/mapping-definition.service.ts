import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {ErrorReporterService} from '../error-reporter.service';
import {environment} from 'src/environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Observable, of, EMPTY} from 'rxjs';
import {map, switchMap, catchError} from 'rxjs/operators';
import {EMPTY_MAPPING} from 'src/app/utils/constants';

@Injectable({
  providedIn: 'root',
})
export class MappingDefinitionService extends RestService {
  constructor(protected httpClient: HttpClient,
              protected route: ActivatedRoute,
              private errorReporterService: ErrorReporterService) {
    super(route);
    this.apiUrl = environment.mappingApiUrl;
  }

  getAPIURL(apiName: string): Observable<string> {
    return this.dataProviderID.pipe(switchMap((dataProviderID) => {
      if (dataProviderID) {
        return of(`${this.apiUrl}${apiName}?project=${dataProviderID.substring('ontorefine:'.length)}`);
      } else {
        return EMPTY;
      }
    }));
  }

  getMappingDefinition(): Observable<JSON> {
    return this.getAPIURL('/core/get-models/').pipe(switchMap((fullUrl) => {
      return this.httpClient.get<JSON>(fullUrl, this.httpOptions).pipe(map((json) => {
        if (!json['overlayModels']['mappingDefinition']) {
          return EMPTY_MAPPING;
        }
        return json['overlayModels']['mappingDefinition']['mappingDefinition'];
      }), catchError((error) => this.errorReporterService.handleError('Loading model failed.', error)));
    }));
  }

  saveMappingDefinition(mappingDefinition: JSON) {
    return this.getAPIURL('/mapping-editor/save-rdf-mapping/').pipe(switchMap((fullUrl) => {
      const payload = new HttpParams().set('mapping', encodeURIComponent(JSON.stringify(mappingDefinition)));
      return this.httpClient.post<any>(fullUrl, payload).pipe(catchError((error) => this.errorReporterService.handleError('Mapping save failed.', error)));
    }));
  }
}
