import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@angular/forms';
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

  constructor(public dialogRef: MatDialogRef<MapperDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SubjectMapperData,
              private formBuilder: FormBuilder,
              private modelManagementService: ModelManagementService,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private repositoryService: RepositoryService,
              private modelConstructService: ModelConstructService) {
    super();
  }

  ngOnInit(): void {
    this.mappingDetails = {...this.data.mappingDetails, ...{} as MappingDetails};
    this.init();
    this.mapperForm$ = of(this.createMapperForm(this.mappingDetails));

    this.showAppropriateFields();
    this.subscribeToValueChanges();

    this.subscribeToCheckDirty();
  }

  private init(): void {
    this.setSelected();
    this.setTypes();
    if (this.data.dropped) {
      this.setMappingData(this.data.dropped, this.mappingDetails);
    } else {
      this.setMappingData(this.selected, this.mappingDetails);
    }
  }

  private setSelected() {
    if (this.isSubject()) {
      this.selected = this.data.mappingData.getSubject();
    } else if (this.isPredicate()) {
      this.selected = this.data.mappingData.getPredicate();
    } else if (this.isObject()) {
      this.selected = this.data.mappingData.getObject();
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
      type: [mappingDetails.type],
      dataTypeValueSource: [mappingDetails.dataTypeValueSource],
      dataTypeColumnName: [mappingDetails.dataTypeColumnName],
      dataTypeConstant: [mappingDetails.dataTypeConstant],

      datatypeTransformation: [mappingDetails.datatypeTransformation],
      datatypeLanguage: [mappingDetails.datatypeLanguage],

      languageValueSource: [mappingDetails.languageValueSource],
      languageColumnName: [mappingDetails.languageColumnName],
      languageConstant: [mappingDetails.languageConstant],

      languageTransformation: [mappingDetails.languageTransformation],
      languageTransformationLanguage: [mappingDetails.languageTransformationLanguage],

      // Value source
      columnName: [mappingDetails.columnName],
      source: [mappingDetails.source],
      constant: [mappingDetails.constant],

      // Value transformation
      expression: [mappingDetails.expression],
      language: [mappingDetails.language],
    });

    return this.mapperForm;
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
        });

    this.mapperForm.get('type').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.hasDatatype = value === Type.DatatypeLiteral;
          this.hasLanguage = value === Type.LanguageLiteral;
        });

    this.mapperForm.get('dataTypeValueSource').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isDatatypeColumn = value === Source.Column;
          this.isDatatypeConstant = value === Source.Constant;
        });

    this.mapperForm.get('languageValueSource').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isLanguageColumn = value === Source.Column;
          this.isLanguageConstant = value === Source.Constant;
        });

    this.mapperForm.get('language').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isTransformation = value === Language.GREL || value === Language.Prefix;
          this.isPrefixTransformation = this.isTransformation && value === Language.Prefix;
        });

    this.mapperForm.get('datatypeLanguage').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isDataTypePrefixTransformation = value === Language.Prefix;
        });

    this.mapperForm.get('languageTransformationLanguage').valueChanges
        .pipe(untilComponentDestroyed(this))
        .subscribe((value) => {
          this.isLanguagePrefixTransformation = value === Language.Prefix;
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

    this.filteredNamespaces = merge(this.mapperForm.get('expression').valueChanges, this.mapperForm.get('datatypeTransformation').valueChanges, this.mapperForm.get('languageTransformation').valueChanges)
        .pipe(untilComponentDestroyed(this),
            startWith(''),
            map((value) => this.filterNamespace(value)));
  }

  private filterNamespace(value: string): object[] {
    return Object.entries({...this.data.namespaces, ...this.data.repoNamespaces}).map(([prefix, value]) => ({prefix, value}))
        .filter((namespace) => namespace.prefix.toLowerCase().startsWith(value.toLowerCase()));
  }

  private filterColumn(value: string): string[] {
    return this.data.sources.filter((source) => source.title.toLowerCase().includes(value.toLowerCase()));
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

  public getType(typ: string) {
    return Helper.getEnumKeyByEnumValue(Type, typ) || Helper.getEnumKeyByEnumValue(Source, typ) ||
      Helper.getEnumKeyByEnumValue(Language, typ) || Helper.getEnumKeyByEnumValue(TypeMapping, typ);
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
}
