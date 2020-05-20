import {Component, Input} from '@angular/core';

import {SimpleIRIValueMapping, ValueMapping} from 'src/app/models/mapping-definition';

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

    constructor() { }

    ngOnInit(): void {
    }
}