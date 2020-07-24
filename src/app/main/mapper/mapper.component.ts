import {Component, OnInit} from '@angular/core';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {Source} from 'src/app/models/source';
import {MapperService} from 'src/app/services/rest/mapper.service';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {DOWNLOAD_RDF_FILE, EMPTY_MAPPING} from 'src/app/utils/constants';
import {classToClass, plainToClass} from 'class-transformer';
import {MatChipInputEvent} from '@angular/material/chips/chip-input';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ChannelName} from 'src/app/services/channel-name.enum';
import {MessageService} from 'src/app/services/message.service';
import {JSONValueDialog} from 'src/app/main/mapper/json-value-dialog';
import {MatDialog} from '@angular/material/dialog';
import {BehaviorSubject} from 'rxjs';


@Component({
  selector: 'app-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.scss'],
})
export class MapperComponent extends OnDestroyMixin implements OnInit {
  sources: Array<Source>;
  mapping: MappingDefinitionImpl = plainToClass(MappingDefinitionImpl, EMPTY_MAPPING);
  rdfMapping: BehaviorSubject<MappingDefinitionImpl>;
  rdf: string;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  addOnBlur = true;

  constructor(private modelManagementService: ModelManagementService,
              private mapperService: MapperService,
              private messageService: MessageService,
              private dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    this.rdfMapping = new BehaviorSubject<MappingDefinitionImpl>(this.mapping);

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
            this.mapping = data;
            this.rdfMapping.next(this.mapping);
          }
        });

    this.messageService.read(ChannelName.NewMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.mapping = new MappingDefinitionImpl(EMPTY_MAPPING.baseIRI, EMPTY_MAPPING.namespaces, EMPTY_MAPPING.subjectMappings);
          this.rdfMapping.next(this.mapping);
        });

    this.messageService.read(ChannelName.SaveMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.modelManagementService.storeModelMapping(this.mapping)
              .pipe(untilComponentDestroyed(this))
              .subscribe(() => {
                this.messageService.publish(ChannelName.MappingSaved);
              });
        });

    this.messageService.read(ChannelName.GetRDF)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.onGetRDF();
        });

    this.messageService.read(ChannelName.GetSPARQL)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.onSPARQL();
        });

    this.messageService.read(ChannelName.ViewJSONMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.openJSONDialog();
        });
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

  openJSONDialog(): void {
    this.dialog.open(JSONValueDialog, {
      width: '900px',
      height: '600px',
      data: {
        mapping: classToClass(this.mapping),
      },
    });
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
    this.mapping = $event;
    this.rdfMapping.next(this.mapping);
  }
}
