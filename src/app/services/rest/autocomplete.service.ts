import {Injectable} from '@angular/core';
import {ErrorReporterService} from '../error-reporter.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {EMPTY, Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {LocalStorageService} from 'src/app/services/local-storage.service';
import {map} from 'rxjs/internal/operators';
import {NotificationService} from '../notification.service';
import {TranslateService} from '@ngx-translate/core';

/**
 * This is a stateful service which maintains an autocomplete enabled flag. The service method
 * {@link autocompleteStatus} must be called during the application bootstrap or periodically
 * retried if it's needed to keep the status in sync.
 */
@Injectable({
  providedIn: 'root',
})
export class AutocompleteService {
  private autocompleteEnabled = false;
  private autocompleteWarningDisplayed = false;

  constructor(private httpClient: HttpClient,
              private localStorageService: LocalStorageService,
              private translateService: TranslateService,
              private notificationService: NotificationService,
              private errorReporterService: ErrorReporterService) {
  }

  autocompleteStatus(): Observable<boolean> {
    const graphDB = this.localStorageService.getGraphDB();
    const repo = this.localStorageService.getCurrentRepository();
    if (graphDB && repo) {
      const httpHeaders = new HttpHeaders({
        'X-GraphDB-Repository': repo,
      });
      const httpOptions = {headers: httpHeaders};
      return this.httpClient.get<boolean>(`${graphDB}/rest/autocomplete/enabled`, httpOptions).pipe(map(
          (status) => this.setAutocompleteStatus(status),
          catchError((error) => this.errorReporterService.handleError('Autocomplete status check failed.', error)),
      ));
    } else {
      return EMPTY;
    }
  }

  isAustocompleteEnabled(): boolean {
    if (!this.autocompleteEnabled && !this.autocompleteWarningDisplayed) {
      const message = this.translateService.instant('MESSAGES.AUTOCOMPLETE_OFF_WARNING');
      this.notificationService.warning(message);
      this.autocompleteWarningDisplayed = true;
    }
    return this.autocompleteEnabled;
  }

  private setAutocompleteStatus(status: boolean) {
    this.autocompleteEnabled = status;
    return status;
  }
}
