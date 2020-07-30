export const SUBJECT_SELECTOR = 'subject';
export const PREDICATE_SELECTOR = 'predicate';
export const OBJECT_SELECTOR = 'object';
export const EMPTY_MAPPING = {'baseIRI': 'http://example/base/', 'namespaces': {'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'}, 'subjectMappings': []};
export const DOWNLOAD_RDF_FILE = 'result-triples.ttl';
export const GREL_CONSTANT = 'grel';
export const PREFIX_CONSTANT = 'prefix';
export const CONSTANT = 'constant';
export const MAT_OPTION= 'MAT-OPTION';
export const COLUMN = 'column';
export const DOT = 'dot';
export const COMMA = 'comma';
export const HTTP = 'http';
export const DOUBLE_SLASH = '//';
export const COLON = ':';
export const SPARQL_TYPES = `
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?iri ?g WHERE {
    {
        GRAPH ?g {
            ?iri <http://www.ontotext.com/plugins/autocomplete#query> "KEY_WORD"
        } .
        VALUES ?classClass {
            owl:Class rdfs:Class
        }
        ?classSubject a ?classClass .
        ?x a ?classObject .
        FILTER (?iri in (?classSubject, ?classObject))
    }
}`;
export const SPARQL_PREDICATES=`
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT distinct ?iri ?g WHERE {
    {
        GRAPH ?g {
            ?iri <http://www.ontotext.com/plugins/autocomplete#query> "KEY_WORD"
        } .
        VALUES ?propertyClass {
            owl:DatatypeProperty  owl:ObjectProperty rdf:Property
        }
        ?propertyInstance a ?propertyClass .
        ?s ?property ?o .
        FILTER (?iri in (?propertyInstance, ?property))
    }
}`;
export const SPARQL_AUTOCOMPLETE=`SELECT distinct ?iri ?g WHERE {
    {
        GRAPH ?g {
            ?iri <http://www.ontotext.com/plugins/autocomplete#query> "KEY_WORD"}.
    }
}`;
export const SOURCE_SIGN = {
  Column: '@',
  RecordRowID: '$',
};
