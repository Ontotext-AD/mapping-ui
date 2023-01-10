/**
 * Defines options for the type of the SPARQL query that can be downloaded.
 */
export enum DownloadSparqlType {
  DEFAULT = 'default',
  SERVICE = 'service'
}

/**
 * Defines options for type of the SPARQL query that can be generated.
 */
export enum GenerationSparqlType {
  STANDARD = 'standard',
  STANDARD_WITH_SERVICE = 'standard_with_service',
  MAPPING_BASED = 'mapping_based',
  MAPPING_BASED_WITH_SERVICE = 'mapping_based_with_service'
}
