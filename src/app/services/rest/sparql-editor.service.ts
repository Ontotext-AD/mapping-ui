import {Injectable} from '@angular/core';
import {RestService} from 'src/app/services/rest/rest.service';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {ErrorReporterService} from '../error-reporter.service';
import {environment} from 'src/environments/environment';
import {Observable, of, EMPTY} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {YasguiStorageConfig} from 'src/app/models/sparql-editor/yasgui-storage-config';
import {GenerationSparqlType} from 'src/app/models/sparql-editor/sparql-query-type.enum';

/**
 * Service providing the link to the backend logic related to the editor service.
 *
 * @author A. Kunchev
 */
@Injectable({
  providedIn: 'root',
})
export class SparqlEditorService extends RestService {
  constructor(
    protected httpClient: HttpClient,
    protected route: ActivatedRoute,
    private errorReporterService: ErrorReporterService) {
    super(route);
    this.apiUrl = environment.restSparqlApiUrl;
  }

  /**
   * Generates query based on the given type.
   *
   * @param type of the query that should be generated
   * @returns observable containing the generated query
   */
  generateQuery(type: GenerationSparqlType): Observable<string> {
    return this.buildApiUrl('/query').pipe(switchMap((data) => {
      const params = {project: data.project, type};
      return this.httpClient.get(data.url, {params, responseType: 'text'})
          .pipe(catchError((error) => {
            const msg = `Failed to generate query: ${type}`;
            return this.errorReporterService.handleError(msg, error);
          }));
    }));
  }

  /**
   * Saves the given configuration as part of the current project metadata using the REST API
   * of the SPARQL editor service.
   *
   * @param configuration to the saved in the project
   * @returns observable that may contain error, when the request fails
   */
  saveEditorConfigurations(configuration: YasguiStorageConfig): Observable<any> {
    return this.buildApiUrl('/editor-config').pipe(switchMap((data) => {
      const project = data.project;
      const payload = {project, configuration};
      return this.httpClient.post(data.url, payload, this.httpOptions).pipe(catchError((error) => {
        const msg = `Failed to save editor configuration for project: ${project}`;
        return this.errorReporterService.handleError(msg, error);
      }));
    }));
  }

  /**
   * Retrieves the stored editor configuration from the project metadata.
   *
   * @returns observable containing the retrieved editor configuration
   */
  getEditorConfiguration(): Observable<YasguiStorageConfig> {
    return this.buildApiUrl('/editor-config').pipe(switchMap((data) => {
      return this.httpClient.get<YasguiStorageConfig>(data.url, {params: {project: data.projectId}})
          .pipe(catchError((error) => {
            const msg = `Failed to retrieve editor configuration for project: ${data.project}`;
            return this.errorReporterService.handleError(msg, error);
          }));
    }));
  }

  /**
   * Sets service clause to the given SPARQL query. The clause is generated on the server, where it
   * will warp all statements that are placed in the WHERE clause of the query.
   * When the project has alias, it will be used as identifier for the project URL.
   *
   * @param query to which will be added the service clause
   * @returns string representation of the new query or an error in case of a request failure
   */
  setServiceClause(query: string): Observable<string> {
    return this.buildApiUrl('/set-service').pipe(switchMap((data) => {
      const payload = {project: data.project, query};
      const error = 'Failed to set service clause for the current SPARQL query.';
      return this.executePostWithTextResponse(data.url, payload, error);
    }));
  }

  private executePostWithTextResponse(url: string, payload, errorMsg: string): Observable<string> {
    return this.httpClient
        .post(url, payload, {...this.httpOptions, responseType: 'text'})
        .pipe(catchError((error) => this.errorReporterService.handleError(errorMsg, error)));
  }

  /**
   * Retrieves URL representing link to the configuration remote GraphDB instance with included
   * parameter the provided query, modified to include 'SERVICE' clause, which wraps the statements
   * from the 'WHERE' clause of the original query.
   *
   * Note that the SPARQL query will be encoded when it is added to the URL.
   *
   * @param query which needs to be modified and added to the GraphDB URL
   * @returns observable string representing URL to the GraphDB Workbench with parameter the
   *          provided query
   */
  getGraphDbQueryUrl(query: string): Observable<string> {
    return this.buildApiUrl('/prepare-gdb-request').pipe(switchMap((data) => {
      const payload = {project: data.project, query};
      const error = 'Failed to prepare SPARQL query for the GraphDB Workbench.';
      return this.executePostWithTextResponse(data.url, payload, error);
    }));
  }

  /**
   * Builds the URL of the SPARQL Editor REST API.
   *
   * @param path to be added to the base API URL
   * @returns observable object containing the API URL and the current project identifier
   */
  private buildApiUrl(path: string): Observable<any> {
    return this.dataProviderID.pipe(switchMap((dataProviderID) => {
      if (!dataProviderID) {
        return EMPTY;
      }

      return of({
        url: `${this.apiUrl}${path}`,
        project: dataProviderID,
        projectId: dataProviderID.split(':')[1],
      });
    }));
  }
}
