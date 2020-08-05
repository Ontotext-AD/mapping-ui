# rdf-mapping-editor

RDF Mapping is a UI extension of OpenRefine, which helps creating a declarative tabular to RDF mappings using GREL.

## Development

### Setup environment

* Checkout or clone the project from GitHub.
* Enter the project directory and execute `npm install` in order to install all needed dependencies locally.

### Local deployment

* Start GraphDB v9.4.0+
* Upload a table model in OntoRefine and create a project.
* Get the project id.
* In the application root directory execute `npm run start` command which builds and deploys the source code on a development server.
* Navigate to `http://localhost:4200/?dataProviderID=ontorefine:THE_PROJECT_ID`. The app will automatically reload if you change any of the source files.

### Running unit tests

Run `npm run test` to execute the unit tests via [Jest](https://jestjs.io/).

### Running integration tests

Run `npm run cy:run` to execute the integration tests via [Cypress](https://www.cypress.io/).

Run `npm run cy:open` to open the cypress dashboard and run the tests manually.

## Release and publish

This application is regularly published as a package in the NPM registry.
   
When a newer version needs to be published:
   
* Increase the version in the `package.json` by following the semantic versioning approach.
* Create a new MR and a tag through Github. Beware the version to follow the pattern /v[0-9]+\.[0-9]+\.[0-9]+(-.*)?$/ as defined in .travis.yml. Any discrepancies will result in version being rejected as appropriate for publish in the NPM.
* If the build is successful which can be seen in https://travis-ci.com/Ontotext-AD/rdf-mapping-editor the application package is published in NPM which can be also verified on the site https://www.npmjs.com/package/rdf-mapping-editor.
