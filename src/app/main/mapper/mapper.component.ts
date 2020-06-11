import {Component, OnInit} from '@angular/core';
import {TabularDataService} from 'src/app/services/tabular-data.service';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {Source} from 'src/app/models/source';
import {ColumnsService} from 'src/app/services/rest/columns.service';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {EMPTY_MAPPING} from 'src/app/utils/constants';
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

  constructor(private tabularDataService: TabularDataService,
              private modelManagementService: ModelManagementService,
              private columnService: ColumnsService) {
    super();
  }

  drop() {
  }

  ngOnInit(): void {
    this.columnService.getColumns()
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

  public onNewMapping() {
    this.mapping = new MappingDefinitionImpl(undefined, undefined, []);
  }
}
