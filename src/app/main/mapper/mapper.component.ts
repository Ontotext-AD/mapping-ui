import {Component, OnInit} from '@angular/core';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {Source} from 'src/app/models/source';
import {MapperService} from 'src/app/services/rest/mapper.service';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {DOWNLOAD_RDF_FILE, EMPTY_MAPPING} from 'src/app/utils/constants';
import {plainToClass} from 'class-transformer';
import {MatChipInputEvent} from '@angular/material/chips/chip-input';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ChannelName} from 'src/app/services/channel-name.enum';
import {MessageService} from 'src/app/services/message.service';


@Component({
  selector: 'app-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.scss'],
})
export class MapperComponent extends OnDestroyMixin implements OnInit {
  sources: Array<Source>;
  mapping: MappingDefinitionImpl = plainToClass(MappingDefinitionImpl, EMPTY_MAPPING);
  rdf: string;

  constructor(private modelManagementService: ModelManagementService,
              private mapperService: MapperService,
              private messageService: MessageService) {
    super();
  }

  drop() {
  }

  ngOnInit(): void {
    this.mapperService.getColumns()
        .pipe(untilComponentDestroyed(this))
        .subscribe(
            (data) => {
              this.sources = data;
            });
    this.modelManagementService.getStoredModelMapping()
        .pipe(untilComponentDestroyed(this))
        .subscribe((data) => {
          this.mapping = data;
        });

    this.messageService.read(ChannelName.NewMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.mapping = new MappingDefinitionImpl(EMPTY_MAPPING.baseIRI, EMPTY_MAPPING.namespaces, EMPTY_MAPPING.subjectMappings);
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
  }

  onGetRDF() {
    this.mapperService.getRDF(this.mapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe((data) => {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(data);
          link.download = DOWNLOAD_RDF_FILE;
          link.click();
        });
  }

  onSPARQL() {
    this.mapperService.getSPARQL(this.mapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe((data) => {
          window.parent.open(window.parent.location.origin + '/sparql?query=' + encodeURIComponent(data));
        });
  }

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  addOnBlur = true;

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
}
