// The cypress tests are running on localhost and port 4200, but the packaging
// in dist folder is a bit different than the way how mapper is packaged in
// GDB dist - orefin/extension/mapping-editor.

// Setting graphDbUrl to 'http://localhost:4200' to match the recipient window's origin.
// All other requests are mocked

export const environment = {
  production: false,
  graphDbUrl: 'http://localhost:4200',
  restApiUrl: '/rest/rdf-mapper',
  mappingApiUrl: '/orefine/command',
  repositoryApiUrl: '/repositories',
  repositoryGDBApiUrl: '/rest/repositories',
  autocompleteApiUrl: '/rest/autocomplete',
  httpLoaderPrefix: './assets/i18n/',
  httpLoaderSuffix: '.json',
  openRefineVariables: 'https://github.com/OpenRefine/OpenRefine/wiki/Variables',
};
