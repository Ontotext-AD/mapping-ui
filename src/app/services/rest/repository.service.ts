import {Injectable} from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {environment} from 'src/environments/environment';
import {catchError, map, switchMap} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ErrorReporterService} from '../error-reporter.service';
import {AutocompleteService} from './autocomplete.service';
import {SPARQL_AUTOCOMPLETE, SPARQL_IRI_DESCRIPTION, SPARQL_PREDICATES, SPARQL_TYPES} from '../../utils/constants';
import {Namespaces} from '../../models/namespaces';

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  apiUrl = environment.repositoryApiUrl;

  constructor(protected httpClient: HttpClient,
              private autocompleteService: AutocompleteService,
              private errorReporterService: ErrorReporterService) {
  }

  getAPIURL(apiName: string): Observable<string> {
    return of(`${this.apiUrl}/repository_placeholder${apiName}`);
  }

  getNamespaces(): Observable<Namespaces> {
    return this.getAPIURL('/namespaces').pipe(switchMap((fullUrl) => {
      return this.httpClient.get<any>(fullUrl, {}).pipe(map((res) => {
        const obj = {};
        res.results.bindings.forEach((e) => {
          obj[e.prefix.value] = e.namespace.value;
        });
        return obj;
      }), catchError((error) => this.errorReporterService.handleError('Loading namespaces failed.', error)));
    }));
  }

  autocompleteTypes(searchKey: string): Observable<string[]> {
    return this.executeQueryForIRI(searchKey, SPARQL_TYPES, 'iri');
  }

  autocompleteIRIs(searchKey: string): Observable<string[]> {
    return this.executeQueryForIRI(searchKey, SPARQL_AUTOCOMPLETE, 'iri');
  }

  autocompletePredicates(searchKey: string): Observable<string[]> {
    return this.executeQueryForIRI(searchKey, SPARQL_PREDICATES, 'iri');
  }

  getIriDescription(iri: string): Observable<string[]> {
    return this.executeQueryForIRI(iri, SPARQL_IRI_DESCRIPTION, 'description');
  }

  executeQueryForIRI(iri: string, query: string, binding: string): Observable<string[]> {
    if (!this.autocompleteService.isAutocompleteEnabled()) {
      return EMPTY;
    }
    const payload = new HttpParams().set('query', query.replace('{{iri}}', iri));
    return this.getAPIURL('').pipe(switchMap((fullUrl) => {
      return this.httpClient.post<any>(fullUrl, payload).pipe(map((res) => {
        return res.results.bindings.map((bindingArray) => {
          return bindingArray[binding].value;
        });
      }), catchError((error) => this.errorReporterService.handleError('Loading columns failed.', error, false)));
    }));
  }

  isAutocompleteEnabled() {
    return this.autocompleteService.isAutocompleteEnabled();
  }

  public filterNamespace(namespaces: Namespaces, value: string): object[] {
    return Object.entries(namespaces).filter(([prefix]) => prefix.toLowerCase().startsWith(value.toLowerCase()))
        .map((([prefix, pValue]) => ({prefix, pValue})));
  }
}
