import {Component, Input, OnInit} from '@angular/core';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {environment} from 'src/environments/environment';
import {DialogService} from 'src/app/main/components/dialog/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {MessageService} from 'src/app/services/message.service';
import {ChannelName} from 'src/app/services/channel-name.enum';
import {ViewMode} from 'src/app/services/view-mode.enum';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends OnDestroyMixin implements OnInit {
  @Input() mapping: MappingDefinitionImpl;
  isMappingDirty: boolean;
  isSavingInProgress: boolean;
  ViewMode = ViewMode;

  constructor(private modelManagementService: ModelManagementService,
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

    this.messageService.read(ChannelName.MappingSaved)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.isSavingInProgress = false;
        });
  }

  saveMapping(): void {
    this.isSavingInProgress = true;
    this.messageService.publish(ChannelName.SaveMapping);
  }

  openDialog(): void {
    this.messageService.publish(ChannelName.ViewJSONMapping);
  }

  getRDF(): void {
    this.messageService.publish(ChannelName.GetRDF);
  }

  getSPARQL(): void {
    this.messageService.publish(ChannelName.GetSPARQL);
  }

  togglePreview($event): void {
    this.messageService.publish(ChannelName.ViewMode, $event.value);
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
