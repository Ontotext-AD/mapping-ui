import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {environment} from 'src/environments/environment';
import {DialogService} from 'src/app/main/components/dialog/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {MessageService} from 'src/app/services/message.service';
import {ChannelName} from 'src/app/services/channel-name.enum';
import {ViewMode} from 'src/app/services/view-mode.enum';
import {classToClass, plainToClass} from 'class-transformer';
import {Convert} from 'src/app/models/mapping-definition';
import {throwError} from 'rxjs';
import {NotificationService} from 'src/app/services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends OnDestroyMixin implements OnInit {
  @Output() onJsonUpload:EventEmitter<MappingDefinitionImpl> = new EventEmitter<MappingDefinitionImpl>();
  @ViewChild('fileInput') fileInput;

  isMappingDirty: boolean;
  isSavingInProgress: boolean;
  isRdfGenerationInProgress: boolean;
  isSparqlGenerationInProgress: boolean;
  ViewMode = ViewMode;
  selectedFile: File

  constructor(private modelManagementService: ModelManagementService,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private messageService: MessageService,
              private notificationService: NotificationService) {
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

    this.messageService.read(ChannelName.RDFGenerated)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.isRdfGenerationInProgress = false;
        });

    this.messageService.read(ChannelName.SparqlGenerated)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.isSparqlGenerationInProgress = false;
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
    this.isRdfGenerationInProgress = true;
    this.messageService.publish(ChannelName.GetRDF);
  }

  getSPARQL(): void {
    this.isSparqlGenerationInProgress = true;
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

  public onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.fileInput.nativeElement.value = '';
    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, 'UTF-8');
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') {
        try {
          const result = JSON.parse(fileReader.result);
          const mapping = plainToClass(MappingDefinitionImpl, result);
          this.checkMappingValidity(mapping);

          this.dialogService.confirm({
            content: this.translateService.instant('MESSAGES.CONFIRM_MAPPING_UPLOAD'),
          }).pipe(untilComponentDestroyed(this))
              .subscribe((result) => {
                if (result) {
                  this.onJsonUpload.emit(mapping);
                }
              });
        } catch (e) {
          this.showErrorWarning(e.message);
        }
      } else {
        this.showErrorWarning();
      }
    };
    fileReader.onerror = (error) => {
      throwError(error);
    };
  }

  private checkMappingValidity(newMapping) {
    const mapping = classToClass(newMapping);
    this.modelManagementService.removePreview(mapping);
    Convert.mappingDefinitionToJson(mapping);
  }

  private showErrorWarning(message?: any) {
    this.notificationService.error(message || this.translateService.instant('MESSAGES.MAPPING_UPLOAD_ERROR'));
  }
}
