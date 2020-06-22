import {TranslateService} from '@ngx-translate/core';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {DialogComponent} from 'src/app/main/components/dialog/dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private matDialog: MatDialog, private translateService: TranslateService) {

  }

  info(config: any): Observable<any> {
    return this.open({...{type: 'info', title: this.translateService.instant('DIALOG.TITLE_INFORMATION')}, ...config});
  }

  error(config: any): Observable<any> {
    return this.open({...{type: 'error', title: this.translateService.instant('DIALOG.TITLE_ERROR')}, ...config});
  }

  warning(config: any): Observable<any> {
    return this.open({...{type: 'warning', title: this.translateService.instant('DIALOG.TITLE_WARNING')}, ...config});
  }

  confirm(config: any): Observable<any> {
    return this.open({...{type: 'confirm', title: this.translateService.instant('DIALOG.TITLE_CONFIRM')}, ...config});
  }

  open(config: any): Observable<any> {
    return this.matDialog.open(DialogComponent, {
      panelClass: 'modal-dialog',
      data: config,
    }).afterClosed();
  }
}
