import {Component, OnInit} from '@angular/core';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {Source} from 'src/app/models/source';
import {MapperService} from 'src/app/services/rest/mapper.service';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {EMPTY_MAPPING, DOWNLOAD_RDF_FILE} from 'src/app/utils/constants';
import {plainToClass} from 'class-transformer';


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
              private mapperService: MapperService) {
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
  }

  onSavedMapping() {
    this.modelManagementService.storeModelMapping(this.mapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe();
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

  public onNewMapping() {
    this.mapping = new MappingDefinitionImpl(undefined, undefined, []);
  }
}
