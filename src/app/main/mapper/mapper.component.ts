import {Component, OnInit} from '@angular/core';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {Source} from 'src/app/models/source';
import {MapperService} from 'src/app/services/rest/mapper.service';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {DOWNLOAD_JSON_FILE, DOWNLOAD_RDF_FILE, EMPTY_MAPPING} from 'src/app/utils/constants';
import {classToClass, plainToClass} from 'class-transformer';
import {MatChipInputEvent} from '@angular/material/chips/chip-input';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ChannelName} from 'src/app/services/channel-name.enum';
import {MessageService} from 'src/app/services/message.service';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';
import {NotificationService} from 'src/app/services/notification.service';
import {TranslateService} from '@ngx-translate/core';
import {Convert} from 'src/app/models/mapping-definition';


@Component({
  selector: 'app-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.scss'],
})
export class MapperComponent extends OnDestroyMixin implements OnInit {
  sources: Array<Source>;
  mapping: MappingDefinitionImpl = plainToClass(MappingDefinitionImpl, EMPTY_MAPPING);
  rdfMapping: BehaviorSubject<{mapping: MappingDefinitionImpl, isDirty:boolean}>;
  rdf: string;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  addOnBlur = true;

  constructor(private modelManagementService: ModelManagementService,
              private mapperService: MapperService,
              private messageService: MessageService,
              private dialog: MatDialog,
              private notificationService: NotificationService,
              private translateService: TranslateService) {
    super();
  }

  ngOnInit(): void {
    this.rdfMapping = new BehaviorSubject<any>({mapping: this.mapping, isDirty: false});

    this.mapperService.getColumns()
        .pipe(untilComponentDestroyed(this))
        .subscribe(
            (data) => {
              this.sources = data;
            });

    this.modelManagementService.getStoredModelMapping()
        .pipe(untilComponentDestroyed(this))
        .subscribe((data) => {
          if (data) {
            this.rdfMapping.next({mapping: data, isDirty: false});
          }
        });

    this.messageService.read(ChannelName.NewMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.rdfMapping.next({mapping: new MappingDefinitionImpl(EMPTY_MAPPING.baseIRI, EMPTY_MAPPING.namespaces, EMPTY_MAPPING.subjectMappings), isDirty: false});
        });

    this.messageService.read(ChannelName.SaveMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.processCommand(() => this.storeModelMapping());
        });

    this.messageService.read(ChannelName.GetRDF)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.processCommand(() => this.onGetRDF());
        });

    this.messageService.read(ChannelName.GetSPARQL)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.processCommand(() => this.onSPARQL());
        });

    this.messageService.read(ChannelName.GetJSONMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.processCommand(() => this.onGetJSON());
        });
  }

  private storeModelMapping() {
    this.modelManagementService.storeModelMapping(this.mapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.messageService.publish(ChannelName.MappingSaved);
        });
  }

  private processCommand(command: any) {
    if (this.modelManagementService.isValidMapping(this.mapping)) {
      command();
    } else {
      this.showErrorMessage();
      this.messageService.publish(ChannelName.ProgressCancelled);
    }
  }

  private showErrorMessage() {
    this.notificationService.error(this.translateService.instant('MESSAGES.INCOMPLETE_MAPPING_ERROR'));
  }

  onGetRDF() {
    this.mapperService.getRDF(this.mapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe((data) => {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(data);
          link.download = DOWNLOAD_RDF_FILE;
          link.click();
          this.messageService.publish(ChannelName.RDFGenerated);
        });
  }

  onSPARQL() {
    this.mapperService.getSPARQL(this.mapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe((data) => {
          this.messageService.publish(ChannelName.SparqlGenerated);
          window.parent.open(window.parent.location.origin + '/sparql?query=' + encodeURIComponent(data));
        });
  }

  addNamespace(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value.split('=').length > 1)) {
      const split = value.split(/=(.+)/);
      const key = split[0];
      const val = split[1];
      this.mapping.namespaces[key] = val;
    }

    if (input) {
      input.value = '';
    }
  }

  removeNamespace(key: string): void {
    delete this.mapping.namespaces[key];
  }

  public updateMapping(event: any) {
    this.mapping = event;
  }

  onGetJSON() {
    const link = document.createElement('a');
    const mapping = classToClass(this.mapping);
    this.modelManagementService.removePreview(mapping);
    link.setAttribute('class', 'download');
    link.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(Convert.mappingDefinitionToJson(mapping)));
    link.setAttribute('download', DOWNLOAD_JSON_FILE);
    document.body.appendChild(link);

    // @ts-ignore
    if (window.Cypress) {
      // Do not attempt to actually download the file in test.
      // Just leave the anchor in there.
      return;
    }
    link.click();
    // Remove to avoid creating a new link on each click.
    link.remove();
  }

  public getMapping() {
    return this.rdfMapping;
  }

  public getBaseIRI(): string {
    return this.mapping && this.mapping.getBaseIRI();
  }

  public getNamespaces(): { [p: string]: string } {
    return this.mapping && this.mapping.getNamespaces();
  }

  public onJsonUpload($event: MappingDefinitionImpl) {
    this.rdfMapping.next({mapping: $event, isDirty: true});
  }
}
