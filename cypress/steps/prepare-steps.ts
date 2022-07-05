import 'cypress-localstorage-commands';
import {MapperComponentSelectors} from "../utils/selectors/mapper-component.selectors";

class PrepareSteps {
  static prepareMoviesNamespacesAndColumns() {
    cy.setLocalStorage('com.ontotext.graphdb.repository', 'Movies');
    cy.intercept('GET', '/graphdb-proxy/repositories/repository_placeholder/namespaces', {fixture: 'namespaces.json'});
    cy.intercept('GET', '/rest/rdf-mapper/columns/ontorefine:123', {fixture: 'columns.json'}).as('loadColumns');
    PrepareSteps.setCommonRequests();
  }

  static prepareRestaurantsNamespacesAndColumns() {
    cy.setLocalStorage('com.ontotext.graphdb.repository', 'Restaurants');
    cy.intercept('GET', '/graphdb-proxy/repositories/repository_placeholder/namespaces', {fixture: 'namespaces.json'});
    cy.intercept('GET', '/rest/rdf-mapper/columns/ontorefine:123', {fixture: 'amsterdam/columns.json'}).as('loadColumns');
    PrepareSteps.setCommonRequests();
  }

  private static setCommonRequests() {
    cy.intercept('GET', '/sockjs-node/info?t=*', {fixture: 'info.json'});
    cy.intercept('GET', '/assets/i18n/en.json', {fixture: 'en.json'});
    cy.intercept('GET', '/rest/rdf-mapper/graphdb-url', 'http://localhost:7200');
  }

  static stubEmptyMappingModel() {
    cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture: 'empty-mapping-model.json'}).as('loadProject');
  }

  static enableAutocompleteWithEmptyResponse() {
    cy.intercept('POST', '/graphdb-proxy/repositories/repository_placeholder', {fixture: 'empty-autocomplete-response.json'});
    cy.intercept('GET', '/graphdb-proxy/rest/autocomplete/enabled', {
      statusCode: 200,
      body: "true"
    });
  }

  static visitPageAndWaitToLoad() {
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait(['@loadColumns', '@loadProject']);
    // Ensures the CELL_INPUT element is visible
    cy.get(`[appCypressData=${MapperComponentSelectors.CELL_INPUT}]`, { timeout: 10000 }).should('be.visible');
  }
}

export default PrepareSteps;
