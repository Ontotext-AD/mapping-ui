import {PropertyMapping, SimpleIRIValueMapping, ValueMapping} from 'src/app/models/mapping-definition';
import {Expose, Type} from 'class-transformer';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {ValueMappingImpl} from 'src/app/models/value-mapping-impl';
import {MappingBase} from 'src/app/models/mapping-base';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';
import {IRIImpl} from 'src/app/models/iri-impl';
import {ColumnImpl} from 'src/app/models/column-impl';

export class PropertyMappingImpl implements PropertyMapping, MappingBase {
  @Expose() @Type(() => SimpleIRIValueMappingImpl) property: SimpleIRIValueMapping;
  @Expose() @Type(() => ValueMappingImpl) values: ValueMapping[];

  constructor(property: SimpleIRIValueMapping, values: ValueMapping[]) {
    this.property = property;
    this.values = values;
  }

  public getProperty(): SimpleIRIValueMappingImpl {
    return this.property as SimpleIRIValueMappingImpl;
  }

  public setProperty(value: SimpleIRIValueMapping) {
    this.property = value;
  }

  public getValues(): ValueMappingImpl[] {
    return this.values as ValueMappingImpl[];
  }

  public setValues(value: ValueMapping[]) {
    this.values = value;
  }

  public getPropertyMappings(): PropertyMappingImpl[] {
    return undefined;
  }

  public getTypeMappings(): SimpleIRIValueMappingImpl[] {
    return undefined;
  }

  public getValueSource(): ColumnImpl {
    return this.getProperty() && this.getProperty().getValueSource();
  }

  public getValueTransformation(): ValueTransformationImpl {
    return this.getProperty() && this.getProperty().getValueTransformation();
  }

  public getValueType(): IRIImpl {
    return undefined;
  }

  public setValueType(iri: IRIImpl): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // do nothing
  }

  public clearMapping() {
    this.setProperty(undefined);
    return this;
  }

  public setValueSource(column: ColumnImpl) {
    if (!this.getProperty()) {
      this.setProperty(new SimpleIRIValueMappingImpl(undefined, undefined));
    }

    this.getProperty().setValueSource(column);
  }

  public setValueTransformation(transformation: ValueTransformationImpl) {
    this.getProperty().setValueTransformation(transformation);
  }

  public setPropertyMappings(mappings: PropertyMappingImpl[]) { // eslint-disable-line @typescript-eslint/no-unused-vars
  }

  public setTypeMappings(mappings: SimpleIRIValueMappingImpl[]) { // eslint-disable-line @typescript-eslint/no-unused-vars
  }
}
