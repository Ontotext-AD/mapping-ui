export interface MappingDetails {
  typeMapping?: boolean;

  // Value source
  columnName?: string;
  source?: string;
  constant?: string;

  // Value type
  type?: string;

  // Value transformation
  expression?: string;
  language?: string;

  dataTypeValueSource?: string;
  datatypeTransformation?: string;

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
