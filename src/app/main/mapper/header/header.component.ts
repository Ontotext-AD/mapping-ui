import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {environment} from 'src/environments/environment';
import {DialogService} from 'src/app/main/components/dialog/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {MessageService} from 'src/app/services/message.service';
import {ChannelName} from 'src/app/services/channel-name.enum';
import {ViewMode} from 'src/app/services/view-mode.enum';
import {plainToClass} from 'class-transformer';
import {Observable, throwError} from 'rxjs';
import {NotificationService} from 'src/app/services/notification.service';
import {DIRTY_MAPPING, PRISTINE_MAPPING} from '../../../utils/constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends OnDestroyMixin implements OnInit {
  @Output() onJsonUpload: EventEmitter<MappingDefinitionImpl> = new EventEmitter<MappingDefinitionImpl>();
  @Input() rdfMapping: Observable<{mapping: MappingDefinitionImpl, isDirty: boolean}>;
  @ViewChild('fileInput') fileInput;

  isMappingDirty: boolean;
  isSavingInProgress: boolean;
  isRdfGenerationInProgress: boolean;
  isSparqlGenerationInProgress: boolean;
  isRdfGenerationAllowed = true;
  ViewMode = ViewMode;
  selectedFile: File;

  constructor(private modelManagementService: ModelManagementService,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private messageService: MessageService,
              private notificationService: NotificationService) {
    super();
  }

  ngOnInit(): void {
    this.rdfMapping.pipe(untilComponentDestroyed(this))
        .subscribe((rdfMapping) => this.toggleGenerateRdfButton(rdfMapping.mapping));

    this.messageService.read(ChannelName.UpdateMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe((event) => this.toggleGenerateRdfButton(event.getMessage()));

    this.messageService.read(ChannelName.DirtyMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe((event) => {
          // This is used for communication between iframes. The message is processed by logic in
          // the scripts of the rdf-mapper-extension.
          // The purpose is to trigger confirmation dialog, when the user tries to leave the page
          // and there are some unsaved changes.
          // Also, this isn't the correct place to do that, because we are in a child component...
          // It is what it is, I guess.

          this.isMappingDirty = event.getMessage();
          // TODO Replace the wildcard with the domain on which WB is running.
          // See https://ontotext.atlassian.net/browse/GDB-5406
          if (this.isMappingDirty) {
            window.parent.postMessage(DIRTY_MAPPING, '*'); // nosonar
          } else {
            window.parent.postMessage(PRISTINE_MAPPING, '*'); // nosonar
          }
        });

    this.messageService.read(ChannelName.MappingSaved)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.isSavingInProgress = false;
        });

    this.messageService.read(ChannelName.ProgressCancelled)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.isSavingInProgress = false;
          this.isRdfGenerationInProgress = false;
          this.isSparqlGenerationInProgress = false;
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

  getRDF(): void {
    this.isRdfGenerationInProgress = true;
    this.messageService.publish(ChannelName.GetRDF);
  }

  getSPARQL(): void {
    this.isSparqlGenerationInProgress = true;
    this.messageService.publish(ChannelName.GetSPARQL);
  }

  public getJsonMapping() {
    this.messageService.publish(ChannelName.GetJSONMapping);
  }

  togglePreview($event): void {
    this.messageService.publish(ChannelName.ViewMode, $event);
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
          this.modelManagementService.isValidMapping(mapping);

          this.dialogService.confirm({
            content: this.translateService.instant('MESSAGES.CONFIRM_MAPPING_UPLOAD'),
          }).pipe(untilComponentDestroyed(this))
              .subscribe((res) => {
                if (res) {
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

  private toggleGenerateRdfButton(mapping) {
    this.isRdfGenerationAllowed = mapping.getSubjectMappings().length > 0;
  }

  private showErrorWarning(message?: any) {
    this.notificationService.error(message || this.translateService.instant('MESSAGES.MAPPING_UPLOAD_ERROR'));
  }
}
