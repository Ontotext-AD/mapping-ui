import {PropertyMapping, SimpleIRIValueMapping, ValueMapping} from 'src/app/models/mapping-definition';
import {Expose, Type} from 'class-transformer';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {ValueMappingImpl} from 'src/app/models/value-mapping-impl';

export class PropertyMappingImpl implements PropertyMapping {
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
}
