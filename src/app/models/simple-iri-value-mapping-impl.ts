import {Column, SimpleIRIValueMapping, ValueTransformation} from 'src/app/models/mapping-definition';
import {Expose, Transform, Type} from 'class-transformer';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';
import {ColumnImpl} from 'src/app/models/column-impl';
import {MappingBase} from 'src/app/models/mapping-base';
import {IRIImpl} from 'src/app/models/iri-impl';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';

export class SimpleIRIValueMappingImpl implements SimpleIRIValueMapping, MappingBase {
  @Expose() @Type(() => ValueTransformationImpl) transformation?: ValueTransformation;
  @Expose() @Type(() => ColumnImpl) valueSource: Column;

  // type transformations
  // 0 - plainToClass - form JSON to classes
  // 1 - classToPlain - from classes to JSON
  // 2 - classToClass - deep copy of the classes
  // Used to sanitize the preview array when requesting new one
  @Expose() @Transform(({value, type}) => {
    if (type === 2) {
      value = [];
    }
    return value;
  })

    preview: string[];

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

  public getPreview(): string[] {
    return this.preview;
  }

  clearPreview(): void {
    delete this.preview;
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
