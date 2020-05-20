import {Component, Input} from '@angular/core';

import {SimpleIRIValueMapping, ValueMapping, IRI} from 'src/app/models/mapping-definition';

@Component({
    selector: 'mapper-cell',
    templateUrl: './cell.component.html',
    styleUrls: ['./cell.component.scss']
})
export class CellComponent {
    @Input() cellMapping: SimpleIRIValueMapping | ValueMapping;
    @Input() predicateIndex: Number;
    @Input() objectIndex: Number;
    @Input() position: string;

    valueType() : IRI {
        if ((this.cellMapping as ValueMapping).valueType) {
            return (this.cellMapping as ValueMapping).valueType;
        }
        return null;
    }

    constructor() { }

    ngOnInit(): void {
    }
}