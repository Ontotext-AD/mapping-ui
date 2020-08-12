import {ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EMPTY, merge, Observable, of} from 'rxjs';
import {Triple} from 'src/app/models/triple';
import {OBJECT_SELECTOR, PREDICATE_SELECTOR, SUBJECT_SELECTOR} from 'src/app/utils/constants';
import {Source, Type} from 'src/app/models/mapping-definition';
import {Helper} from 'src/app/utils/helper';
import {map, startWith, takeUntil, debounceTime} from 'rxjs/operators';
import {componentDestroyed, OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {MappingDetails} from 'src/app/models/mapping-details';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {Language} from 'src/app/models/language';
import {MappingBase} from 'src/app/models/mapping-base';
import {ValueMappingImpl} from 'src/app/models/value-mapping-impl';
import {TypeMapping} from 'src/app/models/type-mapping';
import {DialogService} from 'src/app/main/components/dialog/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {RepositoryService} from 'src/app/services/rest/repository.service';
import {ModelConstructService} from 'src/app/services/model-construct.service';
import {MapperService} from 'src/app/services/rest/mapper.service';
import {conditionalValidator} from 'src/app/validators/conditional.validator';
import {environment} from 'src/environments/environment';
import {ColumnImpl} from '../../../models/column-impl';
import {MatTooltip} from '@angular/material/tooltip';
import {Namespaces} from '../../../models/namespaces';
import {NamespaceService} from '../../../services/namespace.service';

export interface SubjectMapperData {
  mappingData: Triple;
  selected: string;
  mappingDetails: MappingDetails;
  sources: any[];
  namespaces: Namespaces;
  repoNamespaces: Namespaces;
  dropped;
}

@Component({
  selector: 'app-mapper-dialog',
  templateUrl: './mapper-dialog.component.html',
  styleUrls: ['./mapper-dialog.component.scss'],
})
export class MapperDialogComponent extends OnDestroyMixin implements OnInit {
  SUBJECT = SUBJECT_SELECTOR;
  PREDICATE = PREDICATE_SELECTOR;
  OBJECT = OBJECT_SELECTOR;
  environment = environment;

  @ViewChild('tooltip') tooltip: MatTooltip;
  mapperForm: FormGroup;
  mapperForm$: Observable<FormGroup>;
  selected: MappingBase;
  isTypeProperty: boolean;
  typeKeys: string[];
  types: string[];
  valueTransformationLangs: string[];
  datatypeTransformationLangs: string[];
  languageTransformationLangs: string[];
  sources: string[];
  mappingDetails: MappingDetails;
  showOptions: boolean;
  isConstant: boolean;
  isColumn: boolean;
  isDataTypePrefixTransformation: boolean;
  isDatatypeConstant: boolean;
  isDatatypeColumn: boolean;
  isLanguageConstant: boolean;
  isLanguageColumn: boolean;
  isLanguagePrefixTransformation: boolean;
  isTransformation: boolean;
  isDatatypeTransformation: boolean;
  isPrefixTransformation: boolean;
  isRawIri: boolean;
  hasDatatype: boolean;
  hasLanguage: boolean;
  filteredColumnNames: Observable<string[]>;
  filteredNamespaces: Observable<any>;
  filteredConstants: Observable<Observable<any>>;
  grelPreviewExpression: Observable<Array<any>>;
  grelPreviewLanguageTransformation: Observable<Array<any>>;
  grelPreviewDataTypeTransformation: Observable<Array<any>>;
  firstGrelPreviewDataTypeTransformation: any;
  title: string;
  hasChildren: boolean;
  optionTooltip: string;

  constructor(public dialogRef: MatDialogRef<MapperDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SubjectMapperData,
              private formBuilder: FormBuilder,
              private modelManagementService: ModelManagementService,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private repositoryService: RepositoryService,
              private modelConstructService: ModelConstructService,
              private mapperService: MapperService,
              private cdRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.setDialogStyle();
    this.mappingDetails = {...this.data.mappingDetails, ...{} as MappingDetails};
    this.init();
    this.mapperForm$ = of(this.createMapperForm(this.mappingDetails)).pipe(untilComponentDestroyed(this));

    this.showAppropriateFields();
    this.subscribeToValueChanges();

    this.subscribeToCheckDirty();
  }

  public onExpressionGrelPreviewOpen() {
    const expressionValue = this.mapperForm.get('expression').value;
    this.resolveGrelExpressionPreview(expressionValue);
  }

  public onLanguageGrelPreviewOpen() {
    const languageTransformation = this.mapperForm.get('languageTransformation').value;
    this.resolveGrelLanguagePreview(languageTransformation);
  }

  public onDataTypeGrelPreviewOpen() {
    const datatypeTransformation = this.mapperForm.get('datatypeTransformation').value;
    this.resolveGrelDataTypePreview(datatypeTransformation);
  }

  private setDialogStyle() {
    this.dialogRef.updatePosition({top: '50px'});
    this.dialogRef.updateSize('60%');
  }

  private init(): void {
    this.setSelected();
    this.setTypes();
    this.initTransformations();
    if (this.data.dropped) {
      this.setMappingData(this.data.dropped, this.mappingDetails);
    } else {
      this.setMappingData(this.selected, this.mappingDetails);
    }
    this.setHasChildren();
  }

  private setHasChildren() {
    let hasChildren = false;
    if (this.selected) {
      const propMapping = this.selected.getPropertyMappings();
      if (this.isOfType(Type.IRI) && propMapping && propMapping.length) {
        hasChildren = true;
      }
    }
    this.hasChildren = hasChildren;
  }

  private setSelected() {
    if (this.isSubject()) {
      this.selected = this.data.mappingData.getSubject();
      this.title = this.translateService.instant('LABELS.SUBJECT');
    } else if (this.isPredicate()) {
      this.selected = this.data.mappingData.getPredicate();
      this.title = this.translateService.instant('LABELS.PREDICATE');
    } else if (this.isObject()) {
      this.selected = this.data.mappingData.getObject();
      this.title = this.translateService.instant('LABELS.OBJECT');
    }
  }

  private setTypes() {
    this.isTypeProperty = this.data.mappingData.typeProperty();
    this.types = [];
    this.typeKeys = [];

    if (this.data.selected === this.OBJECT && !this.data.mappingData.isTypeProperty) {
      this.types.push(...Helper.enumToArray(Type));
      this.typeKeys.push(...Helper.enumKeysToArray(Type));
    } else if (this.data.selected === this.OBJECT && this.data.mappingData.isTypeProperty) {
      this.types.push(...Helper.enumToArray(TypeMapping));
      this.typeKeys.push(...Helper.enumToArray(TypeMapping));
    } else if (this.data.selected === this.SUBJECT && this.data.mappingData.getSubject() instanceof ValueMappingImpl) {
      this.types.push(...Helper.enumToArray(Type));
      this.typeKeys.push(...Helper.enumKeysToArray(Type));
    }

    this.sources = Helper.enumToArray(Source);
    this.typeKeys.push(...Helper.enumKeysToArray(Source));
    this.typeKeys.push(...Helper.enumKeysToArray(Language));
  }

  private initTransformations() {
    const iri = this.isOfType(Type.IRI);
    const valueType = this.selected && this.selected.getValueType();
    const isIri = !!(iri && this.selected && valueType || this.isTypeProperty);
    this.initTransformationModels(isIri, this.isOfType(Type.DatatypeLiteral));
  }

  private initTransformationModels(isIri: boolean, isDatatype: boolean) {
    // If type is IRI: value transformation can be prefix, raw or grel
    // If type is datatype literal: value transformation is grel, source transformation can be prefix,raw or grel
    // All other types can have only grel transformation
    if (this.isObject()) {
      if (isIri) {
        this.valueTransformationLangs = [Language.Prefix, Language.GREL, Language.Raw];
        this.datatypeTransformationLangs = [];
        this.languageTransformationLangs = [];
      } else if (isDatatype) {
        this.valueTransformationLangs = [Language.GREL];
        this.datatypeTransformationLangs = [Language.Prefix, Language.GREL, Language.Raw];
        this.languageTransformationLangs = [];
      } else {
        this.valueTransformationLangs = [Language.GREL];
        this.datatypeTransformationLangs = [Language.GREL];
        this.languageTransformationLangs = [Language.GREL];
      }
    } else {
      this.valueTransformationLangs = [Language.Prefix, Language.GREL, Language.Raw];
      this.datatypeTransformationLangs = [Language.Prefix, Language.GREL, Language.Raw];
      this.languageTransformationLangs = [Language.Prefix, Language.Raw];
    }
  }

  private isOfType(type: Type) {
    const valueType = this.selected && this.selected.getValueType();
    return !!(valueType && valueType.getType() === type);
  }

  private setMappingData(selected, mappingDetails) {
    mappingDetails.typeMapping = this.isTypeProperty;
    mappingDetails.columnName = mappingDetails.columnName || this.modelManagementService.getColumnName(selected);
    mappingDetails.source = mappingDetails.source || this.modelManagementService.getTypeSource(selected);
    mappingDetails.constant = this.modelManagementService.getConstant(selected);
    mappingDetails.type = this.checkIsTypePropertyObject() ? TypeMapping.a : this.modelManagementService.getType(selected);
    mappingDetails.expression = this.modelManagementService.getExpression(selected);
    mappingDetails.language = this.modelManagementService.getTransformationLanguage(selected);

    mappingDetails.hasDatatype = !!this.modelManagementService.getValueTypeDatatype(selected);
    mappingDetails.dataTypeValueSource = this.modelManagementService.getValueTypeDatatypeValueSource(selected) &&
      this.modelManagementService.getValueTypeDatatypeValueSource(selected).getSource();
    mappingDetails.dataTypeColumnName = this.modelManagementService.getValueTypeDatatypeValueColumnName(selected);
    mappingDetails.dataTypeConstant = this.modelManagementService.getValueTypeDatatypeValueConstant(selected);
    mappingDetails.datatypeTransformation = this.modelManagementService.getValueTypeDatatypeTransformationExpression(selected);
    mappingDetails.datatypeLanguage = this.modelManagementService.getValueTypeDatatypeTransformationLanguage(selected);

    mappingDetails.hasLanguage = !!this.modelManagementService.getValueTypeLanguage(selected);
    mappingDetails.languageValueSource = this.modelManagementService.getValueTypeLanguageValueSource(selected) &&
      this.modelManagementService.getValueTypeLanguageValueSource(selected).getSource();
    mappingDetails.languageColumnName = this.modelManagementService.getValueTypeLanguageColumnName(selected);
    mappingDetails.languageConstant = this.modelManagementService.getValueTypeLanguageConstant(selected);
    mappingDetails.languageTransformation = this.modelManagementService.getValueTypeLanguageTransformationExpression(selected);
    mappingDetails.languageTransformationLanguage = this.modelManagementService.getValueTypeLanguageTransformationLanguage(selected);
  }

  private createMapperForm(mappingDetails): FormGroup {
    const controlsConfig = {
      typeMapping: [mappingDetails.typeMapping],

      // Value type
      type: [mappingDetails.type, conditionalValidator(() => this.types.length > 0, Validators.required)],
      dataTypeValueSource: [mappingDetails.dataTypeValueSource, conditionalValidator(() => this.hasDatatype, Validators.required)],
      dataTypeColumnName: [mappingDetails.dataTypeColumnName, conditionalValidator(() => this.isDatatypeColumn, Validators.required)],
      dataTypeConstant: [mappingDetails.dataTypeConstant, conditionalValidator(() => this.isDatatypeConstant, Validators.required)],

      datatypeTransformation: [mappingDetails.datatypeTransformation],
      datatypeLanguage: [mappingDetails.datatypeLanguage],

      languageValueSource: [mappingDetails.languageValueSource, conditionalValidator(() => this.hasLanguage, Validators.required)],
      languageColumnName: [mappingDetails.languageColumnName, conditionalValidator(() => this.isLanguageColumn, Validators.required)],
      languageConstant: [mappingDetails.languageConstant, conditionalValidator(() => this.isLanguageConstant, Validators.required)],

      languageTransformation: [mappingDetails.languageTransformation],
      languageTransformationLanguage: [mappingDetails.languageTransformationLanguage],

      // Value source
      columnName: [mappingDetails.columnName, conditionalValidator(() => this.isColumn, Validators.required)],
      source: [mappingDetails.source, Validators.required],
      constant: [mappingDetails.constant, conditionalValidator(() => this.isConstant, Validators.required)],

      // Value transformation
      expression: [mappingDetails.expression],
      language: [mappingDetails.language],
    };
    this.mapperForm = this.formBuilder.group(controlsConfig);

    return this.mapperForm;
  }

  private showAppropriateFields() {
    this.showOptions = (this.PREDICATE !== this.data.selected || !this.isTypeProperty) ||
      this.mapperForm.get('typeMapping').value && this.PREDICATE !== this.data.selected;

    this.isColumn = !!this.mappingDetails.columnName;
    this.isConstant = !!this.mappingDetails.constant;

    this.hasDatatype = this.mappingDetails.hasDatatype;
    this.isDatatypeConstant = !!this.mappingDetails.dataTypeConstant;
    this.isDatatypeColumn = !!this.mappingDetails.dataTypeColumnName;
    this.isDatatypeTransformation = !!this.mappingDetails.datatypeLanguage && this.mappingDetails.datatypeLanguage !== Language.Raw;
    this.isDataTypePrefixTransformation = this.hasDatatype && !!this.mappingDetails.datatypeLanguage && this.mappingDetails.datatypeLanguage === Language.Prefix;

    this.hasLanguage = this.mappingDetails.hasLanguage;
    this.isLanguageColumn = !!this.mappingDetails.languageColumnName;
    this.isLanguageConstant = !!this.mappingDetails.languageConstant;
    this.isLanguagePrefixTransformation = this.hasLanguage && !!this.mappingDetails.languageTransformationLanguage && this.mappingDetails.languageTransformationLanguage === Language.Prefix;

    this.isTransformation = !!this.mappingDetails.language && this.mappingDetails.language !== Language.Raw;
    this.isPrefixTransformation = this.isTransformation && this.mappingDetails.language === Language.Prefix;
  }

  private resolveGrelExpressionPreview(value?: string) {
    if (value && !this.isPrefixTransformation) {
      this.grelPreviewExpression = this.previewGREL(value);
    } else {
      this.grelPreviewExpression = EMPTY.pipe(untilComponentDestroyed(this));
    }
  }

  private resolveGrelLanguagePreview(value?: string) {
    if (value && !this.isLanguagePrefixTransformation) {
      this.grelPreviewLanguageTransformation = this.previewLanguageGREL(value);
    } else {
      this.grelPreviewLanguageTransformation = EMPTY.pipe(untilComponentDestroyed(this));
    }
  }

  private resolveGrelDataTypePreview(value?: string) {
    if (value && !this.isDataTypePrefixTransformation) {
      this.grelPreviewDataTypeTransformation = this.previewDataTypeGREL(value);
      this.firstGrelPreviewDataTypeTransformation = this.grelPreviewDataTypeTransformation[0];
    } else {
      this.grelPreviewDataTypeTransformation = EMPTY.pipe(untilComponentDestroyed(this));
    }
  }

  private subscribeToValueChanges() {
    this.mapperForm.get('typeMapping').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.showOptions = !value;
        });

    this.mapperForm.get('source').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isColumn = value === Source.Column;
          this.isConstant = value === Source.Constant;

          if (this.isColumn) {
            this.mapperForm.get('columnName').markAsTouched();
          } else if (this.isConstant) {
            this.mapperForm.get('constant').markAsTouched();
          }
          this.mapperForm.get('columnName').updateValueAndValidity();
          this.mapperForm.get('constant').updateValueAndValidity();
        });

    const configureTransformations = (value) => {
      // Reset the transformation buttons status a.k.a. deselect them in order to have a clear state on each type change
      // otherwise the buttons stays selected and the field might be visible when it shouldn't.
      this.mapperForm.get('datatypeLanguage').reset();
      this.mapperForm.get('languageTransformationLanguage').reset();
      this.mapperForm.get('language').reset();
      // Clear the expression fields
      this.mapperForm.patchValue({datatypeTransformation: ''});
      this.mapperForm.patchValue({languageTransformation: ''});
      this.mapperForm.patchValue({expression: ''});
      const isIri = value === Type.IRI;
      const isDatatypeLiteral = value === Type.DatatypeLiteral;
      this.initTransformationModels(isIri, isDatatypeLiteral);
    };

    this.mapperForm.get('type').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          configureTransformations(value);
          this.hasDatatype = value === Type.DatatypeLiteral;
          this.hasLanguage = value === Type.LanguageLiteral;
          this.mapperForm.get('dataTypeValueSource').updateValueAndValidity();
          this.mapperForm.get('languageValueSource').updateValueAndValidity();
        });

    this.mapperForm.get('dataTypeValueSource').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isDatatypeColumn = value === Source.Column;
          this.isDatatypeConstant = value === Source.Constant;

          if (this.isDatatypeColumn) {
            this.mapperForm.get('dataTypeColumnName').markAsTouched();
          } else if (this.isDatatypeConstant) {
            this.mapperForm.get('dataTypeConstant').markAsTouched();
          }
          this.mapperForm.get('dataTypeColumnName').updateValueAndValidity();
          this.mapperForm.get('dataTypeConstant').updateValueAndValidity();
        });

    this.mapperForm.get('languageValueSource').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isLanguageColumn = value === Source.Column;
          this.isLanguageConstant = value === Source.Constant;

          if (this.isLanguageColumn) {
            this.mapperForm.get('languageColumnName').markAsTouched();
          } else if (this.isLanguageConstant) {
            this.mapperForm.get('languageConstant').markAsTouched();
          }
          this.mapperForm.get('languageColumnName').updateValueAndValidity();
          this.mapperForm.get('languageConstant').updateValueAndValidity();
        });

    this.mapperForm.get('language').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isTransformation = value === Language.GREL || value === Language.Prefix;
          this.isPrefixTransformation = this.isTransformation && value === Language.Prefix;
          this.isRawIri = value === Language.Raw;
          this.mapperForm.patchValue({expression: ''});
        });

    this.mapperForm.get('datatypeLanguage').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isDatatypeTransformation = value === Language.GREL || value === Language.Prefix;
          this.isDataTypePrefixTransformation = value === Language.Prefix;
          this.mapperForm.patchValue({datatypeTransformation: ''});
        });

    this.mapperForm.get('languageTransformationLanguage').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isLanguagePrefixTransformation = value === Language.Prefix;
          this.mapperForm.patchValue({languageTransformation: ''});
        });

    this.filteredConstants = merge(this.mapperForm.get('dataTypeConstant').valueChanges, this.mapperForm.get('constant').valueChanges)
        .pipe(untilComponentDestroyed(this),
            map((value) => {
              let autoCompleteObservable = this.repositoryService.autocompleteIRIs(value);
              if (this.isTypeProperty) {
                autoCompleteObservable = this.repositoryService.autocompleteTypes(value);
              }
              if (this.isPredicate()) {
                autoCompleteObservable = this.repositoryService.autocompletePredicates(value);
              }
              return autoCompleteObservable.pipe(
                  untilComponentDestroyed(this),
                  map((types) => this.modelConstructService.replaceIRIPrefixes(types, this.getCombinedNamespaces())),
              );
            }));

    this.filteredColumnNames = merge(this.mapperForm.get('columnName').valueChanges, this.mapperForm.get('dataTypeColumnName').valueChanges)
        .pipe(untilComponentDestroyed(this),
            startWith(''),
            map((value) => this.filterColumn(value)));

    this.mapperForm.get('expression').valueChanges
        .pipe(untilComponentDestroyed(this), debounceTime(500))
        .subscribe((value) => {
          this.resolveGrelExpressionPreview(value);
        });

    this.mapperForm.get('languageTransformation').valueChanges
        .pipe(untilComponentDestroyed(this), debounceTime(500))
        .subscribe((value) => {
          this.resolveGrelLanguagePreview(value);
        });

    this.mapperForm.get('datatypeTransformation').valueChanges
        .pipe(untilComponentDestroyed(this), debounceTime(500))
        .subscribe((value) => {
          this.resolveGrelDataTypePreview(value);
        });

    this.filteredNamespaces = merge(this.mapperForm.get('expression').valueChanges, this.mapperForm.get('datatypeTransformation').valueChanges, this.mapperForm.get('languageTransformation').valueChanges)
        .pipe(untilComponentDestroyed(this),
            startWith(''),
            map((value) => this.repositoryService.filterNamespace(this.getCombinedNamespaces(), value)));
  }

  private getCombinedNamespaces() {
    return NamespaceService.mergeNamespaces(this.data.namespaces, this.data.repoNamespaces);
  }

  private previewGREL(value) {
    return this.previewGRELWithValueSource(value, new ColumnImpl(this.mapperForm.get('columnName').value,
      this.mapperForm.get('source').value as Source, this.mapperForm.get('constant').value));
  }

  private previewLanguageGREL(value) {
    return this.previewGRELWithValueSource(value, new ColumnImpl(this.mapperForm.get('languageColumnName').value,
      this.mapperForm.get('languageValueSource').value as Source, this.mapperForm.get('languageConstant').value));
  }

  private previewDataTypeGREL(value) {
    return this.previewGRELWithValueSource(value, new ColumnImpl(this.mapperForm.get('dataTypeColumnName').value,
      this.mapperForm.get('dataTypeValueSource').value as Source, this.mapperForm.get('dataTypeConstant').value));
  }

  private canPreviewValueSource(valueSource: ColumnImpl) {
    if (!valueSource.getSource()) {
      return false;
    }
    if (Source.Column === valueSource.getSource() && !valueSource.columnName) {
      return false;
    }
    if (Source.Constant === valueSource.getSource() && !valueSource.constant) {
      return false;
    }
    return true;
  }

  private previewGRELWithValueSource(value, valueSource: ColumnImpl) {
    if (!this.canPreviewValueSource(valueSource)) {
      return EMPTY.pipe(untilComponentDestroyed(this));
    }
    return this.mapperService.previewGREL(valueSource, value)
        .pipe(untilComponentDestroyed(this), map((response) => {
          const errors = response.map((e) => (e && e.error) ? e.error : e)
              .filter((val, index, self) => self.indexOf(val) === index);
          // Do not show the same error multiple times if it is the same for all results
          if (errors.length === 1) {
            // there might be an element with null value
            return errors[0] !== null && errors;
          }
          return response;
        }));
  }

  private filterColumn(value: string): string[] {
    return this.data.sources.filter((source) => source.title.toLowerCase().includes(value && value.toLowerCase()));
  }

  private subscribeToCheckDirty() {
    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick()
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.checkDirty();
        });

    this.dialogRef.keydownEvents()
        .pipe(untilComponentDestroyed(this))
        .subscribe((event) => {
          if (event.key === 'Escape' || event.key === 'Esc') {
            this.checkDirty();
          }
        });
  }

  public save() {
    this.mapperForm$
        .pipe(takeUntil(componentDestroyed(this)))
        .subscribe((form) => {
          const settings = {
            hasDatatype: this.hasDatatype,
            hasLanguage: this.hasLanguage,
            isDatatypeColumn: this.isDatatypeColumn,
            isDatatypeConstant: this.isDatatypeConstant,
            isLanguageColumn: this.isLanguageColumn,
            isLanguageConstant: this.isLanguageConstant,
            isConstant: this.isConstant,
            isColumn: this.isColumn,
            isTransformation: this.isTransformation,
            isRoot: this.data.mappingData.isRoot,
            selected: this.data.selected,
            namespaces: this.data.namespaces,
            repoNamespaces: this.data.repoNamespaces,
          };

          const formValue = form.getRawValue();

          if (this.isConstant) {
            const value = formValue.constant;
            const combinedNamespaces = NamespaceService.mergeNamespaces(settings.repoNamespaces, settings.namespaces);
            const prefixTransformation = this.modelConstructService.getPrefixTransformation(value, combinedNamespaces);
            const prefix = prefixTransformation && prefixTransformation.prefix;

            if (settings.selected === this.PREDICATE && this.modelConstructService.isTypeMappingPredicate(value, formValue.expression)) {
              formValue.typeMapping = true;
              formValue.constant = null;
              formValue.expression = null;
              formValue.source = null;
              formValue.language = null;

              settings.isConstant = false;
              settings.isTransformation = false;
            } else if (prefix) {
              settings.isTransformation = true;
              formValue.expression = prefix;
              formValue.language = Language.Prefix;
            }
          }

          if (this.selected) {
            this.modelConstructService.clearMapping(this.selected);
            this.modelConstructService.setCellMapping(this.selected, formValue, settings);
          } else {
            this.selected = this.modelConstructService.createMappingObject(formValue, settings);
            this.modelConstructService.setCellMapping(this.selected, formValue, settings);
            this.modelConstructService.setMappingObjectInTriple(this.selected, formValue, settings, this.data.mappingData);
          }
        });
  }

  public isSubject(): boolean {
    return this.SUBJECT === this.data.selected;
  }

  public isPredicate(): boolean {
    return this.PREDICATE === this.data.selected;
  }

  public isObject(): boolean {
    return this.OBJECT === this.data.selected;
  }

  public checkIsTypePropertyObject(): boolean {
    return this.isTypeProperty && this.isObject();
  }

  public getType(type: string) {
    return this.translateService.instant('TYPE.' + type.toUpperCase());
  }

  public isTypes() {
    return this.types.length > 0;
  }

  private checkDirty(event?) {
    if (this.mapperForm.dirty) {
      if (event) {
        event.preventDefault();
        event.returnValue = '';
      }
      this.dialogService.confirm({
        content: this.translateService.instant('MESSAGES.DISCARD_CHANGES'),
      }).pipe(untilComponentDestroyed(this))
          .subscribe((result) => {
            if (result) {
              this.dialogRef.close();
            }
          });
    } else {
      this.dialogRef.close();
    }
  }

  public isMappingInvalid() {
    const isTypeMapping = this.mapperForm.get('typeMapping').value;
    const isFormValid = this.mapperForm.valid;
    let invalid = true;
    // When configuring a predicate the type and source could be changed simultaneously.
    // In which case we consider the configuration as invalid if the form is invalid and
    // the type is not "a".
    // When configuring an object or subject the type is set and can't be changed. So we
    // consider configuration as invalid only when the form is invalid.
    if (this.isObject() || this.isSubject()) {
      invalid = !isFormValid;
    } else {
      invalid = !isFormValid && !isTypeMapping;
    }
    return invalid;
  }

  public getIriDescription(option) {
    return this.repositoryService.getIriDescription(option.value as string)
        .pipe(untilComponentDestroyed(this), debounceTime(500))
        .subscribe((description) => {
          this.optionTooltip = description[0];
          this.cdRef.detectChanges();
          this.tooltip.show();
        });
  }

  public clearTooltip() {
    this.optionTooltip = '';
  }
}
