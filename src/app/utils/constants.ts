export const SUBJECT_SELECTOR = 'subject';
export const PREDICATE_SELECTOR = 'predicate';
export const OBJECT_SELECTOR = 'object';
export const EMPTY_MAPPING = {'baseIRI': 'http://sample/base', 'namespaces': {'my': 'http://my/', 'example': 'http://example/'}, 'subjectMappings': []};
export const DOWNLOAD_RDF_FILE = 'result-triples.ttl';
export const GREL_CONSTANT = 'grel';
export const PREFIX_CONSTANT = 'prefix';
export const SPARQL_TYPES = `SELECT distinct ?iri ?g WHERE {
    {
        GRAPH ?g {
            ?iri <http://www.ontotext.com/plugins/autocomplete#query> "KEY_WORD"}.
            ?x a ?iri .
}}`;
export const SPARQL_PREDICATES=`SELECT distinct ?iri ?g WHERE {
    {
        GRAPH ?g {
            ?iri <http://www.ontotext.com/plugins/autocomplete#query> "KEY_WORD"}.
            ?s ?iri ?o .
    }
}`;
export const SPARQL_AUTOCOMPLETE=`SELECT distinct ?iri ?g WHERE {
    {
        GRAPH ?g {
            ?iri <http://www.ontotext.com/plugins/autocomplete#query> "KEY_WORD"}.
    }
}`;
