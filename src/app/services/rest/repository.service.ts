import {Injectable} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {map, switchMap} from 'rxjs/operators';
import {ActivatedRoute, Params} from '@angular/router';
import {HttpClient, HttpParams} from '@angular/common/http';
import {SPARQL_AUTOCOMPLETE, SPARQL_PREDICATES, SPARQL_TYPES} from '../../utils/constants';

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  repository: Observable<string>;
  apiUrl = environment.repositoryApiUrl;

  constructor(protected httpClient: HttpClient, protected route: ActivatedRoute) {
    this.repository = this.route.queryParams.pipe(switchMap((params: Params) => {
      return (params.repository) ? of(params.repository) : EMPTY;
    }));
  }

  getAPIURL(apiName: string) : Observable<string> {
    return this.repository.pipe(switchMap((repoParam) => {
      if (repoParam) {
        return of(`${this.apiUrl}/${repoParam}${apiName}`);
      } else {
        return EMPTY;
      }
    }));
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
