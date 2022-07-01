import 'cypress-localstorage-commands';

class PrepareSteps {
  static prepareMoviesNamespacesAndColumns() {
    cy.route('GET', '/graphdb-proxy/repositories/repository_placeholder/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
    PrepareSteps.setCommonRequests();
  }

  static prepareRestaurantsNamespacesAndColumns() {
    cy.route('GET', '/graphdb-proxy/repositories/repository_placeholder/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:amsterdam/columns.json').as('loadColumns');
    PrepareSteps.setCommonRequests();
  }

  private static setCommonRequests() {
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    cy.route('GET', '/rest/rdf-mapper/graphdb-url', 'http://localhost:7200');
  }

  static stubEmptyMappingModel() {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json').as('loadProject');
  }

  static enableAutocompleteWithEmptyResponse() {
    cy.route('POST', '/graphdb-proxy/repositories/repository_placeholder', 'fixture:empty-autocomplete-response.json');
    cy.route('GET', '/graphdb-proxy/rest/autocomplete/enabled', 'true');
  }

  static visitPageAndWaitToLoad() {
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');
    cy.wait('@loadProject');
  }
}
export default PrepareSteps;
