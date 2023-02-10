import {environment} from 'src/environments/environment';
import {HttpHeaders} from '@angular/common/http';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable, of, EMPTY} from 'rxjs';
import {switchMap} from 'rxjs/operators';

export type ProjectInfo = {
  refineRepoUrl: {
    relative: string,
    absolute: string
  },
  project: string,
  projectId: string
};

export class RestService {
  dataProviderID: Observable<string>;
  apiUrl = environment.restApiUrl;

  private refineRepoUrlConfig: string;

  constructor(protected route: ActivatedRoute) {
    this.dataProviderID = this.route.queryParams.pipe(switchMap((params: Params) => {
      return (params.dataProviderID) ? of(params.dataProviderID) : EMPTY;
    }));
    this.refineRepoUrlConfig = environment.refineVirtualRepositoryUrl;
  }

  httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  readonly httpOptions = {
    /**
     * ESLint incorrectly finds it as error.
     */
    // eslint-disable-next-line no-invalid-this
    headers: this.httpHeaders,
  };

  /**
   * Builds an object containing information about the current project. It provides the URL of the
   * virtual repository, a project reference (prefixed id) and a pure project identifier.
   *
   * @param idPrefix prefix for the project identifier. It is required for the virtual repo URL
   * @returns observable object containing information about the current project
   */
  getCurrentProjectInfo(): Observable<ProjectInfo> {
    return this.dataProviderID.pipe(switchMap((dataProviderID) => {
      if (!dataProviderID) {
        return EMPTY;
      }

      return of({
        refineRepoUrl: {
          relative: `${this.refineRepoUrlConfig}${dataProviderID}`,
          absolute: `${location.origin}${this.refineRepoUrlConfig.substring(8)}${dataProviderID}`,
        },
        project: dataProviderID,
        projectId: dataProviderID.split(':')[1],
      });
    }));
  }
}
