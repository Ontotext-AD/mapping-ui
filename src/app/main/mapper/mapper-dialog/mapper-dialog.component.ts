import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {Triple} from 'src/app/models/triple';
import {OBJECT_SELECTOR, PREDICATE_SELECTOR, SUBJECT_SELECTOR} from 'src/app/utils/constants';
import {Source, Type} from 'src/app/models/mapping-definition';
import {Helper} from 'src/app/utils/helper';
import {takeUntil} from 'rxjs/operators';
import {componentDestroyed, OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {MappingDetails} from 'src/app/models/mapping-details';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {Language} from 'src/app/models/language';
import {MappingBase} from 'src/app/models/mapping-base';

export interface SubjectMapperData {
  mappingData: Triple,
  selected: string
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
  clone: MappingBase;
  isTypeProperty: boolean
  typeKeys: string[];
  types: string[];
  typeTransformationLangs: string[];
  sources: string[];
  mappingDetails: MappingDetails;
  showOptions: boolean;
  isConstant: boolean;
  isColumn: boolean;
  isDatatypeConstant: boolean;
  isDatatypeColumn: boolean;
  isLanguageConstant: boolean;
  isLanguageColumn: boolean;
  isTransformation: boolean;
  hasDatatype: boolean;
  hasLanguage: boolean

  constructor(public dialogRef: MatDialogRef<MapperDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SubjectMapperData,
              private formBuilder: FormBuilder,
              private modelManagementService: ModelManagementService) {
    super();
  }

  ngOnInit(): void {
    this.mappingDetails = {} as MappingDetails;

    this.init();
    this.mapperForm$ = of(this.createMapperForm(this.mappingDetails));

    this.showAppropriateFields();
    this.subscribeToValueChanges();
  }

  private init(): void {
    this.setSelected();
    this.setTypes();
    this.setMappingData(this.selected, this.mappingDetails);
  }

  private setSelected() {
    if (this.SUBJECT === this.data.selected) {
      this.selected = this.data.mappingData.getSubject();
    } else if (this.PREDICATE === this.data.selected) {
      this.selected = this.data.mappingData.getPredicate();
    } else if (this.OBJECT === this.data.selected) {
      this.selected = this.data.mappingData.getObject();
    }
  }

  private setTypes() {
    this.isTypeProperty = this.data.mappingData.typeProperty();

    this.types = Helper.enumToArray(Type);
    this.typeKeys = Helper.enumKeysToArray(Type);

    this.sources = Helper.enumToArray(Source);
    this.typeKeys.push(...Helper.enumKeysToArray(Source));

    this.typeTransformationLangs = Helper.enumToArray(Language);
    this.typeKeys.push(...Helper.enumKeysToArray(Language));
  }

  private setMappingData(selected, mappingDetails) {
    mappingDetails.typeMapping = this.isTypeProperty;
    mappingDetails.columnName = this.modelManagementService.getColumnName(selected);
    mappingDetails.source = this.modelManagementService.getTypeSource(selected);
    mappingDetails.constant = this.modelManagementService.getConstant(selected);
    mappingDetails.type = this.modelManagementService.getType(selected);
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

    this.hasLanguage = !!this.mappingDetails.hasLanguage;
    this.isLanguageColumn = !!this.mappingDetails.languageColumnName;
    this.isLanguageConstant = !!this.mappingDetails.languageConstant;

    this.isTransformation = !!this.mappingDetails.language;
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
        });
  }

  public save() {
    this.mapperForm$
        .pipe(takeUntil(componentDestroyed(this)))
        .subscribe((form) => {
          this.modelManagementService.clearMapping(this.selected);
          this.modelManagementService.setValueType(this.selected, form.value.type);
          this.modelManagementService.setTypeSource(this.selected, form.value.source);

          const constant = form.value.constant;
          if (this.isConstant && !Helper.isBlank(constant)) {
            this.modelManagementService.setConstant(this.selected, constant);
          }

          const columnName = form.value.columnName;
          if (this.isColumn && !Helper.isBlank(columnName)) {
            this.modelManagementService.setColumnName(this.selected, columnName);
          }

          const expression = form.value.expression;
          if (this.isTransformation && !Helper.isBlank(expression)) {
            this.modelManagementService.setExpression(this.selected, expression);
            this.modelManagementService.setTransformationLanguage(this.selected, form.value.language);
          }

          if (this.hasDatatype) {
            const dataTypeColumnName = form.value.dataTypeColumnName;
            const dataTypeConstant = form.value.dataTypeConstant;

            if (this.isDatatypeColumn && !Helper.isBlank(dataTypeColumnName)) {
              this.modelManagementService.setValueTypeDatatypeValueConstant(this.selected, undefined);
              this.modelManagementService.setValueTypeDatatypeValueColumnName(this.selected, dataTypeColumnName);
              this.modelManagementService.setValueTypeDatatypeValueSource(this.selected, form.value.dataTypeValueSource);
            } else if (this.isDatatypeConstant && !Helper.isBlank(dataTypeConstant)) {
              this.modelManagementService.setValueTypeDatatypeValueColumnName(this.selected, undefined);
              this.modelManagementService.setValueTypeDatatypeValueConstant(this.selected, dataTypeConstant);
              this.modelManagementService.setValueTypeDatatypeValueSource(this.selected, form.value.dataTypeValueSource);
            } else if (!this.isDatatypeConstant && !this.isDatatypeColumn) {
              this.modelManagementService.setValueTypeDatatypeValueConstant(this.selected, undefined);
              this.modelManagementService.setValueTypeDatatypeValueColumnName(this.selected, undefined);
              this.modelManagementService.setValueTypeDatatypeValueSource(this.selected, form.value.dataTypeValueSource);
            }

            const datatypeTransformation = form.value.datatypeTransformation;
            if (!Helper.isBlank(datatypeTransformation)) {
              this.modelManagementService.setValueTypeDatatypeTransformationExpression(this.selected, datatypeTransformation);
              this.modelManagementService.setDatatypeTransformationLanguage(this.selected, form.value.datatypeLanguage);
            }
          }

          if (this.hasLanguage) {
            const languageColumnName = form.value.languageColumnName;
            const languageConstant = form.value.languageConstant;

            if (this.isLanguageColumn && !Helper.isBlank(languageColumnName)) {
              this.modelManagementService.setValueTypeLanguageConstant(this.selected, undefined);
              this.modelManagementService.setValueTypeLanguageColumnName(this.selected, languageColumnName);
              this.modelManagementService.setValueTypeLanguageValueSource(this.selected, form.value.languageValueSource);
            } else if (this.isLanguageConstant && !Helper.isBlank(languageConstant)) {
              this.modelManagementService.setValueTypeLanguageColumnName(this.selected, undefined);
              this.modelManagementService.setValueTypeLanguageConstant(this.selected, languageConstant);
              this.modelManagementService.setValueTypeLanguageValueSource(this.selected, form.value.languageValueSource);
            } else if (!this.isLanguageConstant && !this.isLanguageColumn) {
              this.modelManagementService.setValueTypeLanguageConstant(this.selected, undefined);
              this.modelManagementService.setValueTypeLanguageColumnName(this.selected, undefined);
              this.modelManagementService.setValueTypeLanguageValueSource(this.selected, form.value.languageValueSource);
            }

            const languageTransformation = form.value.languageTransformation;
            if (!Helper.isBlank(languageTransformation)) {
              this.modelManagementService.setValueTypeLanguageTransformationExpression(this.selected, languageTransformation);
              this.modelManagementService.setValueTypeLanguageTransformationLanguage(this.selected, form.value.languageTransformationLanguage);
            }
          }
        });
  }

  public ngOnDestroy(): void {
  }

  public checkIsTypeProperty(): boolean {
    return this.isTypeProperty && this.PREDICATE === this.data.selected;
  }

  public getType(typ: string) {
    return Helper.getEnumKeyByEnumValue(Type, typ) || Helper.getEnumKeyByEnumValue(Source, typ) ||
      Helper.getEnumKeyByEnumValue(Language, typ);
  }
}
