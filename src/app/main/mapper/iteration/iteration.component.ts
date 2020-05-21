import {Component, Input} from '@angular/core';

import {PropertyMapping, SubjectMapping, ValueMapping, SimpleIRIValueMapping} from 'src/app/models/mapping-definition';

@Component({
    selector: 'iteration',
    templateUrl: './iteration.component.html',
    styleUrls: ['./iteration.component.scss']
})
export class IterationComponent {
    @Input() subject: SubjectMapping | ValueMapping;

    getPropertyMappings(): Array<PropertyMapping> {
        if ((this.subject as ValueMapping).valueType) {
            return (this.subject as ValueMapping).valueType.propertyMappings;
        }
        if ((this.subject as SubjectMapping).propertyMappings) {
            return (this.subject as SubjectMapping).propertyMappings;
        }
    }

    getTypeMappings(): Array<SimpleIRIValueMapping> {
        if ((this.subject as ValueMapping).valueType) {
            return (this.subject as ValueMapping).valueType.typeMappings;
        }
        if ((this.subject as SubjectMapping).propertyMappings) {
            return (this.subject as SubjectMapping).typeMappings;
        }
    }
    constructor() {

    }

    ngOnInit(): void {
    }
}