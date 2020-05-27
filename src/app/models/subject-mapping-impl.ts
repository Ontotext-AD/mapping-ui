import {PropertyMapping, SimpleIRIValueMapping, SubjectMapping} from 'src/app/models/mapping-definition';
import {Expose, Type} from 'class-transformer';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';

export class SubjectMappingImpl implements SubjectMapping {
  @Expose() @Type(() => PropertyMappingImpl) propertyMappings: PropertyMapping[];
  @Expose() @Type(() => SimpleIRIValueMappingImpl) subject: SimpleIRIValueMapping;
  @Expose() @Type(() => SimpleIRIValueMappingImpl) typeMappings: SimpleIRIValueMapping[];

  constructor(propertyMappings: PropertyMapping[], subject: SimpleIRIValueMapping, typeMappings: SimpleIRIValueMapping[]) {
    this.propertyMappings = propertyMappings;
    this.subject = subject;
    this.typeMappings = typeMappings;
  }

  public getPropertyMappings(): PropertyMappingImpl[] {
    return this.propertyMappings as PropertyMappingImpl[];
  }

  public setPropertyMappings(value: PropertyMapping[]) {
    this.propertyMappings = value;
  }

  public getSubject(): SimpleIRIValueMappingImpl {
    return this.subject as SimpleIRIValueMappingImpl;
  }

  public setSubject(value: SimpleIRIValueMapping) {
    this.subject = value;
  }

  public getTypeMappings(): SimpleIRIValueMappingImpl[] {
    return this.typeMappings as SimpleIRIValueMappingImpl[];
  }

  public setTypeMappings(value: SimpleIRIValueMapping[]) {
    this.typeMappings = value;
  }
}
