export interface MappingDetails {
  typeMapping?: boolean;

  // Value source
  columnName?: string;
  source?: string;
  constant?: string;

  // Value type
  type?: string;
  literalType?: string;

  // Value transformation
  expression?: string;
  grelExpression?: string;
  language?: string;

  dataTypeValueSource?: string;
  datatypeTransformation?: string;
  datatypeGrelTransformation?: string;

  hasDatatype: boolean;
  dataTypeColumnName?: string;
  dataTypeConstant?: string;
  datatypeLanguage?: string;

  hasLanguage:boolean;
  languageValueSource?: string;
  languageColumnName?: string;
  languageConstant?: string;
  languageTransformation?: string;
  languageTransformationLanguage?: string;

}
