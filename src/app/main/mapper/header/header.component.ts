import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {environment} from 'src/environments/environment';
import {Convert} from 'src/app/models/mapping-definition';
import {DialogService} from 'src/app/main/components/dialog/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {MessageService} from 'src/app/services/message.service';
import {ChannelName} from 'src/app/services/channel-name.enum';

export interface JSONDialogData {
  mapping
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends OnDestroyMixin implements OnInit {
  @Input() mapping: MappingDefinitionImpl;
  isMappingDirty: boolean;

  constructor(public dialog: MatDialog,
              private modelManagementService: ModelManagementService,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private messageService: MessageService) {
    super();
  }

  ngOnInit(): void {
    this.messageService.read(ChannelName.DirtyMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe((event) => {
          this.isMappingDirty = event.getMessage();
        });
  }

  saveMapping(): void {
    this.messageService.publish(ChannelName.SaveMapping);
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
    this.messageService.publish(ChannelName.GetRDF);
  }

  getSPARQL(): void {
    this.messageService.publish(ChannelName.GetSPARQL);
  }

  preview(): void {
    this.messageService.publish(ChannelName.PreviewMapping);
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
            this.messageService.publish(ChannelName.NewMapping);
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
