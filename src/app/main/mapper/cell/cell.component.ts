import {Component, Input} from '@angular/core';

import {SimpleIRIValueMapping, ValueTransformation, Column, SubjectMapping, ValueMapping, IRI, PropertyMapping} from 'src/app/models/mapping-definition';

@Component({
    selector: 'mapper-cell',
    templateUrl: './cell.component.html',
    styleUrls: ['./cell.component.scss']
})
export class CellComponent {
    @Input() cellMapping: SubjectMapping | PropertyMapping | ValueMapping | SimpleIRIValueMapping ;
    @Input() isFirstCell: Boolean;
    @Input() isTypeProperty: Boolean;

    /**
     * When the subject/predicate is the same as the one before, we show an empty box.
     */
    showValue(): Boolean {
       return this.isFirstCell;
    }

    /**
     * Get the value source for the cell depending on the cellMapping type
     */
    getSource(): Column {
        if ((this.cellMapping as SubjectMapping).subject) {
            return (this.cellMapping as SubjectMapping).subject.valueSource;
        }
        if ((this.cellMapping as PropertyMapping).property) {
            return (this.cellMapping as PropertyMapping).property.valueSource;
        }
        if ((this.cellMapping as ValueMapping).valueType) {
            return (this.cellMapping as ValueMapping).valueSource;
        }
        if ((this.cellMapping as SimpleIRIValueMapping)) {
            return ((this.cellMapping) as SimpleIRIValueMapping).valueSource;
        }
    }

    /**
     * Get the source type for the cell depending on the cellMapping type, 
     * one of column, constanct, row_index and record_id
     */
    getSourceType(): String {
        return this.getSource().source;
    }

    /**
     * Get the transformation for the cell depending on the cellMapping type
     */
    getTransformation(): ValueTransformation {
        if ((this.cellMapping as SubjectMapping).subject) {
            return (this.cellMapping as SubjectMapping).subject.transformation;
        }
        if ((this.cellMapping as PropertyMapping).property) {
            return (this.cellMapping as PropertyMapping).property.transformation;
        }
        if ((this.cellMapping as ValueMapping).valueType) {
            return (this.cellMapping as ValueMapping).transformation;
        }
        if ((this.cellMapping as SimpleIRIValueMapping)) {
            return ((this.cellMapping) as SimpleIRIValueMapping).transformation;
        }
    }



    /**
     * Get value Type. Returns the ValueType but only when the cellMapping is a ValueMapping
     * Only ValueMappings have such a type
     */
    getValueType() : IRI {
        if ((this.cellMapping as ValueMapping).valueType) {
            return (this.cellMapping as ValueMapping).valueType;
        }
        return null;
    }

    constructor() { 
        this.isFirstCell = true;
        this.isTypeProperty = false;
    }

    ngOnInit(): void {

    }
}