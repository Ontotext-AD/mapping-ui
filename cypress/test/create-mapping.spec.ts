import MappingSteps from '../steps/mapping-steps';
import HeaderSteps from '../steps/header-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';

describe('Create mapping', () => {

  beforeEach(() => {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Movies');
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
  });

  it('Should create, save mapping and load RDF', () => {
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('POST', '/repositories/Movies', 'fixture:create-mapping/autocomplete-response.json');
    cy.route('POST', '/rest/rdf-mapper/preview/ontorefine:123', 'fixture:create-mapping/preview-response.json');
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
    cy.route({
      method: 'POST',
      url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
      status: 200,
      delay: 1000,
      response: 'fixture:create-mapping/save-mapping-success.json'
    }).as('saveMapping');
    cy.route({
      method: 'POST',
      url: '/rest/rdf-mapper/rdf/ontorefine:123',
      status: 200,
      delay: 1000,
      response: ''
    }).as('loadRdf');
    cy.route({
      method: 'POST',
      url: '/rest/rdf-mapper/sparql/ontorefine:123',
      status: 200,
      delay: 1000,
      response: 'fixture:create-mapping/load-sparql-response',
      headers: {
        Accept: 'application/json'
      }
    }).as('loadSparql');

    // Given I have opened the application
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');
    // When The mapping is empty
    MappingSteps.getTriples().should('have.length', 1);
    // Then I expect the save button to be disabled
    HeaderSteps.getSaveMappingButton().should('be.disabled');
    // When I create a mapping
    MappingSteps.completeTriple(0, '@duration', 'as', '@color');
    // And I save the mapping
    HeaderSteps.saveMapping();
    // Then I expect a loading indicator
    HeaderSteps.getSaveIndicator().should('be.visible');
    // And The mapping should be saved
    cy.fixture('create-mapping/save-mapping-request-body').then((saveResponse: string) => {
      cy.wait('@saveMapping');
      cy.get('@saveMapping').should((xhr: any) => {
        expect(xhr.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
        expect(xhr.method).to.equal('POST');
        expect(xhr.request.body).to.equal(saveResponse);
      });
    });
    // When I generate rdf
    HeaderSteps.generateRdf();
    // Then I expect loading indicator
    HeaderSteps.getGenerateRdfIndicator().should('be.visible');
    // Then I expect rdf to be loaded.
    // The actual download can be checked if we verify the dynamically created download link href attribute but it needs to be appended to
    // the DOM. As long it's not we can't find and test it.
    cy.wait('@loadRdf');
    cy.get('@loadRdf').should((xhr: any) => {
      expect(xhr.url).to.include('/rest/rdf-mapper/rdf/ontorefine:123');
      expect(xhr.method).to.equal('POST');
      expect(xhr.xhr.responseType).to.equal('blob');
      cy.fixture('create-mapping/load-rdf-request-body.json').then((mappingData: any) => {
        expect(xhr.request.body).to.deep.equal(mappingData);
      });
    });
    // When I generate sparql
    HeaderSteps.generateSparql();
    // Then I expect loading indicator
    HeaderSteps.getGenerateSparqlIndicator().should('be.visible');
    // Then I expect sparql to be loaded. The actual download can't be checked
    cy.wait('@loadSparql');
    cy.get('@loadSparql').should((xhr: any) => {
      console.log('xhr: ', xhr);
      expect(xhr.url).to.include('/rest/rdf-mapper/sparql/ontorefine:123');
      expect(xhr.method).to.equal('POST');
      cy.fixture('create-mapping/load-sparql-request-body.json').then((mappingData: any) => {
        expect(xhr.request.body).to.deep.equal(mappingData);
      });
      cy.fixture('create-mapping/load-sparql-response').then((response: any) => {
        expect(xhr.response.body).to.equal(response);
      });
    });
  });

  it('Should show error notification when mapping save operation fails', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
    // cy.route('POST', '/orefine/command/mapping-editor/save-rdf-mapping/?project=123', 'fixture:edit-mapping/save-mapping-success.json');
    // When I load application
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');
    // TODO mock REST preview endpoint
    // I switch to configuration view
    HeaderSteps.getConfigurationButton().click();
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
});
