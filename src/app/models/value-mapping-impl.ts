import {Column, IRI, ValueMapping, ValueTransformation} from 'src/app/models/mapping-definition';
import {Expose, Type} from 'class-transformer';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';
import {ColumnImpl} from 'src/app/models/column-impl';
import {IRIImpl} from 'src/app/models/iri-impl';

export class ValueMappingImpl implements ValueMapping {
  @Expose() @Type(() => ValueTransformationImpl) transformation?: ValueTransformation;
  @Expose() @Type(() => ColumnImpl) valueSource: Column;
  @Expose() @Type(() => IRIImpl) valueType: IRI;

  constructor(transformation: ValueTransformationImpl, valueSource: ColumnImpl, valueType: IRI) {
    this.transformation = transformation;
    this.valueSource = valueSource;
    this.valueType = valueType;
  }

  public getTransformation(): any {
    return this.transformation;
  }

  public setTransformation(value: ValueTransformation) {
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

  public setValueType(value: IRI) {
    this.valueType = value;
  }
}
