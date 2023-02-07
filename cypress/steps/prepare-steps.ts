import 'cypress-localstorage-commands';
import {MapperComponentSelectors} from '../utils/selectors/mapper-component.selectors';
import {SparqlEditorComponentSelectors} from '../utils/selectors/sparql-editor-component.selectors';

class PrepareSteps {
  static prepareMoviesNamespacesAndColumns() {
    cy.intercept('GET', '/graphdb-proxy/repositories/repository_placeholder/namespaces', {fixture: 'namespaces.json'});
    cy.intercept('GET', '/rest/rdf-mapper/columns/ontorefine:123', {fixture: 'columns.json'}).as('loadColumns');
    PrepareSteps.setCommonRequests();
  }

  static prepareRestaurantsNamespacesAndColumns() {
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

  static prepareQueriesGenerationResponses(): void {
    cy.intercept('GET', '/rest/sparql-mapper/query?project=ontorefine:123&type=standard', {
      fixture: 'sparql-editor/standard-query-generation'
    });
    cy.intercept('GET', '/rest/sparql-mapper/query?project=ontorefine:123&type=standard_with_service', {
      fixture: 'sparql-editor/standard-with-service-query-generation'
    });
    cy.intercept('GET', '/rest/sparql-mapper/query?project=ontorefine:123&type=mapping_based', {
      fixture: 'sparql-editor/mapping-based-query-generation'
    });
    cy.intercept('GET', '/rest/sparql-mapper/query?project=ontorefine:123&type=mapping_based_with_service', {
      fixture: 'sparql-editor/mapping-based-with-service-query-generation'
    });
  }

  static prepareEmptyEditorConfigurations(): void {
    cy.intercept('GET', '/rest/sparql-mapper/editor-config?project=123', {
      statusCode: 204
    });
  }

  static visitPageAndWaitToLoad(): void {
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait(['@loadColumns', '@loadProject']);
    // Ensures the CELL_INPUT element is visible
    cy.get(`[appCypressData=${MapperComponentSelectors.CELL_INPUT}]`).should('be.visible');
    // TODO this is a very ugly solution to a problem caused by detached elements in the DOM
    cy.wait(300);
  }

  static visitPageAndOpenSparqlEditor(): void {
    this.visitPageAndWaitToLoad();
    cy.get(SparqlEditorComponentSelectors.TAB_ID).click();
    cy.get(SparqlEditorComponentSelectors.YASGUI).should('be.visible');
  }
}

export default PrepareSteps;
