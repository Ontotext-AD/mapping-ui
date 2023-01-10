// The cypress tests are running on localhost and port 4200, but the packaging
// in dist folder is a bit different than the way how mapper is packaged in
// GDB dist - orefin/extension/mapping-editor
export const environment = {
  production: false,
  restApiUrl: 'http://localhost:4200/rest/rdf-mapper',
  restSparqlApiUrl: 'http://localhost:4200/rest/sparql-mapper',
  mappingApiUrl: 'http://localhost:4200/orefine/command',
  refineVirtualRepositoryUrl: 'http://localhost:4200/repositories/',
  repositoryApiUrl: 'http://localhost:4200/graphdb-proxy/repositories',
  autocompleteApiUrl: 'http://localhost:4200/graphdb-proxy/rest/autocomplete',
  graphDbResource: 'http://localhost:4200/graphdb-resource',
  httpLoaderPrefix: './assets/i18n/',
  httpLoaderSuffix: '.json',
  openRefineVariables: 'https://github.com/OpenRefine/OpenRefine/wiki/Variables',
};
