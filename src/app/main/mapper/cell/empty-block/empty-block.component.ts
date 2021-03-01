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
import {
  COLON, COLUMN_SIGN,
  DOUBLE_SLASH, HTTP, INDEX_SIGN,
  MAT_OPTION,
  OBJECT_SELECTOR,
  PREDICATE_SELECTOR,
  SOURCE_SIGN,
  SUBJECT_SELECTOR,
} from 'src/app/utils/constants';
import {TranslateService} from '@ngx-translate/core';
import {merge, Observable, of} from 'rxjs';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {debounceTime, map} from 'rxjs/operators';
import {Source as SourceEnum} from 'src/app/models/mapping-definition';
import {FormControl} from '@angular/forms';
import {RepositoryService} from 'src/app/services/rest/repository.service';
import {ModelConstructService} from 'src/app/services/model-construct.service';
import {TypeMapping} from 'src/app/models/type-mapping';
import {TabService} from 'src/app/services/tab.service';
import * as XRegExp from 'xregexp';
import {NotificationService} from 'src/app/services/notification.service';
import {MatTooltip} from '@angular/material/tooltip';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {Namespace, Namespaces} from '../../../../models/namespaces';

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
  @Input() namespaces: Namespaces;

  @ViewChild('mapping') mappingInput: ElementRef;
  @ViewChild('tooltip') tooltip: MatTooltip;

  suggestions: Observable<Observable<any>>;
  autoInput = new FormControl();
  optionTooltip: string;

  manualInput: string;

  SUBJECT = SUBJECT_SELECTOR;
  PREDICATE = PREDICATE_SELECTOR;
  OBJECT = OBJECT_SELECTOR;

  regex = XRegExp(`(?<namespace> .*?(?=:)) -?
                   :
                   (?<extended> [^@$]*) -?
                   (?<source> \\@?\\$?) -?
                   (?<value> .*$)`, 'x');

  toHighlight: string = '';
  showHint: boolean;

  constructor(private modelManagementService: ModelManagementService,
              private translateService: TranslateService,
              private repositoryService: RepositoryService,
              private modelConstructService: ModelConstructService,
              private tabService: TabService,
              private cdRef: ChangeDetectorRef,
              private notificationService: NotificationService) {
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

  private filterColumnsUsingValue(value: string) {
    return this.sources.filter(
        (source) => {
          const specialChar = value.toLowerCase().substr(value.indexOf(SOURCE_SIGN.Column) + 1);
          return source.title.toLowerCase().includes(specialChar);
        },
    ).map((source) => {
      return {label: source.title, value: SOURCE_SIGN.Column + source.title, source: SourceEnum.Column};
    });
  }

  private suggestRecordId() {
    return [{
      label: SourceEnum.RowIndex,
      value: SOURCE_SIGN.RecordRowID + SourceEnum.RowIndex,
      source: SourceEnum.RowIndex,
    }, {
      label: SourceEnum.RecordID,
      value: SOURCE_SIGN.RecordRowID + SourceEnum.RecordID,
      source: SourceEnum.RecordID,
    }];
  }

  private subscribeToValueChanges() {
    this.suggestions = merge(this.autoInput.valueChanges)
        .pipe(untilComponentDestroyed(this),
            map((value: string) => {
              this.toHighlight = value;
              if (value.indexOf(SOURCE_SIGN.Column) >= 0) {
                return of(this.filterColumnsUsingValue(value));
              }
              if (value.indexOf(SOURCE_SIGN.RecordRowID) >= 0) {
                return of(this.suggestRecordId());
              }

              this.manualInput = value;

              if (this.isExtendedPrefix(value)) {
                const match = XRegExp.exec(value, this.regex);
                if (this.isValidExtension(match)) {
                  if (match.namespace && !match.value) {
                    value = this.namespaces[match.namespace] + ';' + match.extended;
                  }
                }
              }
              let autoCompleteObservable = this.repositoryService.autocompleteIRIs(value);
              if (this.cellType === this.PREDICATE) {
                autoCompleteObservable = this.repositoryService.autocompletePredicates(value);
              }
              if (this.cellType === this.OBJECT && this.isTypeObject) {
                autoCompleteObservable = this.repositoryService.autocompleteTypes(value);
              }
              const suggestedNamespaces = this.repositoryService.filterNamespace(this.namespaces, value).map((ns: Namespace) => {
                const prefixValue = ns.prefix + COLON;
                return {label: prefixValue, value: prefixValue};
              });
              if (this.repositoryService.isAutocompleteEnabled()) {
                this.showHint = true;
              }
              return autoCompleteObservable.pipe(map(
                  (types) => suggestedNamespaces.concat(this.modelConstructService.replaceIRIPrefixes(types, this.namespaces)),
              ));
            }));
  }

  public selectPrefixOrValue($event: Event, emitTab: boolean, trigger: MatAutocompleteTrigger) {
    const value = this.autoInput.value;
    if (value && !value.endsWith(COLON)) {
      this.saveInputValue(emitTab);
    } else {
      $event.stopPropagation();
      trigger.openPanel();
    }
  }

  public saveInputValue(emitTab: boolean) {
    this.showHint = false;
    if (!this.autoInput.value) {
      return;
    }
    let value = this.autoInput.value.trim();
    if (this.manualInput && !this.autoInput.value.startsWith(this.manualInput)) {
      value = this.manualInput + this.autoInput.value;
    }

    let prefixTransformation: string;
    if (this.isExtendedPrefix(value)) {
      const match = XRegExp.exec(value, this.regex);

      if (this.isValidExtension(match)) {
        prefixTransformation = match.namespace;
        if (!this.namespaces[prefixTransformation]) {
          this.notificationService.error(this.translateService.instant('MESSAGES.UNRECOGNIZED_PREFIX_ERROR') + prefixTransformation);
          return;
        }
        const isEmptyPrefix = prefixTransformation === '' && this.namespaces[prefixTransformation];
        if (match.value) {
          if (match.extended) {
            prefixTransformation += COLON + match.extended;
          } else if (isEmptyPrefix) {
            prefixTransformation = COLON;
          }
          value = match.source + match.value;
        } else if (match.extended && !match.value) {
          value = match.extended;
          if (isEmptyPrefix) {
            prefixTransformation = COLON;
          }
        }
      }
    }

    const source = this.getSource(value);
    // Remove special chars from columns and indexes
    if (source !== SourceEnum.Constant && value !== TypeMapping.a) {
      value = value.substr(1);
    }
    this.saveValue(value, source, prefixTransformation, emitTab);
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

  private saveValue(value, source, prefixTransformation, emitTab: boolean) {
    if (value) {
      if (emitTab) {
        this.tabService.selectCommand.emit({index: this.tabIndex, position: this.tabPosition});
      }
      this.manualInput = '';
      this.onValueSet.emit({value, source, prefixTransformation});
    }
  }

  isExtendedPrefix(value) {
    return this.regex.test(value);
  }

  isValidExtension(match): boolean {
    return match.namespace !== HTTP && !match.extended.startsWith(DOUBLE_SLASH);
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

  public getIriDescription(option) {
    const value: string = option.value;
    if (!(value.startsWith(COLUMN_SIGN) || value.startsWith(INDEX_SIGN))) {
      return this.repositoryService.getIriDescription(value)
          .pipe(untilComponentDestroyed(this), debounceTime(500))
          .subscribe((description) => {
            this.optionTooltip = description[0];
            this.cdRef.detectChanges();
            this.tooltip.show();
          });
    }
  }

  public clearTooltip() {
    this.optionTooltip = '';
  }
}
