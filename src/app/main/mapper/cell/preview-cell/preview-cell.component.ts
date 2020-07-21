import {Component, EventEmitter, Input} from '@angular/core';
import {CellComponent} from 'src/app/main/mapper/cell/cell.component';

@Component({
  selector: 'app-preview-cell',
  templateUrl: './preview-cell.component.html',
  styleUrls: ['./preview-cell.component.scss'],
})
export class PreviewCellComponent extends CellComponent {
  @Input() onDrop = new EventEmitter<any>();
  @Input() onDelete = new EventEmitter<any>();
  @Input() onValueSet = new EventEmitter<any>();
  @Input() onEditClick = new EventEmitter<any>();
}
