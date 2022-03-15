export const environment = {
  production: true,
  restApiUrl: '../../../rest/rdf-mapper',
  mappingApiUrl: '../../command',
  httpLoaderPrefix: './assets/i18n/',
  httpLoaderSuffix: '.js',
  openRefineVariables: 'https://github.com/OpenRefine/OpenRefine/wiki/Variables',

  // Default GraphDB url, user can set a  different one via the UI
  graphDB: 'http://localhost:7200',
};
