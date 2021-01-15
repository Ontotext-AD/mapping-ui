import 'cypress-localstorage-commands';

class PrepareSteps {
  static prepareMoviesNamespacesAndColumns() {
    cy.setLocalStorage('com.ontotext.graphdb.repository', 'Movies');
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
    PrepareSteps.setCommonRequests();
    PrepareSteps.stubMappingBaseURL();
  }

  static prepareRestaurantsNamespacesAndColumns() {
    cy.setLocalStorage('com.ontotext.graphdb.repository', 'Restaurants');
    cy.route('GET', '/repositories/Restaurants/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:amsterdam/columns.json').as('loadColumns');
    PrepareSteps.setCommonRequests();
  }

  private static setCommonRequests() {
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
  }

  static stubEmptyMappingModel() {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json').as('loadProject');
  }

  static stubMappingBaseURL() {
    cy.route('GET', '/rest/repositories/Movies', 'fixture:repository-configuration.json').as('loadRepo');
  }

  static enableAutocompleteWithEmptyResponse() {
    cy.route('POST', '/repositories/Movies', 'fixture:empty-autocomplete-response.json');
    cy.route('GET', '/rest/autocomplete/enabled', 'true');
  }

  static visitPageAndWaitToLoad() {
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');
    cy.wait('@loadRepo');
    cy.wait('@loadProject');
  }
}
export default PrepareSteps;
