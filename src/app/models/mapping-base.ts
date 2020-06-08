import {ValueTransformationImpl} from 'src/app/models/value-transformation-impl';
import {IRIImpl} from 'src/app/models/iri-impl';
import {ColumnImpl} from 'src/app/models/column-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';

export interface MappingBase {
  /**
   * Get the type mappings for the cell
   *
   * @return array of type mappings
   */
  getTypeMappings(): SimpleIRIValueMappingImpl[] ;

  /**
   * Get the property mappings for the cell
   *
   * @return array of property mappings
   */
  getPropertyMappings(): PropertyMappingImpl[];

  /**
   * Get the value source for the cell depending on the cellMapping type
   *
   * @return value source
   */
  getValueSource(): ColumnImpl;

  /**
  * Get the transformation for the cell depending on the cellMapping type
  *
  * @return value transformation
  */
  getValueTransformation(): ValueTransformationImpl;

  /**
   * Get value Type. Returns the ValueType but only when the cellMapping is a ValueMapping
   * Only ValueMappings have such a type
   *
   * @return value type
   */
  getValueType(): IRIImpl;

  /**
   * Sets the cell's type
   */
  setValueType(iri: IRIImpl): void;

  /**
   * Sets the cell's type source
   */
  setValueSource(column: ColumnImpl);


  /**
   * Sets the cell's type transformation
   */
  setValueTransformation(transformation: ValueTransformationImpl);

  /**
   * Clears the cells mapping, not altering type nor property mappings
   */
  clearMapping(): void;
}
