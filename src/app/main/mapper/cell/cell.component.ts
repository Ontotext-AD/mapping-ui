import {Component, Input} from '@angular/core';
import {SimpleIRIValueMapping, SubjectMapping, ValueMapping, PropertyMapping} from 'src/app/models/mapping-definition';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {ColumnImpl} from 'src/app/models/column-impl';
import {IRIImpl} from 'src/app/models/iri-impl';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';

@Component({
  selector: 'app-mapper-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
})
export class CellComponent {
    @Input() cellMapping: SubjectMapping | PropertyMapping | ValueMapping | SimpleIRIValueMapping;
    @Input() firstChild: boolean;
    @Input() isTypeProperty: boolean;

    constructor(private modelManagementService: ModelManagementService) {
    }

    ngOnInit(): void {
      this.firstChild = true;
      this.isTypeProperty = false;
    }

    /**
     * Get the value source for the cell depending on the cellMapping type
     *
     * @return value source
     */
    getValueSource(): ColumnImpl {
      return this.modelManagementService.getSource(this.cellMapping);
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
