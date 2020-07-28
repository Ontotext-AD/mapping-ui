import {Injectable} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {environment} from 'src/environments/environment';
import {catchError, map, switchMap} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {ErrorReporterService} from '../error-reporter.service';
import {SPARQL_AUTOCOMPLETE, SPARQL_PREDICATES, SPARQL_TYPES} from '../../utils/constants';
import {RestService} from "./rest.service";
import {ActivatedRoute} from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class RepositoryService extends RestService {
  apiUrl = environment.repositoryApiUrl;


  constructor(protected httpClient: HttpClient,
              private errorReporterService: ErrorReporterService,
              protected route: ActivatedRoute,
              protected cookies: CookieService,
              ) {
    super(route, cookies);
  }

  getAPIURL(apiName: string): Observable<string> {
    const repo = this.getCookie('com.ontotext.graphdb.repository');
    return (repo) ? of(`${this.apiUrl}/${repo}${apiName}`) : EMPTY;
  }



  getNamespaces(): Observable<{ [p: string]: string }> {
    return this.getAPIURL('/namespaces').pipe(switchMap((fullUrl) => {
      return this.httpClient.get<any>(fullUrl, this.httpOptions).pipe(map((res) => {
        const obj = {};
        res.results.bindings.forEach((e) => {
          obj[e.prefix.value] = e.namespace.value;
        });
        return obj;
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
      return this.httpClient.post<any>(fullUrl, payload, this.httpOptions).pipe(map((res) => {
        return res.results.bindings.map((binding) => {
          return binding.iri.value;
        });
      }), catchError((error) => this.errorReporterService.handleError('Loading columns failed.', error, false)));
    }));
  }
}
