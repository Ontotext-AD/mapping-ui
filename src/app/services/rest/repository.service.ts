import {Injectable} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {environment} from 'src/environments/environment';
import {map, switchMap} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {SPARQL_AUTOCOMPLETE, SPARQL_PREDICATES, SPARQL_TYPES} from '../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  apiUrl = environment.repositoryApiUrl;

  constructor(protected httpClient: HttpClient, protected cookies: CookieService) {
  }

  getAPIURL(apiName: string) : Observable<string> {
    const repo = this.getCookie('com.ontotext.graphdb.repository');
    return (repo)? of(`${this.apiUrl}/${repo}${apiName}`) : EMPTY;
  }

  private getCookie(cookieName) : string {
    return this.cookies.get(cookieName + this.getPort());
  }

  private getPort() {
    let port = window.location.port;
    if (!port) {
      if (window.location.protocol == 'https:') {
        port = '443';
      } else {
        port = '80';
      }
    }
    return port;
  }

  getNamespaces() : Observable<{ [p: string]: string }> {
    return this.getAPIURL('/namespaces').pipe(switchMap((fullUrl) => {
      return this.httpClient.get<any>(fullUrl, {})
          .pipe(map((res) => {
            const obj = {};
            res.results.bindings.forEach((e) => {
              obj[e.prefix.value] = e.namespace.value;
            });
            return obj;
          }));
    }));
  }

  autocompleteTypes(searchKey: string) : Observable<string[]> {
    return this.autocomplete(searchKey, SPARQL_TYPES);
  }

  autocompleteIRIs(searchKey: string) : Observable<string[]> {
    return this.autocomplete(searchKey, SPARQL_AUTOCOMPLETE);
  }

  autocompletePredicates(searchKey: string) : Observable<string[]> {
    return this.autocomplete(searchKey, SPARQL_PREDICATES);
  }

  autocomplete(searchKey: string, query: string) : Observable<string[]> {
    const payload = new HttpParams()
        .set('query', query.replace('KEY_WORD', searchKey));
    return this.getAPIURL('').pipe(switchMap((fullUrl) => {
      return this.httpClient.post<any>(fullUrl, payload)
          .pipe(map((res) => {
            return res.results.bindings.map((binding) => {
              return binding.iri.value;
            });
          }));
    }));
  }
}
