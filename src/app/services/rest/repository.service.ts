import {Injectable} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {environment} from 'src/environments/environment';
import {catchError, map, switchMap} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {ErrorReporterService} from '../error-reporter.service';
import {SPARQL_AUTOCOMPLETE, SPARQL_PREDICATES, SPARQL_TYPES} from '../../utils/constants';
import {RestService} from './rest.service';
import {Namespace} from "../../models/namespace";

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  apiUrl = environment.repositoryApiUrl;


  constructor(protected httpClient: HttpClient,
              protected cookies: CookieService,
              private errorReporterService: ErrorReporterService) {
  }

  getAPIURL(apiName: string): Observable<string> {
    const repo = this.getCookie('com.ontotext.graphdb.repository');
    return (repo) ? of(`${this.apiUrl}/${repo}${apiName}`) : EMPTY;
  }

  private getCookie(cookieName): string {
    return this.cookies.get(cookieName + RestService.getPort());
  }

  getNamespaces(): Observable<Namespace[]> {
    return this.getAPIURL('/namespaces').pipe(switchMap((fullUrl) => {
      return this.httpClient.get<any>(fullUrl, {}).pipe(map((res) => {
        return [];
        return res.results.bindings.forEach((e) => {
          return new Namespace(e.prefix.value, e.namespace.value);
        });
      }), catchError((error) => this.errorReporterService.handleError('Loading namespaces failed.', error)));
    }));
  }

  autocompleteTypes(searchKey: string): Observable<string[]> {
    return this.autocomplete(searchKey, SPARQL_TYPES);
  }

  autocompleteIRIs(searchKey: string): Observable<string[]> {
    return this.autocomplete(searchKey, SPARQL_AUTOCOMPLETE);
  }

  autocompletePredicates(searchKey: string): Observable<string[]> {
    return this.autocomplete(searchKey, SPARQL_PREDICATES);
  }

  autocomplete(searchKey: string, query: string): Observable<string[]> {
    const payload = new HttpParams().set('query', query.replace('KEY_WORD', searchKey));
    return this.getAPIURL('').pipe(switchMap((fullUrl) => {
      return this.httpClient.post<any>(fullUrl, payload).pipe(map((res) => {
        return res.results.bindings.map((binding) => {
          return binding.iri.value;
        });
      }), catchError((error) => this.errorReporterService.handleError('Loading columns failed.', error, false)));
    }));
  }
}
