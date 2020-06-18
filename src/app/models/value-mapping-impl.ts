import {Column, IRI, ValueMapping, ValueTransformation} from 'src/app/models/mapping-definition';
import {Expose, Type} from 'class-transformer';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';
import {ColumnImpl} from 'src/app/models/column-impl';
import {IRIImpl} from 'src/app/models/iri-impl';
import {MappingBase} from 'src/app/models/mapping-base';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';

export class ValueMappingImpl implements ValueMapping, MappingBase {
  @Expose() @Type(() => ValueTransformationImpl) transformation?: ValueTransformation;
  @Expose() @Type(() => ColumnImpl) valueSource: Column;
  @Expose() @Type(() => IRIImpl) valueType: IRI;
  preview: string[];

  constructor(transformation: ValueTransformationImpl, valueSource: ColumnImpl, valueType: IRI) {
    this.transformation = transformation;
    this.valueSource = valueSource;
    this.valueType = valueType;
  }

  public getValueTransformation(): any {
    return this.transformation;
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


  public getValueType(): IRIImpl {
    return this.valueType as IRIImpl;
  }

  public setValueType(value: IRIImpl) {
    this.valueType = value;
  }

  public getTypeMappings(): SimpleIRIValueMappingImpl[] {
    return this.getValueType().getTypeMappings();
  }

  public getPropertyMappings(): PropertyMappingImpl[] {
    return this.getValueType().getPropertyMappings();
  }

  public clearMapping() {
    this.setValueTransformation(undefined);
    this.setValueSource(undefined);
    return this;
  }

  public setTypeMappings(mappings: SimpleIRIValueMappingImpl[]) {
    this.getValueType().setTypeMappings(mappings);
  }

  public setPropertyMappings(mappings: PropertyMappingImpl[]) {
    this.getValueType().setPropertyMappings(mappings);
  }

  public getPreview(): string[] {
    return this.preview;
  }

  clearPreview(): void {
    delete this.preview;
  }
}
