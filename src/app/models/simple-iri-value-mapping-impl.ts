import {Column, SimpleIRIValueMapping, ValueTransformation} from 'src/app/models/mapping-definition';
import {Expose, Type} from 'class-transformer';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';
import {ColumnImpl} from 'src/app/models/column-impl';
import {MappingBase} from 'src/app/models/mapping-base';
import {IRIImpl} from 'src/app/models/iri-impl';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';

export class SimpleIRIValueMappingImpl implements SimpleIRIValueMapping, MappingBase {
  @Expose() @Type(() => ValueTransformationImpl) transformation?: ValueTransformation;
  @Expose() @Type(() => ColumnImpl) valueSource: Column;

  constructor(transformation: ValueTransformation, valueSource: Column) {
    this.transformation = transformation;
    this.valueSource = valueSource;
  }

  public getValueTransformation(): ValueTransformationImpl {
    return this.transformation as ValueTransformationImpl;
  }

  public setValueTransformation(value: ValueTransformation) {
    this.transformation = value;
  }

  public getValueSource(): ColumnImpl {
    return this.valueSource as ColumnImpl;
  }

  public setValueSource(value: Column) {
    this.valueSource = value;
  }

  public getPropertyMappings() {
    return undefined;
  }

  public getTypeMappings(): SimpleIRIValueMappingImpl[] {
    return undefined;
  }

  public getValueType(): IRIImpl {
    return undefined;
  }

  public clearMapping() {
    this.setValueTransformation(undefined);
    this.setValueSource(undefined);
    return this;
  }

  public setValueType(iri: IRIImpl): void { // eslint-disable-line @typescript-eslint/no-unused-vars
  }

  public setPropertyMappings(mappings: PropertyMappingImpl[]) { // eslint-disable-line @typescript-eslint/no-unused-vars
  }

  public setTypeMappings(mappings: SimpleIRIValueMappingImpl[]) { // eslint-disable-line @typescript-eslint/no-unused-vars
  }
}
