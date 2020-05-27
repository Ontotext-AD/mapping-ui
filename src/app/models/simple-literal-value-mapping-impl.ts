import {Column, SimpleLiteralValueMapping, ValueTransformation} from 'src/app/models/mapping-definition';
import {Expose, Type} from 'class-transformer';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';
import {ColumnImpl} from 'src/app/models/column-impl';

export class SimpleLiteralValueMappingImpl implements SimpleLiteralValueMapping {
  @Expose() @Type(() => ValueTransformationImpl) transformation?: ValueTransformation;
  @Expose() @Type(() => ColumnImpl) valueSource: Column;

  constructor(transformation: ValueTransformation, valueSource: Column) {
    this.transformation = transformation;
    this.valueSource = valueSource;
  }

  public getTransformation(): ValueTransformationImpl {
    return this.transformation as ValueTransformationImpl;
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
}
