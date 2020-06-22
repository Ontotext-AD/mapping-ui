import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {environment} from 'src/environments/environment';
import {Convert} from 'src/app/models/mapping-definition';
import {DialogService} from 'src/app/main/components/dialog/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';

export interface JSONDialogData {
  mapping
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends OnDestroyMixin implements OnInit {
  @Output() savedMapping = new EventEmitter<void>();
  @Output() onNewMapping = new EventEmitter<void>();
  @Output() onGetRDF = new EventEmitter<void>();
  @Output() onSPARQL = new EventEmitter<void>();
  @Output() onPreview = new EventEmitter<void>();
  @Input() mapping: MappingDefinitionImpl;


  constructor(public dialog: MatDialog,
              private modelManagementService: ModelManagementService,
              private dialogService: DialogService,
              private translateService: TranslateService) {
    super();
  }

  ngOnInit(): void {
  }

  saveMapping(): void {
    this.savedMapping.emit();
  }

  openDialog(): void {
    this.dialog.open(JSONValueDialog, {
      width: '900px',
      height: '600px',
      data: {
        mapping: this.mapping,
      },
    });
  }

  getRDF(): void {
    this.onGetRDF.emit();
  }

  getSPARQL(): void {
    this.onSPARQL.emit();
  }

  preview(): void {
    this.onPreview.emit();
  }

  public isDevEnv() {
    return !environment.production;
  }

  public newMapping() {
    this.dialogService.confirm({
      content: this.translateService.instant('MESSAGES.CONFIRM_NEW_MAPPING'),
    }).pipe(untilComponentDestroyed(this))
        .subscribe((result) => {
          if (result) {
            this.onNewMapping.emit();
          }
        });
  }
}

@Component({
  selector: 'json-mapping-dialog',
  templateUrl: 'json-mapping-dialog.html',
})
export class JSONValueDialog {
  constructor(
    public dialogRef: MatDialogRef<JSONValueDialog>,
    @Inject(MAT_DIALOG_DATA) public data: JSONDialogData,
    private modelManagementService: ModelManagementService) {
  }

  public passTest() {
    this.modelManagementService.removePreview(this.data.mapping);
    return Convert.mappingDefinitionToJson(this.data.mapping);
  }
}
