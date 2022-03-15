// The cypress tests are running on localhost and port 4200, but the packaging
// in dist folder is a bit different than the way how mapper is packaged in
// GDB dist - orefin/extension/mapping-editor

export const environment = {
  production: false,
  restApiUrl: 'http://localhost:4200/rest/rdf-mapper',
  mappingApiUrl: 'http://localhost:4200/orefine/command',
  httpLoaderPrefix: './assets/i18n/',
  httpLoaderSuffix: '.json',
  openRefineVariables: 'https://github.com/OpenRefine/OpenRefine/wiki/Variables',

  // Default GraphDB url, user can set a  different one via the UI
  graphDB: 'http://localhost:4200',
};
