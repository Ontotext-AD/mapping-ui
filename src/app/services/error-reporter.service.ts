import {Injectable} from '@angular/core';
import {throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {NotificationService} from './notification.service';

/**
 * Service responsible for errors processing and logging them.
 * Also rises notification by default if not configured otherwise.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorReporterService {

  constructor(private notificationService: NotificationService) {
  }

  /**
   * Handles passed error by checking the type and assembling appropriate log message.
   * @param message A message to be displayed.
   * @param error The error to be processed.
   * @param notify If notification should be raised with the provided message.
   * @return Observable<never>
   */
  handleError(message: string, error: HttpErrorResponse, notify: boolean = true) {
    let errorMessage;
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      if (error.status !== 0) {
        errorMessage = `Server error: status ${error.status}, error: ${error.error}`;
      } else {
        errorMessage = error.message;
      }
    }
    console.error(errorMessage);
    if (notify) {
      this.notificationService.error(message);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  }
}
