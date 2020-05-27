import {Injectable} from '@angular/core';
import {
  Convert,
  MappingDefinition,
  PropertyMapping,
  SimpleIRIValueMapping,
  SubjectMapping,
  ValueMapping,
} from '../models/mapping-definition';
import {plainToClass} from 'class-transformer';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import amsterdamMapping from 'src/app/models/amsterdam-mapping.json';
import {SubjectMappingImpl} from 'src/app/models/subject-mapping-impl';
import {ValueMappingImpl} from 'src/app/models/value-mapping-impl';
import {IRIImpl} from 'src/app/models/iri-impl';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {ColumnImpl} from 'src/app/models/column-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';

@Injectable({
  providedIn: 'root',
})
export class ModelManagementService {
  constructor() { }

  getPropertyMappings(subject: ValueMappingImpl | SubjectMappingImpl): PropertyMappingImpl[] {
    if (subject instanceof ValueMappingImpl) {
      return subject.getValueType().getPropertyMappings();
    }

    if (subject instanceof SubjectMappingImpl) {
      return subject.getPropertyMappings();
    }
  }

  getTypeMappings(subject: ValueMappingImpl|SubjectMappingImpl): SimpleIRIValueMappingImpl[] {
    if (subject instanceof ValueMappingImpl) {
      return subject.getValueType().getTypeMappings();
    }

    if (subject instanceof SubjectMappingImpl) {
      return subject.getTypeMappings();
    }
  }

  /**
   * Get the value source for the cell depending on the cellMapping type
   *
   * @return value source
   */
  getSource(cellMapping: SubjectMapping | PropertyMapping | ValueMapping | SimpleIRIValueMapping): ColumnImpl {
    if (cellMapping instanceof SubjectMappingImpl) {
      return cellMapping.getSubject().getValueSource();
    }
    if (cellMapping instanceof PropertyMappingImpl) {
      return cellMapping.getProperty().getValueSource();
    }
    if (cellMapping instanceof ValueMappingImpl) {
      return cellMapping.getValueSource();
    }
    if (cellMapping instanceof SimpleIRIValueMappingImpl) {
      return cellMapping.getValueSource();
    }
  }

  /**
   * Get the transformation for the cell depending on the cellMapping type
   *
   * @return value transformation
   */
  getTransformation(cellMapping: SubjectMapping | PropertyMapping | ValueMapping | SimpleIRIValueMapping): ValueTransformationImpl {
    if (cellMapping instanceof SubjectMappingImpl) {
      return cellMapping.getSubject().getTransformation();
    }

    if (cellMapping instanceof PropertyMappingImpl) {
      return cellMapping.getProperty().getTransformation();
    }

    if (cellMapping instanceof ValueMappingImpl) {
      return cellMapping.getTransformation();
    }

    if (cellMapping instanceof SimpleIRIValueMappingImpl) {
      return cellMapping.getTransformation();
    }
  }

  /**
   * Get value Type. Returns the ValueType but only when the cellMapping is a ValueMapping
   * Only ValueMappings have such a type
   *
   * @return value type
   */
  getValueType(cellMapping: SubjectMapping | PropertyMapping | ValueMapping | SimpleIRIValueMapping): IRIImpl {
    if (cellMapping instanceof ValueMappingImpl) {
      return cellMapping.getValueType();
    }
    return null;
  }

  getStoredModelMapping(): MappingDefinitionImpl {
    return plainToClass(MappingDefinitionImpl, amsterdamMapping, {excludeExtraneousValues: true});
  }

  mappingDefinitionToJson(mapping: MappingDefinition): JSON {
    return JSON.parse(Convert.mappingDefinitionToJson(mapping));
  }
}
