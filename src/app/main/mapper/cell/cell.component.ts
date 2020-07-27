import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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
import {DialogService} from 'src/app/main/components/dialog/dialog.service';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {TabService} from 'src/app/services/tab.service';
import {Observable} from 'rxjs';
import {Helper} from 'src/app/utils/helper';
import {ViewMode} from 'src/app/services/view-mode.enum';
import {Triple} from '../../../models/triple';

@Component({
  selector: 'app-mapper-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
})
export class CellComponent extends OnDestroyMixin implements OnInit {
  @Input() triple: Triple;
  @Input() cellMapping: MappingBase;
  @Input() isFirstChild = true;
  @Input() shouldFocus = false;
  @Input() isTypeProperty = false;
  @Input() isTypeObject = false;
  @Input() cellType: string;
  @Input() nestLevel = 0;
  @Input() tabIndex: number;
  @Input() namespaces: { [key: string]: string };
  @Input() sources: Array<Source>;
  @Input() tabPosition: number;
  @Input() viewMode: ViewMode;
  @Output() onDrop = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onValueSet = new EventEmitter<any>();
  @Output() onEditClick = new EventEmitter<any>();
  @Output() onAddNewSibling = new EventEmitter<any>();

  suggestions: Observable<Observable<any>>;
  selected: boolean = undefined;

  SUBJECT = SUBJECT_SELECTOR;
  PREDICATE = PREDICATE_SELECTOR;
  OBJECT = OBJECT_SELECTOR;

  IRI = Type.IRI;
  DATATYPE_LITERAL = Type.DatatypeLiteral;
  LANGUAGE_LITERAL = Type.LanguageLiteral;

  GREL = GREL_CONSTANT;
  PREFIX = PREFIX_CONSTANT;

  ViewMode = ViewMode;

  constructor(private modelManagementService: ModelManagementService,
              private translateService: TranslateService,
              private tabService: TabService,
              private dialogService: DialogService) {
    super();
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
  getSourceType(): string {
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

  getPreview(): string[] {
    return this.modelManagementService.getPreview(this.cellMapping);
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

  private hasTypeMappings(node) {
    return node && node.getTypeMappings() && node.getTypeMappings().length;
  }

  private hasPropertyMappings(node) {
    return node && node.getPropertyMappings() && node.getPropertyMappings().length;
  }

  private getOnDeleteWarningMessage(): string {
    let hasChildren = false;
    let messageKey = 'MESSAGES.CONFIRM_MAPPING_DELETION';
    if (this.cellType === this.SUBJECT) {
      const hasPredicate = this.hasPropertyMappings(this.cellMapping);
      const hasObject = this.hasTypeMappings(this.cellMapping);
      hasChildren = !!(hasPredicate || hasObject || this.triple.isTypeProperty);
    } else if (this.cellType === this.PREDICATE) {
      const object = this.triple.getObject();
      hasChildren = !!(object && (object.getValueSource() || object.getValueType()));
    } else if (this.cellType === this.OBJECT) {
      const object = this.triple.getObject();
      hasChildren = !!(object && (this.hasTypeMappings(object) || this.hasPropertyMappings(object)));
    } else {
      throw Error('No such type!');
    }
    if (hasChildren) {
      messageKey = 'MESSAGES.CONFIRM_MAPPING_WITH_CHILDREN_DELETION';
    }
    return messageKey;
  }

  public deleteMapping($event) {
    $event.stopPropagation();
    const messageKey = this.getOnDeleteWarningMessage();
    this.dialogService.confirm({
      content: this.translateService.instant(messageKey),
    }).pipe(untilComponentDestroyed(this))
        .subscribe((result) => {
          if (result) {
            this.onDelete.emit();
          }
        });
  }

  isEmpty(): boolean {
    if ((this.cellType === this.SUBJECT || this.cellType === this.OBJECT) && !this.getValueSource()) {
      return true;
    } else if (this.cellType === this.PREDICATE && !this.isTypeProperty && !this.getValueSource()) {
      return true;
    }
    return false;
  }

  public getType(): string {
    return this.getValueType() && this.getValueType().getType();
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

  public onEdit() {
    this.onEditClick.emit();
  }

  getReasonableLongWord(word: string) {
    if (word) {
      return Helper.getReasonableLongWord(word, 7, 7);
    }
  }

  addSibling() {
    this.onAddNewSibling.emit();
  }

  public setValue(event: any) {
    this.onValueSet.emit(event);
  }

  public onDropEvent(event) {
    this.onDrop.emit(event);
  }

  public isIncomplete() {
    return !this.triple.isEmpty() && this.isEmpty();
  }
}
