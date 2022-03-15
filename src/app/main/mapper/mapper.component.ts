import {Component, OnInit} from '@angular/core';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {Source} from 'src/app/models/source';
import {MapperService} from 'src/app/services/rest/mapper.service';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {
  COLON,
  DOWNLOAD_JSON_FILE,
  DOWNLOAD_RDF_FILE,
  EMPTY_MAPPING,
  MALFORMED_NAMESPACE_KEY,
} from 'src/app/utils/constants';
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
import {NamespaceService} from '../../services/namespace.service';
import {Namespaces, Namespace} from '../../models/namespaces';
import {NamespaceValidator} from '../../validators/namespace.validator';
import * as XRegExp from 'xregexp';
import {LocalStorageService} from '../../services/local-storage.service';


@Component({
  selector: 'app-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.scss'],
})
export class MapperComponent extends OnDestroyMixin implements OnInit {
  sources: Array<Source>;
  mapping: MappingDefinitionImpl = plainToClass(MappingDefinitionImpl, MapperComponent.createNewMapping());
  rdfMapping: BehaviorSubject<{mapping: MappingDefinitionImpl, isDirty: boolean}>;
  rdf: string;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  addOnBlur = true;
  namespaceErrorMessages: {code: string, msg: string}[];
  namespacesRegex = XRegExp(`(?:\\s*@?prefix +)?(.+?\\s*)(<.*?>)(?:\\s*\\.*\\n*)`, 'gi');
  isDirty = false;

  constructor(private modelManagementService: ModelManagementService,
              private mapperService: MapperService,
              private messageService: MessageService,
              private dialog: MatDialog,
              private notificationService: NotificationService,
              private translateService: TranslateService,
              private namespaceValidator: NamespaceValidator,
              private localStorageService: LocalStorageService) {
    super();
  }

  static createNewMapping() {
    const newMapping = EMPTY_MAPPING;
    newMapping.subjectMappings = [];
    return newMapping;
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
          const payload = {
            mapping: new MappingDefinitionImpl(EMPTY_MAPPING.baseIRI, EMPTY_MAPPING.namespaces, []),
            isDirty: false,
          };
          this.rdfMapping.next(payload);
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

    this.messageService.read(ChannelName.DirtyMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe((event) => {
          this.isDirty = event.getMessage();
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
    const graphDB = this.localStorageService.getGraphDB();
    if (graphDB) {
      this.mapperService.getSPARQL(this.mapping)
          .pipe(untilComponentDestroyed(this))
          .subscribe((data) => {
            this.messageService.publish(ChannelName.SparqlGenerated);
            window.parent.open(graphDB + '/sparql?query=' + encodeURIComponent(data));
          });
    }
  }

  addNamespace(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    const namespaces = [];
    this.namespaceErrorMessages = [];
    let hasMatch = false;
    XRegExp.forEach(value, this.namespacesRegex, (match) => {
      hasMatch = true;
      const namespace: Namespace = NamespaceService.toNamespace(match[1].trim().slice(0, -1), match[2].slice(1, -1));
      namespaces.push(namespace);
      const singleError = this.validateNamespace(namespace);
      if (singleError) {
        this.namespaceErrorMessages.push(singleError);
      }
    });

    if (value && !hasMatch) {
      this.namespaceErrorMessages.push({code: MALFORMED_NAMESPACE_KEY, msg: ''});
    }

    if (this.namespaceErrorMessages.length === 0) {
      namespaces.forEach((ns) => {
        NamespaceService.addNamespace(this.mapping.namespaces, ns);
      });
      this.messageService.publish(ChannelName.DirtyMapping, value.length > 0 || this.isDirty);
      if (input) {
        input.value = '';
      }
    }
  }

  validateNamespace(namespace: Namespace) {
    const result = this.namespaceValidator.validate(namespace);
    if (!result.valid) {
      return {code: result.error, msg: namespace.prefix};
    } else {
      return null;
    }
  }

  removeNamespace(key: string): void {
    NamespaceService.removeNamespace(this.mapping.namespaces, key === COLON ? '' : key);
    this.messageService.publish(ChannelName.DirtyMapping, true);
  }

  editNamespace(target: HTMLElement, namespace) {
    const input = target?.parentElement?.getElementsByTagName('input')[0];
    if (input) {
      input.value = `PREFIX ${namespace.key}: <${namespace.value}>`;
      input.focus();
    }
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

  public setBaseIRI(value) {
    if (this.mapping) {
      this.mapping.setBaseIRI(value);
      this.messageService.publish(ChannelName.DirtyMapping, true);
    }
  }

  public getGraphDB(): string {
    return this.localStorageService.getGraphDB();
  }

  public setGraphDB(value) {
    this.localStorageService.setGraphDB(value);
  }

  public getRepository(): string {
    return this.localStorageService.getCurrentRepository();
  }

  public setRepository(value) {
    this.localStorageService.setCurrentRepository(value);
  }

  public getNamespaces(): Namespaces {
    const namespaces = this.mapping && this.mapping.getNamespaces();
    return NamespaceService.toUIModel(namespaces);
  }

  public onJsonUpload($event: MappingDefinitionImpl) {
    const error = this.modelManagementService.getMappingValidationError($event);
    if (!error) {
      this.rdfMapping.next({mapping: $event, isDirty: true});
    } else {
      this.notificationService.error(this.translateService.instant('MESSAGES.INVALID_MAPPING_ERROR') + error);
    }
  }
}
