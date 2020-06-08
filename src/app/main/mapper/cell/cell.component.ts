import {Component, Input} from '@angular/core';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {ColumnImpl} from 'src/app/models/column-impl';
import {IRIImpl} from 'src/app/models/iri-impl';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';
import {MappingBase} from 'src/app/models/mapping-base';

@Component({
  selector: 'app-mapper-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
})
export class CellComponent {
    @Input() cellMapping: MappingBase;
    @Input() isFirstChild: boolean = true;
    @Input() isTypeProperty: boolean = false;

    constructor(private modelManagementService: ModelManagementService) {
    }

    ngOnInit(): void {
    }

    /**
     * Get the value source for the cell depending on the cellMapping type
     *
     * @return value source
     */
    getValueSource(): ColumnImpl {
      return this.modelManagementService.getValueSource(this.cellMapping);
    }

    /**
     * Get the source type for the cell depending on the cellMapping type,
     * one of column, constanct, row_index and record_id
     *
     * @return source type
     */
    getSourceType(): String {
      return this.getValueSource() && this.getValueSource().getSource();
    }

    /**
     * Get the transformation for the cell depending on the cellMapping type
     *
     * @return value transornmation
     */
    getTransformation(): ValueTransformationImpl {
      return this.modelManagementService.getTransformation(this.cellMapping);
    }

    /**
     * Get value Type. Returns the ValueType but only when the cellMapping is a ValueMapping
     * Only ValueMappings have such a type
     *
     * @return iri
     */
    getValueType() : IRIImpl {
      return this.modelManagementService.getValueType(this.cellMapping);
    }
}
