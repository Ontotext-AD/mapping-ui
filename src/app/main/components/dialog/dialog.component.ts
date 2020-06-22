import {TranslateService} from '@ngx-translate/core';
import {Component, OnInit, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
})
export class DialogComponent implements OnInit {
  constructor(public matDialogRef: MatDialogRef<DialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private translateService: TranslateService) { }

  isConfirm(): boolean {
    return this.data.type === 'confirm';
  }

  ngOnInit(): void {
    if (!this.data.type) {
      throw new Error(`the type of the dialog is mandatory`);
    }

    switch (this.data.type) {
      case 'confirm':
        this.data.title = this.data.title || this.translateService.instant('DIALOG.TITLE_CONFIRM');
        this.data.icon = 'warning';
        break;
      case 'info':
        this.data.title = this.data.title || this.translateService.instant('DIALOG.TITLE_INFORMATION');
        this.data.icon = 'info';
        break;
      case 'error':
        this.data.title = this.data.title || this.translateService.instant('DIALOG.TITLE_ERROR');
        this.data.styleClass = 'warn';
        this.data.icon = 'error';
        break;
      case 'warning':
        this.data.title = this.data.title || this.translateService.instant('DIALOG.TITLE_WARNING');
        this.data.styleClass = 'orange-400';
        this.data.icon = 'warning';
        break;
      default:
        throw new Error(`unsupported dialog type: ${this.data.type}`);
    }
  }
}
