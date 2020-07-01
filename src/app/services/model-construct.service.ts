import {Injectable} from '@angular/core';
import {MappingBase} from 'src/app/models/mapping-base';
import {Helper} from 'src/app/utils/helper';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {TypeMapping} from 'src/app/models/type-mapping';
import {OBJECT_SELECTOR, PREDICATE_SELECTOR, SUBJECT_SELECTOR} from 'src/app/utils/constants';
import {SubjectMappingImpl} from 'src/app/models/subject-mapping-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {Type} from 'src/app/models/mapping-definition';
import {ValueMappingImpl} from 'src/app/models/value-mapping-impl';
import {IRIImpl} from 'src/app/models/iri-impl';
import {Triple} from 'src/app/models/triple';
import {Language} from 'src/app/models/language';

@Injectable({
  providedIn: 'root',
})
export class ModelConstructService {
  constructor(private modelManagementService: ModelManagementService) {

  }

  clearMapping(cellMapping: MappingBase): void {
    cellMapping.clearMapping();
  }

  setCellMapping(cellMapping: MappingBase, form, settings) {
    this.setValueType(cellMapping, form, settings);
    this.setTypeSource(cellMapping, form, settings);
    this.setTypeTransformation(cellMapping, form, settings);
  }

  private setValueType(cellMapping: MappingBase, form, settings): void {
    this.modelManagementService.setValueType(cellMapping, form.type);

    if (settings.hasDatatype) {
      const dataTypeColumnName = form.dataTypeColumnName;
      const dataTypeConstant = form.dataTypeConstant;

      if (settings.isDatatypeColumn && !Helper.isBlank(dataTypeColumnName)) {
        this.modelManagementService.setValueTypeDatatypeValueConstant(cellMapping, undefined);
        this.modelManagementService.setValueTypeDatatypeValueColumnName(cellMapping, dataTypeColumnName);
        this.modelManagementService.setValueTypeDatatypeValueSource(cellMapping, form.dataTypeValueSource);
      } else if (settings.isDatatypeConstant && !Helper.isBlank(dataTypeConstant)) {
        this.modelManagementService.setValueTypeDatatypeValueColumnName(cellMapping, undefined);
        this.modelManagementService.setValueTypeDatatypeValueConstant(cellMapping, dataTypeConstant);
        const transformed = this.getPrefixTransformation(dataTypeConstant, settings);
        if (transformed.prefix != undefined) {
          this.modelManagementService.setValueTypeDatatypeValueConstant(cellMapping, transformed.suffix);
          this.setDataTypeTransformation(cellMapping, settings, transformed.prefix, Language.Prefix.valueOf());
        }
        this.modelManagementService.setValueTypeDatatypeValueSource(cellMapping, form.dataTypeValueSource);
      } else if (!settings.isDatatypeConstant && !settings.isDatatypeColumn) {
        this.modelManagementService.setValueTypeDatatypeValueConstant(cellMapping, undefined);
        this.modelManagementService.setValueTypeDatatypeValueColumnName(cellMapping, undefined);
        this.modelManagementService.setValueTypeDatatypeValueSource(cellMapping, form.dataTypeValueSource);
      }

      const datatypeTransformation = form.datatypeTransformation;
      if (this.isAllowedExpression(datatypeTransformation, form.datatypeLanguage)) {
        this.setDataTypeTransformation(cellMapping, settings, datatypeTransformation, form.datatypeLanguage);
      }
    }

    if (settings.hasLanguage) {
      const languageColumnName = form.languageColumnName;
      const languageConstant = form.languageConstant;

      if (settings.isLanguageColumn && !Helper.isBlank(languageColumnName)) {
        this.modelManagementService.setValueTypeLanguageConstant(cellMapping, undefined);
        this.modelManagementService.setValueTypeLanguageColumnName(cellMapping, languageColumnName);
        this.modelManagementService.setValueTypeLanguageValueSource(cellMapping, form.languageValueSource);
      } else if (settings.isLanguageConstant && !Helper.isBlank(languageConstant)) {
        this.modelManagementService.setValueTypeLanguageColumnName(cellMapping, undefined);
        this.modelManagementService.setValueTypeLanguageConstant(cellMapping, languageConstant);
        this.modelManagementService.setValueTypeLanguageValueSource(cellMapping, form.languageValueSource);
      } else if (!settings.isLanguageConstant && !settings.isLanguageColumn) {
        this.modelManagementService.setValueTypeLanguageConstant(cellMapping, undefined);
        this.modelManagementService.setValueTypeLanguageColumnName(cellMapping, undefined);
        this.modelManagementService.setValueTypeLanguageValueSource(cellMapping, form.languageValueSource);
      }

      const languageTransformation = form.languageTransformation;
      if (this.isAllowedExpression(languageTransformation, form.languageTransformationLanguage)) {
        this.modelManagementService.setValueTypeLanguageTransformationExpression(cellMapping, languageTransformation);
        this.modelManagementService.setValueTypeLanguageTransformationLanguage(cellMapping, form.languageTransformationLanguage);
      }
    }
  }

  private setDataTypeTransformation(cellMapping: MappingBase, settings, datatypeTransformation: string, datatypeLanguage: string) {
    this.modelManagementService.setValueTypeDatatypeTransformationExpression(cellMapping, datatypeTransformation);
    this.modelManagementService.setDatatypeTransformationLanguage(cellMapping, datatypeLanguage);
    if (datatypeLanguage === Language.Prefix.valueOf() && !settings.namespaces[datatypeTransformation]) {
      settings.namespaces[datatypeTransformation] = settings.repoNamespaces[datatypeTransformation];
    }
  }

  private setTypeSource(cellMapping: MappingBase, form, settings): void {
    this.modelManagementService.setTypeSource(cellMapping, form.source);

    const constant = form.constant;
    if (settings.isConstant && !Helper.isBlank(constant)) {
      const transformed = this.getPrefixTransformation(constant, {...settings.namespaces, ...settings.repoNamespaces});
      if (transformed.prefix != undefined) {
        this.setTypeTransformation(transformed.prefix, Language.Prefix.valueOf(), true);
        this.modelManagementService.setConstant(cellMapping, transformed.suffix);
      } else {
        this.modelManagementService.setConstant(cellMapping, constant);
      }
    }

    const columnName = form.columnName;
    if (settings.isColumn && !Helper.isBlank(columnName)) {
      this.modelManagementService.setColumnName(cellMapping, columnName);
    }
  }

  private setTypeTransformation(cellMapping: MappingBase, form, settings): void {
    if (settings.isTransformation && this.isAllowedExpression(form.expression, form.language)) {
      this.modelManagementService.setExpression(cellMapping, form.expression);
      this.modelManagementService.setTransformationLanguage(cellMapping, form.language);
      if (form.language === Language.Prefix.valueOf() && !settings.namespaces[form.expression]) {
        settings.namespaces[form.expression] = settings.repoNamespaces[form.expression];
      }
    }
  }

  public getPrefixTransformation(constantValue: string, allNamespaces) {
    let transformed = constantValue;
    let foundPrefix;
    Object.keys(allNamespaces).forEach((key) => {
      if (constantValue.startsWith(allNamespaces[key])) {
        transformed = constantValue.replace(allNamespaces[key], key + ':');
        foundPrefix = key;
      }
    });
    return {label: transformed, value: constantValue, prefix: foundPrefix, suffix: transformed.substr(transformed.lastIndexOf(':') + 1)};
  }

  public replaceIRIPrefixes(types, namespaces: { [p: string]: string }) {
    return types.map((t) => {
      return this.getPrefixTransformation(t, namespaces);
    });
  }

  private isAllowedExpression(expression: string, language: string): boolean {
    // Allow the empty prefix
    return !Helper.isBlank(expression) || (language === Language.Prefix.valueOf() && expression === '');
  }

  createMappingObject(form, settings): MappingBase {
    if (settings.selected === SUBJECT_SELECTOR) {
      return this.createSubject(settings);
    } else if (settings.selected === PREDICATE_SELECTOR && form.type !== TypeMapping.a) {
      return this.createPredicate();
    } else if (settings.selected === OBJECT_SELECTOR) {
      return this.createObject(form);
    }
  }

  private createSubject(settings) {
    if (settings.isRoot) {
      return new SubjectMappingImpl([], new SimpleIRIValueMappingImpl(undefined, undefined), []);
    }
  }

  private createPredicate() {
    return new PropertyMappingImpl(undefined, undefined);
  }

  private createObject(form) {
    if (form.type !== TypeMapping.a && form.type !== Type.IRI) {
      return new ValueMappingImpl(undefined, undefined, undefined);
    } else if (form.type === Type.IRI) {
      return new ValueMappingImpl(undefined, undefined, new IRIImpl([], undefined, [], undefined, undefined));
    } else if (form.type === TypeMapping.a) {
      return new SimpleIRIValueMappingImpl(undefined, undefined);
    }
  }

  setMappingObjectInTriple(cellMapping: MappingBase, form, settings, mappingData: Triple): void {
    if (settings.selected === SUBJECT_SELECTOR) {
      mappingData.setSubject(cellMapping);
    } else if (settings.selected === PREDICATE_SELECTOR) {
      if (form.typeMapping) {
        mappingData.setTypeProperty(true);
        cellMapping = undefined;
      } else {
        const subject = mappingData.getSubject();
        this.modelManagementService.setPropertyMapping(subject, cellMapping as PropertyMappingImpl);
      }
      mappingData.setPredicate(cellMapping);
    } else if (settings.selected === OBJECT_SELECTOR) {
      const subject = mappingData.getSubject();
      if (form.type === TypeMapping.a) {
        this.modelManagementService.setTypeMapping(subject, cellMapping as SimpleIRIValueMappingImpl);
      } else {
        const predicate = mappingData.getPredicate();
        this.modelManagementService.setValueMapping(subject, predicate, cellMapping as ValueMappingImpl);
      }
      mappingData.setObject(cellMapping);
    }
  }

  setRootMappingInModel(mappingData: Triple, mapping) {
    const subjectMappings = mapping.getSubjectMappings();
    const subject = mappingData.getSubject();
    const index = subjectMappings.indexOf(subject);
    if (index > -1) {
      subjectMappings.splice(index, 1, subject);
    } else {
      subjectMappings.push(mappingData.getSubject());
    }
  }
}