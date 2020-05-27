import {
  IRI,
  PropertyMapping,
  SimpleIRIValueMapping,
  SimpleLiteralValueMapping,
  Type,
} from 'src/app/models/mapping-definition';
import {Expose, Type as TypeAlias} from 'class-transformer';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {SimpleLiteralValueMappingImpl} from 'src/app/models/simple-literal-value-mapping-impl';

export class IRIImpl implements IRI {
  @Expose() @TypeAlias(() => PropertyMappingImpl) propertyMappings?: PropertyMapping[];
  @Expose() type: Type;
  @Expose() @TypeAlias(() => SimpleIRIValueMappingImpl) typeMappings?: SimpleIRIValueMapping[];
  @Expose() @TypeAlias(() => SimpleLiteralValueMappingImpl) language?: SimpleLiteralValueMapping;
  @Expose() @TypeAlias(() => SimpleIRIValueMappingImpl) datatype?: SimpleIRIValueMapping;

  constructor(propertyMappings: PropertyMapping[], type: Type, typeMappings: SimpleIRIValueMapping[], language: SimpleLiteralValueMapping, datatype: SimpleIRIValueMapping) {
    this.propertyMappings = propertyMappings;
    this.type = type;
    this.typeMappings = typeMappings;
    this.language = language;
    this.datatype = datatype;
  }

  public getPropertyMappings(): PropertyMappingImpl[] {
    return this.propertyMappings as PropertyMappingImpl[];
  }

  public setPropertyMappings(value: PropertyMapping[]) {
    this.propertyMappings = value;
  }

  public getType(): Type {
    return this.type;
  }

  public setType(value: Type) {
    this.type = value;
  }

  public getTypeMappings(): SimpleIRIValueMappingImpl[] {
    return this.typeMappings as SimpleIRIValueMappingImpl[];
  }

  public setTypeMappings(value: SimpleIRIValueMapping[]) {
    this.typeMappings = value;
  }

  public getLanguage(): SimpleLiteralValueMappingImpl {
    return this.language as SimpleIRIValueMappingImpl;
  }

  public setLanguage(value: SimpleLiteralValueMapping) {
    this.language = value;
  }

  public getDatatype(): SimpleIRIValueMappingImpl {
    return this.datatype as SimpleIRIValueMappingImpl;
  }

  public setDatatype(value: SimpleIRIValueMapping) {
    this.datatype = value;
  }
}
