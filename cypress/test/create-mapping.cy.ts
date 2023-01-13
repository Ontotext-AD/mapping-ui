import MappingSteps from '../steps/mapping-steps';
import HeaderSteps from '../steps/header-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';
import PrepareSteps from '../steps/prepare-steps';

describe('Create mapping', () => {

  beforeEach(() => {
    PrepareSteps.prepareMoviesNamespacesAndColumns();
  });

  it('Should create, save mapping and load RDF', () => {
    PrepareSteps.enableAutocompleteWithEmptyResponse();
    PrepareSteps.stubEmptyMappingModel();
    cy.intercept('POST', '/rest/rdf-mapper/preview/ontorefine:123', {fixture: 'create-mapping/preview-response.json'});
    cy.intercept('POST', '/orefine/command/mapping-editor/save-rdf-mapping/?project=123', {
      statusCode: 200,
      delay: 1000,
      fixture: 'create-mapping/save-mapping-success.json'
    }).as('saveMapping');

    cy.intercept('POST', '/rest/rdf-mapper/rdf/ontorefine:123', {
      statusCode: 200,
      delay: 1000,
      response: ''
    }).as('loadRdf');

    cy.intercept('POST', '/rest/rdf-mapper/sparql-url-with-query/ontorefine:123', {
      statusCode: 200,
      delay: 1000,
      fixture: 'create-mapping/load-sparql-response',
      headers: {
        Accept: 'application/json'
      }
    }).as('loadSparql');

    // Given I have opened the application
    PrepareSteps.visitPageAndWaitToLoad();
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
      cy.wait('@saveMapping').then(xhr => {
        expect(xhr.request.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
        expect(xhr.request.method).to.equal('POST');
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
    cy.wait('@loadRdf').then(interception => {
      expect(interception.request.url).to.include('/rest/rdf-mapper/rdf/ontorefine:123');
      expect(interception.request.method).to.equal('POST');
    });

    cy.get('@loadRdf').then((xhr: any) => {
      cy.fixture('create-mapping/load-rdf-request-body.json').then((mappingData: any) => {
        expect(xhr.request.body).to.deep.equal(mappingData);
      });
    });

    // When I generate sparql
    HeaderSteps.generateSparql();
    // Then I expect loading indicator
    HeaderSteps.getGenerateSparqlIndicator().should('be.visible');
    // Then I expect sparql to be loaded. The actual download can't be checked
    cy.wait('@loadSparql').then((interception) => {
      expect(interception.request.url).to.include('/rest/rdf-mapper/sparql-url-with-query/ontorefine:123');
      expect(interception.request.method).to.equal('POST');
    });
    cy.get('@loadSparql').then((xhr: any) => {
      cy.fixture('create-mapping/load-sparql-request-body.json').then((mappingData: any) => {
        expect(xhr.request.body).to.deep.equal(mappingData);
      });
      cy.fixture('create-mapping/load-sparql-response').then((response: any) => {
        expect(xhr.response.body).to.equal(response);
      });
    });
  });

  it('Should show error notification when mapping save operation fails', () => {
    PrepareSteps.stubEmptyMappingModel();
    // When I load application
    PrepareSteps.visitPageAndWaitToLoad();
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

  it('Should render type in a badge inside the cell', () => {
    cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture: 'create-mapping/all-types-mapping-model.json'}).as('loadProject');
    // When I load a mapping containing all type mappings
    PrepareSteps.visitPageAndWaitToLoad();
    // Then I expect to see the types displayed in badge inside the cell
    MappingSteps.getTriples().should('have.length', 7);
    MappingSteps.getTripleSubjectType(0).should('contain', 'IRI');
    MappingSteps.getTriplePredicateType(0).should('contain', 'IRI');
    MappingSteps.getTripleObjectType(0).should('contain', 'Literal');
    MappingSteps.getTripleObjectType(1).should('contain', 'Language');
    MappingSteps.getTripleObjectType(2).should('contain', 'IRI');
    MappingSteps.getTripleObjectType(3).should('contain', 'Datatype');
    MappingSteps.getTripleObjectType(4).should('contain', 'Unique BNode');
    MappingSteps.getTripleObjectType(5).should('contain', 'BNode');
  });

  it('Should be able to set rdf:type on blank nodes', () => {
    PrepareSteps.stubEmptyMappingModel();
    // When I load application
    PrepareSteps.visitPageAndWaitToLoad();

    // When I create a mapping
    MappingSteps.completeTriple(0, 'subject', 'rdf:type', 'Object');
    MappingSteps.completeTriple(1, 'subject', 'rdf:name', 'Test');
    MappingSteps.addTriplePredicateSibling(1);
    MappingSteps.completePredicate(2, 'rdf:node');
    MappingSteps.editEmptyTripleObject(2);
    EditDialogSteps.selectValueBnode();
    EditDialogSteps.selectColumn();
    EditDialogSteps.completeColumn('color');
    EditDialogSteps.saveConfiguration();
    MappingSteps.addNestedTriple(2);
    MappingSteps.completePredicate(3, 'rdf:type');
    MappingSteps.completeObject(3, 'BlankNodeType');

    // Then I expect to see the rdf:type of the blank node displayed
    MappingSteps.getTriplePredicate(3).find('.type-property').should('have.text', 'a');
    MappingSteps.getTripleObjectSource(3).find('.ng-star-inserted').should('contain', 'BlankNodeType');
  });

  context('Transformation type', () => {
    it('Should render transformation type in a badge in the cell', () => {
      PrepareSteps.enableAutocompleteWithEmptyResponse();
      cy.intercept('POST', '/rest/rdf-mapper/preview/ontorefine:123', {fixture: 'create-mapping/preview-response.json'});
      cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture: 'create-mapping/transformation-types-mapping-model.json'}).as('loadProject');

      // Given I have opened the application with an a mapping containing transformation types
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.getTriples().should('have.length', 3);
      // First triple
      // Then I expect subject to have a property prefix badge
      MappingSteps.getTripleSubjectPropertyTransformation(0).should('contain', 'rdf');
      // And I expect predicate to have a property grel transformation badge
      MappingSteps.getTriplePredicatePropertyTransformation(0).should('contain', 'GREL');
      // And I expect object to have a prefix, grel and datatype transformation badge
      MappingSteps.getTripleObjectPropertyTransformation(0).should('contain', 'GREL');
      MappingSteps.getTripleObjectValueTransformation(0).should('contain', 'rdf');
      MappingSteps.getTripleObjectSecondaryType(0).should('contain', 'Datatype');
      // Second triple
      // Then I expect subject to have a property prefix badge
      MappingSteps.getTripleSubjectPropertyTransformation(1).should('contain', 'GREL');
      // And I expect predicate to have a property grel transformation badge
      MappingSteps.getTriplePredicatePropertyTransformation(1).should('contain', 'GREL');
      // And I expect object to have a prefix, grel and datatype transformation badge
      MappingSteps.getTripleObjectPropertyTransformation(1).should('contain', 'GREL');
      MappingSteps.getTripleObjectValueTransformation(1).should('contain', 'GREL');
      MappingSteps.getTripleObjectSecondaryType(1).should('contain', 'Language');
    });

    it('Should not be able to set prefix transformation when type is not IRI', () => {
      PrepareSteps.stubEmptyMappingModel();
      PrepareSteps.enableAutocompleteWithEmptyResponse();
      cy.intercept('POST', '/rest/rdf-mapper/preview/ontorefine:123', {fixture: 'create-mapping/preview-response.json'});

      // Given I have opened the application with an empty mapping
      PrepareSteps.visitPageAndWaitToLoad();
      // And I have created a triple with a literal as type
      MappingSteps.completeTriple(0, '@duration', 'is', '123');
      MappingSteps.getTriples().should('have.length', 2);
      // When I open the edit object dialog
      MappingSteps.editTripleObjectWithData(0);
      // Then I shouldn't be able to set prefix transformation
      EditDialogSteps.getGrelTransformationButton().should('be.visible');
      // When I change the object type to IRI
      EditDialogSteps.selectIri();
      // Then I expect that the prefix transformation button to be enabled
      EditDialogSteps.getGrelTransformationButton().should('be.visible');
      // When I complete a prefix
      EditDialogSteps.completePrefix('rdf');
      EditDialogSteps.saveConfiguration();
      // Then I should see the prefix in the object cell
      MappingSteps.getTripleObjectPropertyTransformation(0).should('contain', 'rdf:');
      // When I open the object edit dialog
      MappingSteps.editTripleObjectWithData(0);
      // Then I expect the prefix still to be selected and completed
      EditDialogSteps.getGrelTransformationButton().should('be.visible');
      EditDialogSteps.getTransformationExpressionField().should('have.value', 'rdf');
      // When I change the object type to something different than IRI
      EditDialogSteps.selectLiteral();
      // Then I expect available transformation to be GREL only And the expression field to be cleared
      EditDialogSteps.getGrelTransformationButton().should('be.visible').find('button').should('have.attr', 'aria-pressed', 'false');
      EditDialogSteps.saveConfiguration();

      // When I create a mapping with a type predicate
      MappingSteps.completeTriple(1, '@duration', 'a', '123');
      MappingSteps.getTriples().should('have.length', 3);
      // And I open edit dialog
      MappingSteps.editTripleObjectWithData(1);
      // Then I expect to be able to set prefix and grel value transformations
      EditDialogSteps.getGrelTransformationButton().should('be.visible');
    });
  });
});
