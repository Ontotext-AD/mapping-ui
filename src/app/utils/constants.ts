export const SUBJECT_SELECTOR = 'subject';
export const PREDICATE_SELECTOR = 'predicate';
export const OBJECT_SELECTOR = 'object';
export const EMPTY_MAPPING = {'baseIRI': 'http://example/base/', 'namespaces': {
  'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
  'geo': 'http://www.opengis.net/ont/geosparql#',
  'foaf': 'http://xmlns.com/foaf/0.1/',
  'skos': 'http://www.w3.org/2004/02/skos/core#',
  'xsd': 'http://www.w3.org/2001/XMLSchema#'}, 'subjectMappings': []};
export const DOWNLOAD_RDF_FILE = 'result-triples.ttl';
export const DOWNLOAD_JSON_FILE = 'mapping.json';
export const GREL_CONSTANT = 'grel';
export const PREFIX_CONSTANT = 'prefix';
export const RAW_CONSTANT = 'raw';
export const CONSTANT = 'constant';
export const MAT_OPTION= 'MAT-OPTION';
export const COLUMN = 'column';
export const DOT = 'dot';
export const COMMA = 'comma';
export const HTTP = 'http';
export const DOUBLE_SLASH = '//';
export const COLON = ':';
export const DATATYPE_SIGN = '^^';
export const LANGUAGE_SIGN='@';
export const EMPTY_PREVIEW = 'empty';
export const PRISTINE_MAPPING = 'pristine';
export const DIRTY_MAPPING = 'dirty';
export const TYPE = 'type';
export const RDF = 'rdf';
export const RDF_COLON = 'rdf:';
export const RDF_FULL = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
export const SPARQL_TYPES = `
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?iri ?g WHERE {
    {
        SELECT * {
            GRAPH ?g {
                ?iri <http://www.ontotext.com/plugins/autocomplete#query> "{{iri}}"
            }
        }
    }
    {
        ?iri a owl:Class
    }
    UNION
    {
        ?iri a rdfs:Class
    }
    UNION
    {
        [] a ?iri
    }
    UNION
    {
        FILTER (regex(str(?iri), "^(http://xmlns.com/foaf/0.1/|http://www.w3.org/1999/02/22-rdf-syntax-ns#|http://www.w3.org/2000/01/rdf-schema#|http://www.opengis.net/ont/geosparql#|http://www.w3.org/2004/02/skos/core#)"))
    }
}`;
export const SPARQL_PREDICATES=`
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT distinct ?iri ?g WHERE {
    {
        SELECT * {
            GRAPH ?g {
                ?iri <http://www.ontotext.com/plugins/autocomplete#query> "{{iri}}"
            }
        }
    }
    {
        ?iri a owl:DatatypeProperty
    }
    UNION
    {
        ?iri a owl:ObjectProperty
    }
    UNION
    {
        ?iri a rdf:Property
    }
    UNION
    {
        [] ?iri []
    }
    UNION
    {
        FILTER (regex(str(?iri), "^(http://xmlns.com/foaf/0.1/|http://www.w3.org/1999/02/22-rdf-syntax-ns#|http://www.w3.org/2000/01/rdf-schema#|http://www.opengis.net/ont/geosparql#|http://www.w3.org/2004/02/skos/core#)"))
    }
}`;
export const SPARQL_AUTOCOMPLETE=`SELECT distinct ?iri ?g WHERE {
    {
        GRAPH ?g {
            ?iri <http://www.ontotext.com/plugins/autocomplete#query> "{{iri}}"}.
    }
}`;
export const SOURCE_SIGN = {
  Column: '@',
  RecordRowID: '$',
};

export const SPARQL_IRI_DESCRIPTION = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
select ?description where {
    <{{iri}}> rdfs:comment ?description
} limit 1`;

export const EMPTY_NAMESPACE_KEY = 'ERROR.EMPTY_NAMESPACE';
export const COLON_NOT_ALLOWED_KEY = 'ERROR.COLON_NOT_ALLOWED';
export const MALFORMED_NAMESPACE_KEY = 'ERROR.MALFORMED_NAMESPACE';
