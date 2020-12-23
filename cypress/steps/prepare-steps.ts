class PrepareSteps {
  static prepareMoviesNamespacesAndColumns() {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Movies');
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
    PrepareSteps.setCommonRequests();
  }

  static prepareRestaurantsNamespacesAndColumns() {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Restaurants');
    cy.route('GET', '/repositories/Restaurants/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:amsterdam/columns.json').as('loadColumns');
    PrepareSteps.setCommonRequests();
  }

  private static setCommonRequests() {
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
  }

  /*
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:amsterdam/amsterdam-model.json').as('loadProject');
    cy.route('GET', '/rest/autocomplete/enabled', 'true');
    cy.route('GET', '/repositories/Restaurants/namespaces', 'fixture:namespaces.json');
   */

  static stubEmptyMappingModel() {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json').as('loadProject');
  }

  static enableAutocompleteWithEmptyResponse() {
    cy.route('POST', '/repositories/Movies', 'fixture:empty-autocomplete-response.json');
    cy.route('GET', '/rest/autocomplete/enabled', 'true');
  }

  static visitPageAndWaitToLoad() {
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');
    cy.wait('@loadProject');
  }
}
export default PrepareSteps;
