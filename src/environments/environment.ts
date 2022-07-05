// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  restApiUrl: 'http://localhost:3333/rest/rdf-mapper',
  mappingApiUrl: 'http://localhost:3333/orefine/command',
  repositoryApiUrl: 'http://localhost:3333/graphdb-proxy/repositories',
  autocompleteApiUrl: 'http://localhost:3333/graphdb-proxy/rest/autocomplete',
  graphDbResource: 'http://localhost:3333/graphdb-resource',
  httpLoaderPrefix: './assets/i18n/',
  httpLoaderSuffix: '.json',
  openRefineVariables: 'https://github.com/OpenRefine/OpenRefine/wiki/Variables',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
