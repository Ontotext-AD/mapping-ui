import {
  Component,
  EventEmitter,
  Input,
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
  EMPTY_PREVIEW,
  GREL_CONSTANT,
  OBJECT_SELECTOR,
  PREDICATE_SELECTOR, RAW_CONSTANT,
  SUBJECT_SELECTOR,
} from 'src/app/utils/constants';
import {TranslateService} from '@ngx-translate/core';
import {Type} from 'src/app/models/mapping-definition';
import {DialogService} from 'src/app/main/components/dialog/dialog.service';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {Observable} from 'rxjs';
import {Helper} from 'src/app/utils/helper';
import {ViewMode} from 'src/app/services/view-mode.enum';
import {Triple} from 'src/app/models/triple';
import {Namespaces} from 'src/app/models/namespaces';
import {environment} from 'src/environments/environment';

export enum TransformationTarget {
  PROPERTYTRANSFORMATION = 'propertytransformation',
  VALUETRANSFORMATION = 'valuetransformation',
  DATATYPETRANSFORMATION = 'datatypetransformation',
}

@Component({
  selector: 'app-mapper-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss'],
})
export class CellComponent extends OnDestroyMixin {
  @Input() triple: Triple;
  @Input() cellMapping: MappingBase;
  @Input() isFirstChild = true;
  @Input() shouldFocus = false;
  @Input() isTypeProperty = false;
  @Input() isTypeObject = false;
  @Input() cellType: string;
  @Input() nestLevel = 0;
  @Input() tabIndex: number;
  @Input() namespaces: Namespaces;
  @Input() sources: Array<Source>;
  @Input() tabPosition: number;
  @Input() viewMode: ViewMode;
  @Input() baseIRI: string;
  @Output() onDrop = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onValueSet = new EventEmitter<any>();
  @Output() onEditClick = new EventEmitter<any>();
  @Output() onAddNewSibling = new EventEmitter<any>();

  suggestions: Observable<Observable<any>>;
  selected: boolean = undefined;

  propertytransformation = TransformationTarget.PROPERTYTRANSFORMATION;
  valuetransformation = TransformationTarget.VALUETRANSFORMATION;
  datatypetransformation = TransformationTarget.DATATYPETRANSFORMATION;

  SUBJECT = SUBJECT_SELECTOR;
  PREDICATE = PREDICATE_SELECTOR;
  OBJECT = OBJECT_SELECTOR;
  IRI = Type.IRI;
  GREL = GREL_CONSTANT;

  ViewMode = ViewMode;

  constructor(private modelManagementService: ModelManagementService,
              private translateService: TranslateService,
              private dialogService: DialogService) {
    super();
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
   * Get the secondary (language or datatype) transformation for the cell
   *
   * @return value transornmation
   */
  getSecondaryTransformation(): ValueTransformationImpl {
    return this.modelManagementService.getValueTypeDatatypeTransformation((this.cellMapping)) ||
      this.modelManagementService.getValueTypeLanguageTransformation((this.cellMapping));
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
    if (this.isEmptyPreview()) {
      return [EMPTY_PREVIEW];
    }
    return this.modelManagementService.getPreview(this.cellMapping);
  }

  isEmptyPreview(): boolean {
    const preview = this.modelManagementService.getPreview(this.cellMapping) || [];
    return preview.length === 0 || preview.length === 1 && (preview[0] === null || preview[0] === '');
  }

  public drop($event: CdkDragDrop<Source, any>) {
    this.onDrop.emit($event);
  }

  public canDrop() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (drag: CdkDrag, drop: CdkDropList) => {
      return !(!!this.getSourceType() || this.isFirstChild && this.isTypeProperty);
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
    if (!this.getValueSource() &&
      (this.cellType === this.SUBJECT || this.cellType === this.OBJECT || (this.cellType === this.PREDICATE && !this.isTypeProperty))) {
      return true;
    }
    return false;
  }

  public getType(): string {
    if (this.cellType === this.SUBJECT || this.cellType === this.PREDICATE || this.triple.isTypeProperty) {
      return Type.IRI;
    }
    return this.getValueType() && this.getValueType().getType();
  }

  public onEdit() {
    this.onEditClick.emit();
  }

  isGRELTransformation(transformation: ValueTransformationImpl) {
    return transformation && transformation.getLanguage() === 'grel';
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

  getResourceUri(previewItem: string): any {
    let uri;
    if (previewItem.match(/^<|>$/g)) {
      previewItem = previewItem.replace(/^<|>$/g, '');
    }
    if (this.getTransformation() && this.getTransformation().getLanguage() === RAW_CONSTANT) {
      uri = previewItem;
    } else {
      const separatorIndex = previewItem.indexOf(':');
      if (separatorIndex > -1) {
        const namespace = previewItem.substring(0, separatorIndex);
        uri = (this.namespaces[namespace] + previewItem.substring(separatorIndex + 1)).replace(/\\/g, '');
      } else if (previewItem.startsWith('http')) {
        uri = previewItem;
      } else {
        uri = this.baseIRI + previewItem;
      }
    }
    return uri;
  }

  getGraphDbResourceUrl(previewItem): string {
    return environment.graphDbResource + '?resource=' + this.getResourceUri(previewItem);
  }
}
