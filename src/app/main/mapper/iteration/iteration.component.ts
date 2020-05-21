import {Component, Input} from '@angular/core';

import {PropertyMapping, SubjectMapping} from 'src/app/models/mapping-definition';

@Component({
    selector: 'iteration',
    templateUrl: './iteration.component.html',
    styleUrls: ['./iteration.component.scss']
})
export class IterationComponent {
    @Input() propertyMappings: Array<PropertyMapping>;
    @Input() subject: SubjectMapping;

    constructor() {

    }

    ngOnInit(): void {

    }
}