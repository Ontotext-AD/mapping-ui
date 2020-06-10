import {Injectable} from '@angular/core';
import {
  Convert,
  MappingDefinition,
  Source,
  Type,
} from '../models/mapping-definition';
import {classToPlain, plainToClass} from 'class-transformer';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {IRIImpl} from 'src/app/models/iri-impl';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {ColumnImpl} from 'src/app/models/column-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';
import {SimpleLiteralValueMappingImpl} from 'src/app/models/simple-literal-value-mapping-impl';
import {Helper} from 'src/app/utils/helper';
import {MappingBase} from 'src/app/models/mapping-base';
import {ValueMappingImpl} from 'src/app/models/value-mapping-impl';
import {MappingDefinitionService} from './rest/mapping-definition.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class ModelManagementService {
  constructor(private mappingDefinitionService: MappingDefinitionService) { }

  getPropertyMappings(subject: MappingBase): PropertyMappingImpl[] {
    return subject.getPropertyMappings();
  }

  getTypeMappings(subject: MappingBase): SimpleIRIValueMappingImpl[] {
    return subject.getTypeMappings();
  }

  getValueSource(cellMapping: MappingBase): ColumnImpl {
    return cellMapping && cellMapping.getValueSource();
  }

  getTransformation(cellMapping: MappingBase): ValueTransformationImpl {
    return cellMapping && cellMapping.getValueTransformation();
  }

  getValueType(cellMapping: MappingBase): IRIImpl {
    return cellMapping && cellMapping.getValueType();
  }

  getValueTypeDatatype(cellMapping: MappingBase): SimpleIRIValueMappingImpl {
    return this.getValueType(cellMapping) && this.getValueType(cellMapping).getDatatype();
  }

  getValueTypeDatatypeTransformation(cellMapping: MappingBase) {
    return this.getValueTypeDatatype(cellMapping) && this.getValueTypeDatatype(cellMapping).getValueTransformation();
  }

  getValueTypeDatatypeTransformationExpression(cellMapping: MappingBase): string {
    return this.getValueTypeDatatypeTransformation(cellMapping) && this.getValueTypeDatatypeTransformation(cellMapping).getExpression();
  }

  setValueTypeDatatypeTransformationExpression(cellMapping: MappingBase, expression: string): void {
    if (!this.getValueType(cellMapping)) {
      this.addValueType(cellMapping);
    }

    if (!this.getValueTypeDatatype(cellMapping)) {
      this.addValueTypeDatatype(cellMapping);
    }

    if (!this.getValueTypeDatatypeTransformation(cellMapping)) {
      this.addValueTypeDatatypeValueTransformation(cellMapping);
    }

    this.getValueTypeDatatypeTransformation(cellMapping).setExpression(expression);
  }

  private addValueTypeDatatype(cellMapping) {
    if (!this.getValueType(cellMapping)) {
      this.addValueType(cellMapping);
    }

    this.getValueType(cellMapping).setDatatype(new SimpleIRIValueMappingImpl(undefined, undefined));
  }

  private addValueTypeDatatypeValueTransformation(cellMapping) {
    this.getValueTypeDatatype(cellMapping).setValueTransformation(new ValueTransformationImpl(undefined, undefined));
  }

  getValueTypeDatatypeTransformationLanguage(cellMapping: MappingBase): string {
    return this.getValueTypeDatatypeTransformation(cellMapping) && this.getValueTypeDatatypeTransformation(cellMapping).getLanguage();
  }

  setDatatypeTransformationLanguage(cellMapping: MappingBase, language: string): void {
    if (!this.getValueTypeDatatype(cellMapping)) {
      this.addValueTypeDatatype(cellMapping);
    }

    if (!this.getValueTypeDatatypeTransformation(cellMapping)) {
      this.addValueTypeDatatypeValueTransformation(cellMapping);
    }

    this.getValueTypeDatatypeTransformation(cellMapping).setLanguage(language);
  }

  getValueTypeDatatypeValueSource(cellMapping: MappingBase): ColumnImpl {
    return this.getValueTypeDatatype(cellMapping) && this.getValueTypeDatatype(cellMapping).getValueSource() && this.getValueTypeDatatype(cellMapping).getValueSource();
  }

  setValueTypeDatatypeValueSource(cellMapping: MappingBase, source: string): void {
    if (!this.getValueTypeDatatype(cellMapping)) {
      this.addValueTypeDatatype(cellMapping);
    }

    this.addValueTypeDatatypeValueSource(cellMapping);
    this.getValueTypeDatatype(cellMapping).getValueSource().setSource(Source[Helper.getEnumKeyByEnumValue(Source, source)]);
  }

  private addValueTypeDatatypeValueSource(cellMapping: MappingBase) {
    if (!this.getValueTypeDatatype(cellMapping).getValueSource()) {
      this.getValueTypeDatatype(cellMapping).setValueSource(new ColumnImpl(undefined, undefined, undefined));
    }
  }

  getValueTypeDatatypeValueColumnName(cellMapping: MappingBase): string {
    return this.getValueTypeDatatype(cellMapping) && this.getValueTypeDatatype(cellMapping).getValueSource() && this.getValueTypeDatatype(cellMapping).getValueSource().getColumnName();
  }

  setValueTypeDatatypeValueColumnName(cellMapping: MappingBase, name: string): void {
    this.addValueTypeDatatype(cellMapping);
    this.addValueTypeDatatypeValueSource(cellMapping);

    this.getValueTypeDatatype(cellMapping).getValueSource().setColumnName(name);
  }

  getValueTypeDatatypeValueConstant(cellMapping: MappingBase): string {
    return this.getValueTypeDatatype(cellMapping) && this.getValueTypeDatatype(cellMapping).getValueSource() && this.getValueTypeDatatype(cellMapping).getValueSource().getConstant();
  }

  setValueTypeDatatypeValueConstant(cellMapping: MappingBase, constant: string): void {
    this.addValueTypeDatatype(cellMapping);
    this.addValueTypeDatatypeValueSource(cellMapping);

    this.getValueTypeDatatype(cellMapping).getValueSource().setConstant(constant);
  }

  getValueTypeLanguage(cellMapping: MappingBase): SimpleLiteralValueMappingImpl {
    return this.getValueType(cellMapping) && this.getValueType(cellMapping).getLanguage();
  }

  getValueTypeLanguageTransformation(cellMapping: MappingBase): ValueTransformationImpl {
    return this.getValueTypeLanguage(cellMapping) && this.getValueTypeLanguage(cellMapping).getTransformation();
  }

  getValueTypeLanguageTransformationExpression(cellMapping: MappingBase): string {
    return this.getValueTypeLanguageTransformation(cellMapping) && this.getValueTypeLanguageTransformation(cellMapping).getExpression();
  }

  setValueTypeLanguageTransformationExpression(cellMapping: MappingBase, expression: string): void {
    if (!this.getValueType(cellMapping)) {
      this.addValueType(cellMapping);
    }

    if (!this.getValueTypeLanguage(cellMapping)) {
      this.addLanguage(cellMapping);
    }

    if (!this.getValueTypeLanguageTransformation(cellMapping)) {
      this.addLanguageTransformation(cellMapping);
    }

    this.getValueTypeLanguageTransformation(cellMapping).setExpression(expression);
  }

  private addValueType(cellMapping: MappingBase) {
    return cellMapping.setValueType(new IRIImpl(undefined, undefined, undefined, undefined, undefined));
  }

  private addLanguage(cellMapping: MappingBase) {
    return cellMapping.getValueType().setLanguage(new SimpleLiteralValueMappingImpl(undefined, undefined));
  }

  private addLanguageTransformation(cellMapping: MappingBase) {
    return cellMapping.getValueType().getLanguage().setTransformation(new ValueTransformationImpl(undefined, undefined));
  }

  getValueTypeLanguageTransformationLanguage(cellMapping: MappingBase): string {
    return this.getValueTypeLanguageTransformation(cellMapping) && this.getValueTypeLanguageTransformation(cellMapping).getLanguage();
  }

  setValueTypeLanguageTransformationLanguage(cellMapping: MappingBase, lang: string): void {
    if (!this.getValueType(cellMapping)) {
      this.addValueType(cellMapping);
    }

    if (!this.getValueTypeLanguage(cellMapping)) {
      this.addLanguage(cellMapping);
    }

    if (!this.getValueTypeLanguageTransformation(cellMapping)) {
      this.addLanguageTransformation(cellMapping);
    }

    this.getValueTypeLanguageTransformation(cellMapping).setLanguage(lang);
  }

  getValueTypeLanguageValueSource(cellMapping: MappingBase): ColumnImpl {
    return this.getValueTypeLanguage(cellMapping) && this.getValueTypeLanguage(cellMapping).getValueSource();
  }

  setValueTypeLanguageValueSource(cellMapping: MappingBase, source: string): void {
    if (!this.getValueType(cellMapping)) {
      this.addValueType(cellMapping);
    }

    if (!this.getValueTypeLanguage(cellMapping)) {
      this.addLanguage(cellMapping);
    }

    if (!this.getValueTypeLanguageValueSource(cellMapping)) {
      this.addLanguageValueSource(cellMapping);
    }

    this.getValueTypeLanguageValueSource(cellMapping).setSource(Source[Helper.getEnumKeyByEnumValue(Source, source)]);
  }

  private addLanguageValueSource(cellMapping: MappingBase) {
    return cellMapping.getValueType().getLanguage().setValueSource(new ColumnImpl(undefined, undefined, undefined));
  }

  getValueTypeLanguageColumnName(cellMapping: MappingBase): string {
    return this.getValueTypeLanguageValueSource(cellMapping) && this.getValueTypeLanguageValueSource(cellMapping).getColumnName();
  }

  setValueTypeLanguageColumnName(cellMapping: MappingBase, name: string): void {
    if (!this.getValueType(cellMapping)) {
      this.addValueType(cellMapping);
    }

    if (!this.getValueTypeLanguage(cellMapping)) {
      this.addLanguage(cellMapping);
    }

    if (!this.getValueTypeLanguageValueSource(cellMapping)) {
      this.addLanguageValueSource(cellMapping);
    }

    this.getValueTypeLanguageValueSource(cellMapping).setColumnName(name);
  }

  getValueTypeLanguageConstant(cellMapping: MappingBase): string {
    return this.getValueTypeLanguageValueSource(cellMapping) && this.getValueTypeLanguageValueSource(cellMapping).getConstant();
  }

  setValueTypeLanguageConstant(cellMapping: MappingBase, constant: string): void {
    if (!this.getValueType(cellMapping)) {
      this.addValueType(cellMapping);
    }

    if (!this.getValueTypeLanguage(cellMapping)) {
      this.addLanguage(cellMapping);
    }

    if (!this.getValueTypeLanguageValueSource(cellMapping)) {
      this.addLanguageValueSource(cellMapping);
    }

    this.getValueTypeLanguageValueSource(cellMapping).setConstant(constant);
  }

  getColumnName(cellMapping: MappingBase): string {
    return this.getValueSource(cellMapping) && this.getValueSource(cellMapping).getColumnName();
  }

  setColumnName(cellMapping: MappingBase, name: string): void {
    this.getValueSource(cellMapping).setColumnName(name);
  }

  getTypeSource(cellMapping: MappingBase): Source {
    return this.getValueSource(cellMapping) && this.getValueSource(cellMapping).getSource();
  }

  setTypeSource(cellMapping: MappingBase, source: string): void {
    if (!this.getValueSource(cellMapping)) {
      this.addValueSource(cellMapping);
    }
    this.getValueSource(cellMapping).setSource(Source[Helper.getEnumKeyByEnumValue(Source, source)]);
  }


  private addValueSource(cellMapping: MappingBase) {
    return cellMapping.setValueSource(new ColumnImpl(undefined, undefined, undefined));
  }

  getConstant(cellMapping: MappingBase): string {
    return this.getValueSource(cellMapping) && this.getValueSource(cellMapping).getConstant();
  }

  setConstant(cellMapping: MappingBase, constant: string): void {
    this.getValueSource(cellMapping).setConstant(constant);
  }

  getType(cellMapping: MappingBase): string {
    return this.getValueType(cellMapping) && this.getValueType(cellMapping).getType();
  }

  setValueType(cellMapping: MappingBase, type: string) {
    if (!this.getValueType(cellMapping)) {
      this.addValueType(cellMapping);
    }

    return cellMapping.getValueType() && cellMapping.getValueType().setType(Type[Helper.getEnumKeyByEnumValue(Type, type)]);
  }

  getExpression(cellMapping: MappingBase): string {
    return this.getTransformation(cellMapping) && this.getTransformation(cellMapping).getExpression();
  }

  setExpression(cellMapping: MappingBase, transformation: string): void {
    if (!this.getTransformation(cellMapping)) {
      this.addValueTransformation(cellMapping);
    }
    this.getTransformation(cellMapping) && this.getTransformation(cellMapping).setExpression(transformation);
  }

  getTransformationLanguage(cellMapping: MappingBase): string {
    return this.getTransformation(cellMapping) && this.getTransformation(cellMapping).getLanguage();
  }

  setTransformationLanguage(cellMapping: MappingBase, lang: string): void {
    if (!this.getTransformation(cellMapping)) {
      this.addValueTransformation(cellMapping);
    }
    this.getTransformation(cellMapping).setLanguage(lang);
  }

  addValueTransformation(cellMapping: MappingBase) {
    cellMapping.setValueTransformation(new ValueTransformationImpl(undefined, undefined));
  }

  clearMapping(cellMapping: MappingBase): void {
    cellMapping.clearMapping();
  }

  getStoredModelMapping(): Observable<MappingDefinitionImpl> {
    return this.mappingDefinitionService.getMappingDefinition().pipe(map((md) => {
      return plainToClass(MappingDefinitionImpl, md, {excludeExtraneousValues: true});
    }));
  }

  storeModelMapping(mappingDefinition: MappingDefinitionImpl): Observable<void> {
    return this.mappingDefinitionService.saveMappingDefinition(this.mappingDefinitionToJson(mappingDefinition));
  }

  getModelMapping(mapping): {} {
    return classToPlain(mapping);
  }

  mappingDefinitionToJson(mapping: MappingDefinition): JSON {
    return JSON.parse(Convert.mappingDefinitionToJson(mapping));
  }

  public setTypeMapping(subject: MappingBase, selected: SimpleIRIValueMappingImpl) {
    if (!subject.getTypeMappings()) {
      subject.setTypeMappings([]);
    }
    subject.getTypeMappings().push(selected);
  }

  public setValueMapping(subject: MappingBase, predicate: PropertyMappingImpl, selected: ValueMappingImpl) {
    subject.getPropertyMappings().forEach((mapping) => {
      if (mapping === predicate) {
        if (!predicate.getValues()) {
          predicate.setValues([]);
        }
        predicate.getValues().push(selected);
        return;
      }
    });
  }

  public setPropertyMapping(subject: MappingBase, predicate: PropertyMappingImpl) {
    if (!subject.getPropertyMappings()) {
      subject.setPropertyMappings([]);
    }
    subject.getPropertyMappings().push(predicate);
  }
}
