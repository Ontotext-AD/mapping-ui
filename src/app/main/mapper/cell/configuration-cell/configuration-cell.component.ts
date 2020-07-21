import {Component, EventEmitter, Input} from '@angular/core';
import {CellComponent} from 'src/app/main/mapper/cell/cell.component';

@Component({
  selector: 'app-configuration-cell',
  templateUrl: './configuration-cell.component.html',
  styleUrls: ['./configuration-cell.component.scss'],
})
export class ConfigurationCellComponent extends CellComponent {
  @Input() onDrop = new EventEmitter<any>();
  @Input() onDelete = new EventEmitter<any>();
  @Input() onValueSet = new EventEmitter<any>();
  @Input() onEditClick = new EventEmitter<any>();
  @Input() onAddNewSibling = new EventEmitter<any>();
}
