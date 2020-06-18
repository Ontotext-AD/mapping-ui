import {PropertyMapping, SimpleIRIValueMapping, SubjectMapping} from 'src/app/models/mapping-definition';
import {Expose, Type} from 'class-transformer';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {MappingBase} from 'src/app/models/mapping-base';
import {IRIImpl} from 'src/app/models/iri-impl';
import {ColumnImpl} from 'src/app/models/column-impl';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';

export class SubjectMappingImpl implements SubjectMapping, MappingBase {
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

  public getValueSource(): ColumnImpl {
    return this.getSubject() && this.getSubject().getValueSource();
  }

  public getValueTransformation() {
    return this.getSubject().getValueTransformation();
  }

  public getValueType(): IRIImpl {
    return undefined;
  }

  public setValueType(): void {
    // do nothing
  }

  getPreview() {
    return this.getSubject() && this.getSubject().getPreview();
  }

  clearPreview() {
    delete this.getSubject().preview;
  }

  public clearMapping() {
    this.setSubject(undefined);
    return this;
  }

  public setValueSource(column: ColumnImpl) {
    if (!this.getSubject()) {
      this.setSubject(new SimpleIRIValueMappingImpl(undefined, undefined));
    }
    this.getSubject().setValueSource(column);
  }

  public setValueTransformation(transformation: ValueTransformationImpl) {
    this.getSubject().setValueTransformation(transformation);
  }
}
