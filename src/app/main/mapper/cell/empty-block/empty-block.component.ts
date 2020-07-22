import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList} from '@angular/cdk/drag-drop';
import {Source} from 'src/app/models/source';
import {MappingBase} from 'src/app/models/mapping-base';
import {ColumnImpl} from 'src/app/models/column-impl';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {MAT_OPTION, OBJECT_SELECTOR, PREDICATE_SELECTOR, SOURCE_SIGN, SUBJECT_SELECTOR} from 'src/app/utils/constants';
import {TranslateService} from '@ngx-translate/core';
import {merge, Observable, of} from 'rxjs';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {map} from 'rxjs/operators';
import {Source as SourceEnum} from 'src/app/models/mapping-definition';
import {FormControl} from '@angular/forms';
import {RepositoryService} from 'src/app/services/rest/repository.service';
import {ModelConstructService} from 'src/app/services/model-construct.service';
import {TypeMapping} from 'src/app/models/type-mapping';
import {TabService} from 'src/app/services/tab.service';

@Component({
  selector: 'app-empty-block',
  templateUrl: './empty-block.component.html',
  styleUrls: ['./empty-block.component.scss'],
})
export class EmptyBlockComponent extends OnDestroyMixin implements OnInit, AfterViewInit {
  @Output() onDrop = new EventEmitter<any>();
  @Output() onValueSet = new EventEmitter<any>();
  @Output() onEditClick = new EventEmitter<any>();
  @Input() shouldFocus: boolean = false;
  @Input() cellMapping: MappingBase;
  @Input() isFirstChild: boolean = true;
  @Input() isTypeProperty: boolean = false;
  @Input() cellType: string;
  @Input() tabIndex: number;
  @Input() tabPosition: number;
  @Input() sources: Array<Source>;
  @Input() isTypeObject: boolean = false;
  @Input() namespaces: { [key: string]: string };

  @ViewChild('mapping') mappingInput: ElementRef;

  suggestions: Observable<Observable<any>>;
  autoInput = new FormControl();

  SUBJECT = SUBJECT_SELECTOR;
  PREDICATE = PREDICATE_SELECTOR;
  OBJECT = OBJECT_SELECTOR;

  constructor(private modelManagementService: ModelManagementService,
              private translateService: TranslateService,
              private repositoryService: RepositoryService,
              private modelConstructService: ModelConstructService,
              private tabService: TabService,
              private cdRef: ChangeDetectorRef) {
    super();
  }

  public ngOnInit(): void {
    this.subscribeToValueChanges();
  }

  ngAfterViewInit(): void {
    if (this.shouldFocus) {
      if (this.mappingInput && this.mappingInput.nativeElement) {
        this.mappingInput.nativeElement.focus();
      }
    }
    this.cdRef.detectChanges();
  }

  public drop($event: CdkDragDrop<Source, any>) {
    this.onDrop.emit($event);
  }

  public onPreventClick(event) {
    event.preventDefault();
    event.stopPropagation();
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
   * Get the value source for the cell depending on the cellMapping type
   *
   * @return value source
   */
  getValueSource(): ColumnImpl {
    return this.modelManagementService.getValueSource(this.cellMapping);
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

  private subscribeToValueChanges() {
    this.suggestions = merge(this.autoInput.valueChanges)
        .pipe(untilComponentDestroyed(this),
            map((value) => {
              const valueStr = value as String;
              if (valueStr.startsWith(SOURCE_SIGN.Column)) {
                return of(this.sources.filter((source) => source.title.toLowerCase().includes(value.toLowerCase().substr(1)))
                    .map((source) => {
                      return {label: source.title, value: SOURCE_SIGN.Column + source.title, source: SourceEnum.Column};
                    }));
              }
              if (valueStr.startsWith(SOURCE_SIGN.RecordRowID)) {
                return of([{
                  label: SourceEnum.RowIndex,
                  value: SOURCE_SIGN.RecordRowID + SourceEnum.RowIndex,
                  source: SourceEnum.RowIndex,
                }, {
                  label: SourceEnum.RecordID,
                  value: SOURCE_SIGN.RecordRowID + SourceEnum.RecordID,
                  source: SourceEnum.RecordID,
                }]);
              }
              let autoCompleteObservable = this.repositoryService.autocompleteIRIs(value as string);
              if (this.cellType === this.PREDICATE) {
                autoCompleteObservable = this.repositoryService.autocompletePredicates(value as string);
              }
              if (this.cellType === this.OBJECT && this.isTypeObject) {
                autoCompleteObservable = this.repositoryService.autocompleteTypes(value as string);
              }
              return autoCompleteObservable.pipe(map((types) => this.modelConstructService.replaceIRIPrefixes(types, this.namespaces)));
            }));
  }

  public saveInputValue(emitTab: boolean) {
    let value = this.autoInput.value;
    const source = this.getSource(value);
    // Remove special chars from columns and indexes
    if (source !== SourceEnum.Constant && value !== TypeMapping.a) {
      value = value.substr(1);
    }
    this.saveValue(value, emitTab);
  }

  private saveValue(value, emitTab: boolean) {
    if (value) {
      if (emitTab) {
        this.tabService.selectCommand.emit({index: this.tabIndex, position: this.tabPosition});
      }
      this.onValueSet.emit({value: value, source: this.getSource(this.autoInput.value)});
    }
  }

  private getSource(value) {
    if (value) {
      if (value.startsWith(SOURCE_SIGN.Column)) {
        return SourceEnum.Column;
      }
      if (value.startsWith(SOURCE_SIGN.RecordRowID) && value.substr(1) === SourceEnum.RowIndex || value.substr(1) === SourceEnum.RecordID) {
        return value.substr(1);
      }
    }
    return SourceEnum.Constant;
  }

  public onEdit() {
    this.onEditClick.emit();
  }

  public saveInputValueOnBlur($event: FocusEvent) {
    // @ts-ignore
    if ($event.relatedTarget && $event.relatedTarget.tagName === MAT_OPTION) {
      $event.preventDefault();
      $event.stopPropagation();
    } else {
      this.saveInputValue(true);
    }
  }
}