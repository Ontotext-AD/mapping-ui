import {Injectable} from '@angular/core';
import {RestService} from './rest.service';
import {ErrorReporterService} from '../error-reporter.service';
import {environment} from 'src/environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Observable, of, EMPTY} from 'rxjs';
import {map, switchMap, catchError} from 'rxjs/operators';
import {EMPTY_MAPPING} from '../../utils/constants';
import {RepositoryService} from './repository.service';
import {Namespaces} from '../../models/namespaces';

@Injectable({
  providedIn: 'root',
})
export class MappingDefinitionService extends RestService {
  constructor(protected httpClient: HttpClient,
              protected route: ActivatedRoute,
              protected repositoryService: RepositoryService,
              private errorReporterService: ErrorReporterService) {
    super(route);
    this.apiUrl = environment.mappingApiUrl;
  }

  static createNewMapping(name) {
    const newMapping = EMPTY_MAPPING;
    newMapping.baseIRI = name;
    newMapping.subjectMappings = [];
    return newMapping;
  }

  static getBaseNamespace(namespaces: {}) {
    return namespaces[''];
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
    return this.repositoryService.getNamespaces().pipe(switchMap((name) => {
      if (MappingDefinitionService.getBaseNamespace(name)) {
        return this.getDefinition(name);
      }
      return this.repositoryService.getBaseURL().pipe(switchMap((name) => {
        return this.getDefinition(name);
      }));
    }));
  }

  private getDefinition(name: Namespaces) {
    return this.getAPIURL('/core/get-models/').pipe(switchMap((fullUrl) => {
      return this.httpClient.get<JSON>(fullUrl, this.httpOptions).pipe(map((json) => {
        if (!json['overlayModels']['mappingDefinition']) {
          return MappingDefinitionService.createNewMapping(name);
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
