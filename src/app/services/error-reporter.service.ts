import {Injectable} from '@angular/core';
import {throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {NotificationService} from './notification.service';

/**
 * Service responsible for errors processing and logging them.
 * Also rises notification by default if not configured otherwise.
 */
@Injectable({
  providedIn: 'root',
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
    let errorMessage = message;
    if (error.error instanceof ErrorEvent) {
      errorMessage = this.clientError(error, notify);
      throwError(() => new Error(errorMessage));
    } else {
      const errMessage = this.backendError(error, message, notify);
      if (errMessage instanceof Promise) {
        errMessage.then((err) => throwError(() => new Error(err)));
      } else {
        return throwError(() => new Error(errorMessage));
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  clientError(error: any, notify: boolean) {
    // A client-side or network error occurred. Handle it accordingly.
    const errorMessage = `An error occurred: ${error.error.message}`;
    this.notify(notify, errorMessage);
    // return an observable with a user-facing error message
    return errorMessage;
  }

  backendError(error: any, message: string, notify: boolean) {
    // The backend returned an unsuccessful response code.
    // The response body may contain clues as to what went wrong
    let errorMessage: string;
    if (error.status !== 0) {
      // There is a case when response is returned as a Blob and the error should
      // be resolved by reading the Blob which is async operation
      if (error.error instanceof Blob) {
        return (new Response(error.error)).text().then((errorText) => {
          this.notify(notify, errorText);
          return errorText;
        });
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = error.message;
      }
      this.notify(notify, errorMessage || message);
      return errorMessage;
    }
  }

  notify(shouldNotify: boolean, message: string) {
    if (shouldNotify) {
      this.notificationService.error(message);
    }
  }
}
