import {Injectable} from '@angular/core';
import {RestService} from 'src/app/services/rest/rest.service';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {catchError, Observable, switchMap} from 'rxjs';
import {ErrorReporterService} from '../error-reporter.service';

/**
 * Service providing functionalities from the virtual repository of the current Refine instance.
 *
 * @author A. Kunchev
 */
@Injectable({
  providedIn: 'root',
})
export class RefineRepositoryService extends RestService {
  constructor(
    protected httpClient: HttpClient,
    protected route: ActivatedRoute,
    private errorReporterService: ErrorReporterService) {
    super(route);
  }

  /**
   * Executes SPARQL query using the endpoint of the virtual Refine repository.
   *
   * @param sparql to execute
   * @returns the result from the query execution as text
   */
  executeQuery(sparql: string): Observable<string> {
    return this.getCurrentProjectInfo().pipe(switchMap((data) => {
      const httpOpts = {
        headers: {
          'Content-Type': 'application/sparql-query',
          'Accept': 'text/turtle',
        },
        responseType: 'text' as 'text',
      };
      return this.httpClient.post(data.refineRepoUrl, sparql, httpOpts)
          .pipe(catchError((error) => {
            const msg = 'Failed to execute the provided query.';
            return this.errorReporterService.handleError(msg, error);
          }));
    }));
  }
}
