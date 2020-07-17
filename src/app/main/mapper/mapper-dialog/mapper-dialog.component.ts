import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {merge, Observable, of} from 'rxjs';
import {Triple} from 'src/app/models/triple';
import {OBJECT_SELECTOR, PREDICATE_SELECTOR, SUBJECT_SELECTOR} from 'src/app/utils/constants';
import {Source, Type} from 'src/app/models/mapping-definition';
import {Helper} from 'src/app/utils/helper';
import {map, startWith, takeUntil} from 'rxjs/operators';
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

export interface SubjectMapperData {
  mappingData: Triple,
  selected: string,
  mappingDetails: MappingDetails,
  sources: any[],
  namespaces: { [p: string]: string },
  repoNamespaces: { [p: string]: string },
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

  mapperForm: FormGroup;
  mapperForm$: Observable<FormGroup>;
  selected: MappingBase;
  isTypeProperty: boolean;
  typeKeys: string[];
  types: string[];
  typeTransformationLangs: string[];
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
  isPrefixTransformation: boolean;
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
  showDataTypeTransformation: boolean = false;
  showLanguageTransformation: boolean = false;
  showTransformation: boolean = false;

  constructor(public dialogRef: MatDialogRef<MapperDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SubjectMapperData,
              private formBuilder: FormBuilder,
              private modelManagementService: ModelManagementService,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private repositoryService: RepositoryService,
              private modelConstructService: ModelConstructService,
              private mapperService: MapperService) {
    super();
  }

  ngOnInit(): void {
    this.setDialogStyle();
    this.mappingDetails = {...this.data.mappingDetails, ...{} as MappingDetails};
    this.init();
    this.mapperForm$ = of(this.createMapperForm(this.mappingDetails));

    this.showAppropriateFields();
    this.subscribeToValueChanges();

    this.subscribeToCheckDirty();
  }

  private setDialogStyle() {
    this.dialogRef.updatePosition({top: '50px'});
    this.dialogRef.updateSize('60%');
  }

  private init(): void {
    this.setSelected();
    this.setTypes();
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
      const valueType = this.selected.getValueType();
      const isIRI = valueType && valueType.getType() === Type.IRI;
      const propMapping = this.selected.getPropertyMappings();
      if (isIRI && propMapping && propMapping.length) {
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

    this.typeTransformationLangs = Helper.enumToArray(Language);
    this.typeKeys.push(...Helper.enumKeysToArray(Language));
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
    this.mapperForm = this.formBuilder.group({
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
    });

    return this.mapperForm;
  }

  isDatatype() {
    return this.mapperForm.get('dataTypeValueSource').value;
  }

  private showAppropriateFields() {
    this.showOptions = (this.PREDICATE !== this.data.selected || !this.isTypeProperty) ||
      this.mapperForm.get('typeMapping').value && this.PREDICATE !== this.data.selected;

    this.isColumn = !!this.mappingDetails.columnName;
    this.isConstant = !!this.mappingDetails.constant;

    this.hasDatatype = !!this.mappingDetails.hasDatatype;
    this.isDatatypeConstant = !!this.mappingDetails.dataTypeConstant;
    this.isDatatypeColumn = !!this.mappingDetails.dataTypeColumnName;
    this.isDataTypePrefixTransformation = this.hasDatatype && !!this.mappingDetails.datatypeLanguage && this.mappingDetails.datatypeLanguage === Language.Prefix;


    this.hasLanguage = !!this.mappingDetails.hasLanguage;
    this.isLanguageColumn = !!this.mappingDetails.languageColumnName;
    this.isLanguageConstant = !!this.mappingDetails.languageConstant;
    this.isLanguagePrefixTransformation = this.hasLanguage && !!this.mappingDetails.languageTransformationLanguage && this.mappingDetails.languageTransformationLanguage === Language.Prefix;

    this.isTransformation = !!this.mappingDetails.language;
    this.isPrefixTransformation = this.isTransformation && this.mappingDetails.language === Language.Prefix;
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

    this.mapperForm.get('type').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
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
          this.mapperForm.patchValue({'expression': ''});
        });

    this.mapperForm.get('datatypeLanguage').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isDataTypePrefixTransformation = value === Language.Prefix;
          this.mapperForm.patchValue({'datatypeTransformation': ''});
        });

    this.mapperForm.get('languageTransformationLanguage').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isLanguagePrefixTransformation = value === Language.Prefix;
          this.mapperForm.patchValue({'languageTransformation': ''});
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
              return autoCompleteObservable.pipe(map((types) => this.modelConstructService.replaceIRIPrefixes(types, {...this.data.namespaces, ...this.data.repoNamespaces})));
            }));

    this.filteredColumnNames = merge(this.mapperForm.get('columnName').valueChanges, this.mapperForm.get('dataTypeColumnName').valueChanges)
        .pipe(untilComponentDestroyed(this),
            startWith(''),
            map((value) => this.filterColumn(value)));

    this.mapperForm.get('expression').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          if (value && !this.isPrefixTransformation) {
            this.grelPreviewExpression = this.previewGREL(value);
          }
        });

    this.mapperForm.get('languageTransformation').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          if (value && !this.isLanguagePrefixTransformation) {
            this.grelPreviewLanguageTransformation = this.previewGREL(value);
          }
        });

    this.mapperForm.get('datatypeTransformation').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          if (value && !this.isDataTypePrefixTransformation) {
            this.grelPreviewDataTypeTransformation = this.previewGREL(value);
            this.firstGrelPreviewDataTypeTransformation = this.grelPreviewDataTypeTransformation[0];
          }
        });

    this.filteredNamespaces = merge(this.mapperForm.get('expression').valueChanges, this.mapperForm.get('datatypeTransformation').valueChanges, this.mapperForm.get('languageTransformation').valueChanges)
        .pipe(untilComponentDestroyed(this),
            startWith(''),
            map((value) => this.filterNamespace(value)));
  }

  private previewGREL(value) {
    return this.mapperService.previewGREL(this.modelManagementService.getValueSource(this.selected), value)
        .pipe(untilComponentDestroyed(this), map((value) => {
          const errors = value.map((e) => (e && e.error) ? e.error : e)
              .filter((val, index, self) => self.indexOf(val) === index);
          // Do not show the same error multiple times if it is the same for all results
          if (errors.length === 1) {
            return errors;
          }
          return value;
        }));
  }

  private filterNamespace(value: string): object[] {
    return Object.entries({...this.data.namespaces, ...this.data.repoNamespaces}).map(([prefix, value]) => ({prefix, value}))
        .filter((namespace) => namespace.prefix.toLowerCase().startsWith(value.toLowerCase()));
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
}
