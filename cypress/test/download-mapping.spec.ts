import HeaderSteps from '../steps/header-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';
import MappingSteps from '../steps/mapping-steps';

context('Download mapping', () => {
  beforeEach(() => {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Movies');
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    cy.route('POST', '/repositories/Movies', 'fixture:download-mapping/autocomplete-response.json');
    cy.route('GET', '/rest/autocomplete/enabled', 'true');
  });

  it('Should not update JSON mapping when the mapping is not manipulated', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:download-mapping/mapping-model.json');
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
    cy.route({
      method: 'POST',
      url: '/rest/rdf-mapper/preview/ontorefine:123',
      status: 200,
      response: 'fixture:download-mapping/simple-mapping-model.json',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // When I load application
    cy.visit('?dataProviderID=ontorefine:123');
    // Then I expect to see a mapping with 2 triples (+1 empty row)
    MappingSteps.getTriples().should('have.length', 3);

    // When I click get JSON button
    // THEN the mapping should not be updated.
    cy.fixture('download-mapping/update-mapping1.json').then(updated => {
      HeaderSteps.getJSON().should('deep.equal', updated);
    });
  });

  it('Should show JSON mapping when type is datatype literal ', () => {
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
    cy.visit('?dataProviderID=ontorefine:123');

    MappingSteps.completeTriple(0, 'subject', 'predicate', 'object');
    MappingSteps.editTripleObjectWithData(0);

    EditDialogSteps.selectTypeDataTypeLiteral();
    EditDialogSteps.selectDataTypeConstant();
    EditDialogSteps.completeDataTypeConstant('constant');
    EditDialogSteps.saveConfiguration();

    // When I click get JSON button
    // THEN the mapping should be updated.
    cy.fixture('download-mapping/update-mapping2.json').then(updated => {
      HeaderSteps.getJSON().should('deep.equal', updated);
    });
  });
});
