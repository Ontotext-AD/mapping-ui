import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {ColumnImpl} from 'src/app/models/column-impl';
import {IRIImpl} from 'src/app/models/iri-impl';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';
import {MappingBase} from 'src/app/models/mapping-base';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {Source} from 'src/app/models/source';
import {
  GREL_CONSTANT,
  OBJECT_SELECTOR,
  PREDICATE_SELECTOR,
  PREFIX_CONSTANT,
  SUBJECT_SELECTOR,
} from 'src/app/utils/constants';
import {TranslateService} from '@ngx-translate/core';
import {Type} from 'src/app/models/mapping-definition';

@Component({
  selector: 'app-mapper-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
})
export class CellComponent {
  @Input() cellMapping: MappingBase;
  @Input() isFirstChild: boolean = true;
  @Input() isTypeProperty: boolean = false;
  @Input() cellType: string;
  @Output() onDrop = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  SUBJECT = SUBJECT_SELECTOR;
  PREDICATE = PREDICATE_SELECTOR;
  OBJECT = OBJECT_SELECTOR;

  IRI = Type.IRI;
  DATATYPE_LITERAL = Type.DatatypeLiteral;
  LANGUAGE_LITERAL = Type.LanguageLiteral;
  LITERAL = Type.Literal;
  UNIQUE_BNODE = Type.UniqueBnode;
  VALUE_BNODE = Type.ValueBnode;

  GREL = GREL_CONSTANT;
  PREFIX = PREFIX_CONSTANT;

  constructor(private modelManagementService: ModelManagementService,
              private translateService: TranslateService) {
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
  getValueType(): IRIImpl {
    return this.modelManagementService.getValueType(this.cellMapping);
  }

  getDatatypeSourceType() {
    return this.modelManagementService.getValueTypeDatatype(this.cellMapping).getValueSource().getSource();
  }

  getDatatypeSource() {
    return this.modelManagementService.getValueTypeDatatype(this.cellMapping) &&
      this.modelManagementService.getValueTypeDatatype(this.cellMapping).getValueSource();
  }

  getValueTypeLanguageSourceType() {
    return this.modelManagementService.getValueTypeLanguage(this.cellMapping).getValueSource().getSource();
  }

  getValueTypeLanguageSource() {
    return this.modelManagementService.getValueTypeLanguage(this.cellMapping) &&
      this.modelManagementService.getValueTypeLanguage(this.cellMapping).getValueSource();
  }

  public drop($event: CdkDragDrop<Source, any>) {
    this.onDrop.emit($event);
  }

  public canDrop() {
    if (!!this.getSourceType() || this.isFirstChild && this.isTypeProperty) {
      return function(drag: CdkDrag, drop: CdkDropList) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return false;
      };
    }

    return function(drag: CdkDrag, drop: CdkDropList) { // eslint-disable-line @typescript-eslint/no-unused-vars
      return true;
    };
  }

  public deleteMapping($event) {
    $event.stopPropagation();
    this.onDelete.emit();
  }

  isEmpty(): boolean {
    if ((this.cellType === this.SUBJECT || this.cellType === this.OBJECT) && !this.getValueSource()) {
      return true;
    } else if (this.cellType === this.PREDICATE && !this.isTypeProperty && !this.getValueSource()) {
      return true;
    }
    return false;
  }

  getCellType(): string {
    if (this.cellType === this.SUBJECT) {
      return this.translateService.instant('CONSTANTS.SUBJECT');
    } else if (this.cellType === this.PREDICATE) {
      return this.translateService.instant('CONSTANTS.PREDICATE');
    } else if (this.cellType === this.OBJECT) {
      return this.translateService.instant('CONSTANTS.OBJECT');
    }
  }

  public getType(): string {
    return this.getValueType() && this.getValueType().getType();
  }

  public getValueTypeLabel() {
    if (this.getType() === this.IRI) {
      return this.translateService.instant('LABELS.IRI');
    } else if (this.getType() === this.LITERAL) {
      return this.translateService.instant('LABELS.LITERAL');
    } else if (this.getType() === this.UNIQUE_BNODE) {
      return this.translateService.instant('LABELS.UNIQUE_BNODE');
    } else if (this.getType() === this.VALUE_BNODE) {
      return this.translateService.instant('LABELS.VALUE_BNODE');
    }
  }

  public getTransformationType() {
    return this.getTransformation() && this.getTransformation().getLanguage();
  }

  public getTransformationLabel() {
    if (this.getTransformationType() === this.GREL) {
      return this.translateService.instant('LABELS.GREL');
    } else if (this.getTransformationType() === this.PREFIX) {
      return this.getTransformation().getExpression();
    }
  }

  public isSecondaryType() {
    return this.getType() === Type.DatatypeLiteral || this.getType() === Type.LanguageLiteral;
  }

  public getSecondaryTypeLabel() {
    if (this.getType() === this.DATATYPE_LITERAL) {
      return this.translateService.instant('LABELS.DATATYPE_LITERAL');
    } else if (this.getType() === this.LANGUAGE_LITERAL) {
      return this.translateService.instant('LABELS.LANGUAGE_LITERAL');
    }
  }

  public getSecondaryTransformationType() {
    return this.modelManagementService.getValueTypeDatatypeTransformation((this.cellMapping)) ||
      this.modelManagementService.getValueTypeLanguageTransformation((this.cellMapping));
  }

  public getSecondaryTransformationLabel() {
    if (this.getSecondaryTransformationType().getLanguage() === this.GREL) {
      return this.translateService.instant('LABELS.GREL');
    } else if (this.getSecondaryTransformationType().getLanguage() === this.PREFIX) {
      return this.getSecondaryTransformationType().getExpression();
    }
  }
}
