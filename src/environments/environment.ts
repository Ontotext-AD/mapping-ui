// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// In developer mode mapper is running on localhost and port 4200.
// Setting graphDbUrl to 'http://localhost:4200' to match the recipient window's origin.
// All other requests are sent to underlying GDB on port 7200.

export const environment = {
  production: false,
  graphDbUrl: 'http://localhost:4200',
  restApiUrl: 'http://localhost:7200/rest/rdf-mapper',
  mappingApiUrl: 'http://localhost:7200/orefine/command',
  repositoryApiUrl: 'http://localhost:7200/repositories',
  repositoryGDBApiUrl: 'http://localhost:7200/rest/repositories',
  autocompleteApiUrl: 'http://localhost:7200/rest/autocomplete',
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
