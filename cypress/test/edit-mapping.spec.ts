import MappingSteps from '../steps/mapping-steps';
import {HeaderComponentSelectors} from '../utils/selectors/header-component.selectors';
import HeaderSteps from '../steps/header-steps';

describe('Edit mapping', () => {

  beforeEach(() => {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Movies');
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
  });

  // TODO: I add these tests here for now, but later we should distribute them in respective specs with the related operations
  context('Handle errors', () => {
    it('Should show error notification when model could not be loaded', () => {
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
      cy.route({
        method: 'GET',
        url: '/orefine/command/core/get-models/?project=123',
        status: 500,
        response: 'fixture:edit-mapping/load-mapping-error.json'
      });

      cy.visit('?dataProviderID=ontorefine:123');
      // I expect empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // And I expect notification message
      MappingSteps.getNotification().should('be.visible').and('contain', 'Failed to find project id #1 - may be corrupt (HTTP status 500)');
    });

    it('Should show error notification when namespaces could not be loaded', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
      cy.route({
        method: 'GET',
        url: '/repositories/Movies/namespaces',
        status: 404,
        response: 'fixture:edit-mapping/load-namespaces-error'
      });

      cy.visit('?dataProviderID=ontorefine:123');
      // I expect empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // And I expect notification message
      MappingSteps.getNotification().should('be.visible').and('contain', 'Unknown repository: Movies');
    });

    it('Should show error notification when columns could not be loaded', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route({
        method: 'GET',
        url: '/rest/rdf-mapper/columns/ontorefine:123',
        status: 404,
        response: 'fixture:edit-mapping/load-columns-error'
      });

      cy.visit('?dataProviderID=ontorefine:123');
      // I expect empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // And I expect notification message
      MappingSteps.getNotification().should('be.visible')
        .and('contain', 'Tabular data provider not found: ontorefine:2216295245917sd (HTTP status 404)');
    });

    it('Should show error notification when mapping save operation fails', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
      // cy.route('POST', '/orefine/command/mapping-editor/save-rdf-mapping/?project=123', 'fixture:edit-mapping/save-mapping-success.json');

      // When I load application
      cy.visit('?dataProviderID=ontorefine:123');
      // Then I expect to see empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // And I expect the save button to be disabled
      HeaderSteps.getSaveMappingButton().should('be.visible').and('be.disabled');
      // When I complete a triple
      MappingSteps.completeTriple(0, '@duration', 'as', '123');
      // And Click the save button
      HeaderSteps.saveMapping();
      // Then I expect an error notification
      // TODO: complete after https://ontotext.atlassian.net/browse/GDB-4732
    });

    it('Should show error notification when RDF generation fails', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
      cy.route({
        method: 'POST',
        url: '/rest/rdf-mapper/rdf/ontorefine:123',
        status: 404,
        response: 'fixture:edit-mapping/generate-rdf-error',
        headers: {
          Accept: 'text/turtle',
          'Content-Type': 'application/json'
        }
      });

      // When I load application
      cy.visit('?dataProviderID=ontorefine:123');
      // Then I expect to see a mapping with 2 triples (+1 empty row)
      MappingSteps.getTriples().should('have.length', 3);
      // When I click generate RDF button
      HeaderSteps.generateRdf();
      // Then I expect error notification
      MappingSteps.getNotification().should('be.visible')
        .and('contain', 'Tabular data provider not found: ontorefine:123 (HTTP status 404)');
    });

    it('Should show error notification when SPARQL generation fails', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
      cy.route({
        method: 'POST',
        url: '/rest/rdf-mapper/sparql/ontorefine:123',
        status: 404,
        response: 'fixture:edit-mapping/generate-sparql-error',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // When I load application
      cy.visit('?dataProviderID=ontorefine:123');
      // Then I expect to see a mapping with 2 triples (+1 empty row)
      MappingSteps.getTriples().should('have.length', 3);
      // When I click generate RDF button
      HeaderSteps.generateSparql();
      // Then I expect error notification
      MappingSteps.getNotification().should('be.visible')
        .and('contain', 'Tabular data provider not found: ontorefine:123 (HTTP status 404)');
    });

  });
});
