import HeaderSteps from '../steps/header-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';
import MappingSteps from '../steps/mapping-steps';
import PrepareSteps from '../steps/prepare-steps';

context('Download mapping', () => {
  beforeEach(() => {
    PrepareSteps.prepareMoviesNamespacesAndColumns();
    PrepareSteps.enableAutocompleteWithEmptyResponse();
  });

  it('Should not update JSON mapping when the mapping is not manipulated', () => {
    cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture: 'download-mapping/mapping-model.json'}).as('loadProject');
    cy.intercept('POST', '/rest/rdf-mapper/preview/ontorefine:123',{
      statusCode: 200,
      fixture: 'download-mapping/simple-mapping-model.json',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // When I load application
    PrepareSteps.visitPageAndWaitToLoad();
    // Then I expect to see a mapping with 2 triples (+1 empty row)
    MappingSteps.getTriples().should('have.length', 3);

    // When I click get JSON button
    // THEN the mapping should not be updated.
    cy.fixture('download-mapping/update-mapping1.json').then(updated => {
      HeaderSteps.getJSON().should('deep.equal', updated);
    });
  });

  it('Should show JSON mapping when type is datatype literal ', () => {
    PrepareSteps.stubEmptyMappingModel();
    PrepareSteps.visitPageAndWaitToLoad();

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
