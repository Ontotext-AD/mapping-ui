import {Injectable, NgZone} from '@angular/core';
import {
  MatSnackBar, MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

/**
 * Notification service which wraps the angular's material snackbar component and
 * allows notifications to be displayed.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  private verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  private duration = 5000;
  private config: {
    duration: number;
    horizontalPosition: MatSnackBarHorizontalPosition;
    verticalPosition: MatSnackBarVerticalPosition;
    panelClass?: string;
  };

  constructor(public snackBar: MatSnackBar,
              private zone: NgZone) {
    this.config = {
      duration: this.duration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    };
  }

  public success(message) {
    this.zone.run(() => {
      this.snackBar.open(message, 'action', this.getSuccessSnackConfig());
    });
  }

  public warning(message) {
    this.zone.run(() => {
      this.snackBar.open(message, 'action', this.getWarningSnackConfig());
    });
  }

  public error(message) {
    this.zone.run(() => {
      this.snackBar.open(message, 'action', this.getErrorSnackConfig());
    });
  }

  private getSuccessSnackConfig() {
    const successConfig = {panelClass: 'success-notification'};
    return {...this.config, ...successConfig};
  }

  private getWarningSnackConfig() {
    const warningConfig = {panelClass: 'warning-notification'};
    return {...this.config, ...warningConfig};
  }

  private getErrorSnackConfig() {
    const errorConfig = {panelClass: 'error-notification'};
    return {...this.config, ...errorConfig};
  }
}
