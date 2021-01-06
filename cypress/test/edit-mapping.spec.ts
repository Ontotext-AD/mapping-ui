import MappingSteps from '../steps/mapping-steps';
import HeaderSteps from '../steps/header-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';
import PrepareSteps from '../steps/prepare-steps';

describe('Edit mapping', () => {

  beforeEach(() => {
    PrepareSteps.prepareMoviesNamespacesAndColumns();
    PrepareSteps.enableAutocompleteWithEmptyResponse();
  });

  context('Edit and close dialog with hotkeys', () => {
    it('Should open and close the edit dialog with a hotkey', () => {
      PrepareSteps.stubEmptyMappingModel();
      // Given I have opened an empty mapping
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.getTriples().should('have.length', 1);
      // When I focus the first triple's subject and execute ctrl+enter key combination
      // Add some wait here to prevent finding the input in detached state
      MappingSteps.getTripleSubjectValue(0).wait(200).focus().type('{ctrl}{enter}', {
        parseSpecialCharSequences: true
      });
      // Then I expect the subject edit dialog to be opened
      EditDialogSteps.getDialogTitle().should('contain', 'Subject RDF Value Mapping');
      // When I complete the form
      EditDialogSteps.selectConstant();
      EditDialogSteps.completeConstant('1');
      // And execute ctrl+enter key combination while dialog is opened
      EditDialogSteps.selectConstant().focus().type('{ctrl}{enter}', {
        parseSpecialCharSequences: true
      });
      // Then I expect subject mapping configuration to be saved
      MappingSteps.getTripleSubjectValuePreview(0).should('contain', '1');
      MappingSteps.getTripleSubjectSourceType(0).should('contain', 'C');
    });
  });

  context('Siblings', () => {
    it('Should add sibling on a type property object', () => {
      PrepareSteps.stubEmptyMappingModel();
      // Given I have opened an empty mapping
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.getTriples().should('have.length', 1);
      // And I have created a type property mapping
      MappingSteps.completeTriple(0, 's', 'a', 'o');
      MappingSteps.getTriples().should('have.length', 2);
      // When I add a sibling
      MappingSteps.addTripleObjectSibling(0);
      MappingSteps.type('so', () => MappingSteps.getTripleObjectValue(1)).blur();
      // Then I expect the sibling to be added
      MappingSteps.getTriples().should('have.length', 3);
      MappingSteps.getTripleSubject(1).find('.triple-item-preview').should('have.text', '');
      MappingSteps.getTriplePredicate(1).find('.triple-item-preview').should('have.text', '');
      MappingSteps.getTripleObjectValuePreview(1).should('contain', 'so');
      MappingSteps.getTripleObjectType(1).should('contain', 'IRI');
    });
  });

  context('Edit IRI', () => {
    it('Should have a warning message in IRI edit dialog when object has children', () => {
      cy.route('POST', '/rest/rdf-mapper/preview/ontorefine:123', 'fixture:edit-mapping/iri-with-children-model-preview-response.json');
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/iri-with-children-model.json').as('loadProject');
      // Given I have opened a model with triple containing IRI object with some children
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.getTriples().should('have.length', 3);
      // When I open edit dialog of the parent IRI object
      MappingSteps.editTripleObjectWithData(0);
      // Then I expect the edit dialog to be opened
      EditDialogSteps.getDialog().should('be.visible');
      // And there should be a warning message in the dialog
      EditDialogSteps.getWarningMessage().should('contain', 'Changing the type of this cell will delete all children');
      // When I change the IRI type and save configuration
      EditDialogSteps.selectLiteral();
      EditDialogSteps.saveConfiguration();
      // Then I expect the children to be removed
      MappingSteps.getTriples().should('have.length', 2);
      // When I open the edit dialog again
      MappingSteps.editTripleObjectWithData(0);
      // I expect the warning to be missing
      EditDialogSteps.getWarningMessage().should('not.be.visible');
    });

    it('Should populate the prefix properly if it is autocompleted in the edit dialog', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/prefix-autocomplete-mapping-model.json').as('loadProject');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:edit-mapping/namespaces-with-wine.json');
      cy.route('POST', '/repositories/Movies', 'fixture:edit-mapping/autocomplete-with-prefix-response.json');
      // Given I have opened a mapping with an IRI object
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.getTriples().should('have.length', 2);
      // When I open the object for edit
      MappingSteps.editTripleObjectWithData(0);
      // And I start to type a constant with a prefix
      EditDialogSteps.clearConstantValue();
      EditDialogSteps.getConstantField().should('be.empty');
      EditDialogSteps.getConstantField().type('wi');
      // And I select a suggested value
      cy.get('.mat-option').first().click();
      EditDialogSteps.getConstantField().should('have.value', 'http://www.ontotext.com/example/wine#Wine');
      // And I save configuration
      EditDialogSteps.saveConfiguration();
      // Then I expect the object to have the prefix properly populated
      MappingSteps.getTripleObjectValuePreview(0).should('contain', 'Wine');
      MappingSteps.getTripleObjectPropertyTransformation(0).should('contain', 'wine');
      // When I open the edit object dialog again
      MappingSteps.editTripleObjectWithData(0);
      // Then I expect constant and prefix to be set
      EditDialogSteps.getConstantField().should('have.value', 'Wine');
      EditDialogSteps.getTransformationExpressionField().should('have.value', 'wine');
    });
  });

  it('Should validate subject edit form', () => {
    PrepareSteps.stubEmptyMappingModel();
    PrepareSteps.visitPageAndWaitToLoad();
    // Given I have created a mapping column-type-constant
    MappingSteps.getTriples().should('have.length', 1);
    MappingSteps.completeTriple(0, '@duration', 'a', '123');
    MappingSteps.getTriples().should('have.length', 2);
    // When I edit the subject
    MappingSteps.editTripleSubject(0);
    // Then I expect the dialog to be opened
    EditDialogSteps.getDialog().should('be.visible');
    // And the OK button to be enabled
    EditDialogSteps.getOkButton().should('be.visible').and('be.enabled');
    // When I remove the column value
    EditDialogSteps.getColumnField().should('have.value', 'duration');
    EditDialogSteps.clearColumnValue();
    // Then I expect the OK button to become disabled because the column value is a mandatory field
    EditDialogSteps.getOkButton().should('be.visible').and('be.disabled');
  });

  // TODO: I add these tests here for now, but later we should distribute them in respective specs with the related operations
  context('Handle errors', () => {
    it('Should show error notification when model could not be loaded', () => {
      cy.route({
        method: 'GET',
        url: '/orefine/command/core/get-models/?project=123',
        status: 500,
        response: 'fixture:edit-mapping/load-mapping-error.json'
      }).as('loadProject');

      PrepareSteps.visitPageAndWaitToLoad();
      // I expect empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // And I expect notification message
      MappingSteps.getNotification().should('be.visible').and('contain', 'Failed to find project id #1 - may be corrupt (HTTP status 500)');
    });

    it('Should show error notification when namespaces could not be loaded', () => {
      PrepareSteps.stubEmptyMappingModel();
      cy.route({
        method: 'GET',
        url: '/repositories/Movies/namespaces',
        status: 404,
        response: 'fixture:edit-mapping/load-namespaces-error'
      });

      PrepareSteps.visitPageAndWaitToLoad();
      // I expect empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // And I expect notification message
      MappingSteps.getNotification().should('be.visible').and('contain', 'Unknown repository: Movies');
    });

    it('Should show error notification when columns could not be loaded', () => {
      PrepareSteps.stubEmptyMappingModel();
      cy.route({
        method: 'GET',
        url: '/rest/rdf-mapper/columns/ontorefine:123',
        status: 404,
        response: 'fixture:edit-mapping/load-columns-error'
      }).as('loadColumns');

      PrepareSteps.visitPageAndWaitToLoad();
      // I expect empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // And I expect notification message
      MappingSteps.getNotification().should('be.visible')
        .and('contain', 'Tabular data provider not found: ontorefine:2216295245917sd (HTTP status 404)');
    });

    it('Should show error notification when RDF generation fails', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:mapping-model.json').as('loadProject');
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
      PrepareSteps.visitPageAndWaitToLoad();
      // Then I expect to see a mapping with 2 triples (+1 empty row)
      MappingSteps.getTriples().should('have.length', 3);
      // When I click generate RDF button
      HeaderSteps.generateRdf();
      // Then I expect error notification
      MappingSteps.getNotification().should('be.visible')
        .and('contain', 'Tabular data provider not found: ontorefine:123 (HTTP status 404)');
    });

    it('Should show error notification when SPARQL generation fails', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:mapping-model.json').as('loadProject');
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
      PrepareSteps.visitPageAndWaitToLoad();
      // Then I expect to see a mapping with 2 triples (+1 empty row)
      MappingSteps.getTriples().should('have.length', 3);
      // When I click generate RDF button
      HeaderSteps.generateSparql();
      // Then I expect error notification
      MappingSteps.getNotification().should('be.visible')
        .and('contain', 'Tabular data provider not found: ontorefine:123 (HTTP status 404)');
    });

  });

  context('Preview GREL', () => {
    function mockPreview(response: string) {
      cy.route({
        method: 'POST',
        url: '/rest/rdf-mapper/grel/ontorefine:123?limit=10',
        status: 200,
        response,
        headers: {
          'Content-Type': 'application/json'
        }
      }).as('loadGrelPreview');
      PrepareSteps.stubEmptyMappingModel();
    }

    it('Should preview empty object', () => {
      mockPreview('["James Cameron","Gore Verbinski","Sam Mendes","Christopher Nolan"]');

      // When I load application
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.completeTriple(0, 'subject', 'predicate', undefined);
      MappingSteps.editEmptyTripleObject(0);
      EditDialogSteps.selectIri();
      EditDialogSteps.selectGREL();
      EditDialogSteps.completeGREL('cells["director_name"].value');
      EditDialogSteps.getGRELPreview().first().should('contain', 'James Cameron');
    });

    it('Should preview datatype expression properly', () => {
      mockPreview('["James Cameron","Gore Verbinski","Sam Mendes","Christopher Nolan"]');

      // When I load application
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.completeTriple(0, 'subject', 'predicate', '@director_name');
      MappingSteps.editTripleObjectWithData(0);
      EditDialogSteps.selectLiteral();
      EditDialogSteps.selectTypeDataTypeLiteral();
      EditDialogSteps.selectGREL();
      EditDialogSteps.completeGREL('cells["director_name"].value');
      EditDialogSteps.getGRELPreview().first().should('contain', 'James Cameron');
      EditDialogSteps.getTransformationExpressionField().blur();

      // Unfortunately cypress cannot return response based on POST data so mock twice the request
      mockPreview('["alabala"]');

      // Verify datatype GREL preview
      EditDialogSteps.selectDataTypeGREL();
      EditDialogSteps.completeDataTypeExpression('cells["director_name"].value');
      EditDialogSteps.getDataTypeGRELPreview().first().should('contain', 'alabala');
    });

    it('Should show GREL preview in a popover', () => {
      mockPreview('[null]');
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/grel-expression-edit-mapping-model.json').as('loadProject');
      // Given I have created and loaded a mapping
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.getTriples().should('have.length', 2);

      // Verify source GREL transformation preview

      // When I open the subject edit dialog and focus on source GREL field
      MappingSteps.editTripleSubject(0);
      EditDialogSteps.selectGREL();
      EditDialogSteps.getTransformationExpressionField().focus();
      // Then I expect a preview popover to appear which contains no preview message
      EditDialogSteps.getGRELPreview().first().should('contain', 'No GREL preview');
      // When I type in the field
      EditDialogSteps.completeGREL('cells["director_name"].v');
      // Then I expect to see the no preview message
      EditDialogSteps.getGRELPreview().first().should('contain', 'No GREL preview');
      // When I complete a valid GREL
      cy.wait('@loadGrelPreview');
      mockPreview('["James Cameron","Gore Verbinski","Sam Mendes","Christopher Nolan"]');
      EditDialogSteps.completeGREL('alue');
      // Then I expect preview results to be rendered in the popover
      EditDialogSteps.getGRELPreview().find('[appCypressData=grel-preview]')
        .should('have.length', 4).first().should('contain', 'James Cameron');
      // When There completed expression is invalid
      cy.wait('@loadGrelPreview');
      mockPreview('[{"error":"Parsing error at offset 6: Expecting something more at end of expression"},{"error":"Parsing error at offset 6: Expecting something more at end of expression"}]');
      EditDialogSteps.completeGREL('+');
      // Then I expect error message to appear in the popover
      EditDialogSteps.getGRELPreview().find('[appCypressData=grel-preview]')
        .should('have.length', 1).first().should('contain', 'Parsing error at offset 6: Expecting something more at end of expression');
      // When I complete a valid expression, close edit dialog and open it again
      cy.wait('@loadGrelPreview');
      mockPreview('["James Cameron","Gore Verbinski","Sam Mendes","Christopher Nolan"]');
      EditDialogSteps.clearGREL();
      EditDialogSteps.completeGREL('cells["director_name"].value');
      EditDialogSteps.saveConfiguration();
      MappingSteps.editTripleSubject(0);
      // Then I expect the grel preview to be properly loaded again
      EditDialogSteps.getTransformationExpressionField().focus();
      EditDialogSteps.getGRELPreview().find('[appCypressData=grel-preview]')
        .should('have.length', 4).first().should('contain', 'James Cameron');
      EditDialogSteps.saveConfiguration();

      // Verify language GREL transformation preview

      // When I open the subject edit dialog and focus on language GREL field
      mockPreview('[null]');
      MappingSteps.editTripleObjectWithData(0);
      EditDialogSteps.selectLanguageGREL();
      EditDialogSteps.getLanguageTransformationExpressionField().focus();
      // Then I expect a preview popover to appear which contains no preview message
      EditDialogSteps.getLanguageGRELPreview().first().should('contain', 'No GREL preview');
      // When I type in the field
      EditDialogSteps.completeLanguageGREL('cells["director_name"].v');
      // Then I expect to see the no preview message
      EditDialogSteps.getLanguageGRELPreview().first().should('contain', 'No GREL preview');
      // When I complete a valid GREL
      cy.wait('@loadGrelPreview');
      mockPreview('["James Cameron","Gore Verbinski","Sam Mendes","Christopher Nolan"]');
      EditDialogSteps.completeLanguageGREL('alue');
      // Then I expect preview results to be rendered in the popover
      EditDialogSteps.getLanguageGRELPreview().find('[appCypressData=language-grel-preview]')
        .should('have.length', 4).first().should('contain', 'James Cameron');
      // When There completed expression is invalid
      cy.wait('@loadGrelPreview');
      mockPreview('[{"error":"Parsing error at offset 6: Expecting something more at end of expression"},{"error":"Parsing error at offset 6: Expecting something more at end of expression"}]');
      EditDialogSteps.completeLanguageGREL('+');
      // Then I expect error message to appear in the popover
      EditDialogSteps.getLanguageGRELPreview().find('[appCypressData=language-grel-preview]')
        .should('have.length', 1).first().should('contain', 'Parsing error at offset 6: Expecting something more at end of expression');
      EditDialogSteps.clearLanguageGREL();
      // When I complete a valid expression, close edit dialog and open it again
      cy.wait('@loadGrelPreview');
      mockPreview('["James Cameron","Gore Verbinski","Sam Mendes","Christopher Nolan"]');
      EditDialogSteps.clearLanguageGREL();
      EditDialogSteps.completeLanguageGREL('cells["director_name"].value');
      EditDialogSteps.saveConfiguration();
      MappingSteps.editTripleObjectWithData(0);
      // Then I expect the grel preview to be properly loaded again
      EditDialogSteps.getLanguageTransformationExpressionField().focus();
      EditDialogSteps.getLanguageGRELPreview().find('[appCypressData=language-grel-preview]')
        .should('have.length', 4).first().should('contain', 'James Cameron');
      EditDialogSteps.saveConfiguration();

      // Verify datatype GREL transformation preview

      // When I open the subject edit dialog and focus on datatype GREL field
      mockPreview('[null]');
      MappingSteps.editTripleObjectWithData(0);
      EditDialogSteps.selectLiteral();
      EditDialogSteps.selectTypeDataTypeLiteral();
      EditDialogSteps.selectDataTypeGREL();
      EditDialogSteps.getDataTypeExpressionField().focus();
      // Then I expect a preview popover to appear which contains no preview message
      EditDialogSteps.getDataTypeGRELPreview().first().should('contain', 'No GREL preview');
      // When I type in the field
      EditDialogSteps.completeDataTypeExpression('cells["director_name"].v');
      // Then I expect to see the no preview message
      EditDialogSteps.getDataTypeGRELPreview().first().should('contain', 'No GREL preview');
      // When I complete a valid GREL
      cy.wait('@loadGrelPreview');
      mockPreview('["James Cameron","Gore Verbinski","Sam Mendes","Christopher Nolan"]');
      EditDialogSteps.completeDataTypeExpression('alue');
      // Then I expect preview results to be rendered in the popover
      EditDialogSteps.getDataTypeGRELPreview().find('[appCypressData=datatype-grel-preview]')
        .should('have.length', 4).first().should('contain', 'James Cameron');
      // When There completed expression is invalid
      cy.wait('@loadGrelPreview');
      mockPreview('[{"error":"Parsing error at offset 6: Expecting something more at end of expression"},{"error":"Parsing error at offset 6: Expecting something more at end of expression"}]');
      EditDialogSteps.completeDataTypeExpression('+');
      // Then I expect error message to appear in the popover
      EditDialogSteps.getDataTypeGRELPreview().find('[appCypressData=datatype-grel-preview]')
        .should('have.length', 1).first().should('contain', 'Parsing error at offset 6: Expecting something more at end of expression');
      // When I complete a valid expression, close edit dialog and open it again
      cy.wait('@loadGrelPreview');
      mockPreview('["James Cameron","Gore Verbinski","Sam Mendes","Christopher Nolan"]');
      EditDialogSteps.clearDataTypeExpression();
      EditDialogSteps.completeDataTypeExpression('cells["director_name"].value');
      EditDialogSteps.saveConfiguration();
      MappingSteps.editTripleObjectWithData(0);
      // Then I expect the grel preview to be properly loaded again
      EditDialogSteps.getDataTypeExpressionField().focus();
      EditDialogSteps.getDataTypeGRELPreview().find('[appCypressData=datatype-grel-preview]')
        .should('have.length', 4).first().should('contain', 'James Cameron');
      EditDialogSteps.saveConfiguration();
    });
  });

  context('Incomplete mapping', () => {
    it('Should not allow operations with incomplete mapping', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/incomplete-mapping-model.json').as('loadProject');

      // When I load application
      PrepareSteps.visitPageAndWaitToLoad();

      // WHEN:
      // I press Get JSON button
      HeaderSteps.getGetJSONButton().click();
      // THEN
      // I see error message
      assertNotAllowedNotification();

      // WHEN:
      // I press RDF button
      HeaderSteps.generateRdf();
      // THEN
      // I see error message
      assertNotAllowedNotification();

      // WHEN:
      // I press SPARQL button
      HeaderSteps.generateSparql();
      // THEN
      // I see error message
      assertNotAllowedNotification();

      // WHEN:
      // I press Preview button
      HeaderSteps.getPreviewButton().click();
      // THEN
      // I see error message
      assertNotAllowedNotification();

      // WHEN:
      // I press Both button
      HeaderSteps.getBothViewButton().click();
      // THEN
      // I see error message
      assertNotAllowedNotification();
    });

    it('Should keep preview after deletion', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/mapping-model.json').as('loadProject');;
      // When I load application
      PrepareSteps.visitPageAndWaitToLoad();
      // I switch to preview mode
      HeaderSteps.getPreviewButton().click();

      // WHEN
      // I delete the object
      MappingSteps.deleteTripleObject(0);
      MappingSteps.confirm();

      // THEN
      // Subject and predicate are in preview mode
      MappingSteps.getTripleSubject(0).should('contain', '<James%20Cameron>');
      MappingSteps.getTriplePredicate(0).should('contain', '<test>');
      MappingSteps.getTripleObject(0).should('have.length', 1);
    });
  });

  it('Should have links for IRIs in preview', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/preview-mapping-model.json').as('loadProject');
    cy.route('POST', '/rest/rdf-mapper/preview/ontorefine:123', 'fixture:edit-mapping/preview-response.json').as('loadPreview');

    // When I load a mapping containing all type mappings
    PrepareSteps.visitPageAndWaitToLoad();

    MappingSteps.getTriples().should('have.length', 4);
    // I switch to preview
    HeaderSteps.getPreviewButton().click();
    cy.wait('@loadPreview');
    // I see mapping preview
    // A constant IRI
    MappingSteps.getTripleSubjectPreview(0).contains('<constantIRI>');
    // Should be a link and uri should be baseURI + constant
    MappingSteps.getTripleSubjectPreview(0).find('a').should('have.attr', 'href')
        .and('contain', 'resource?uri=http://example/base/constantIRI');
    MappingSteps.getTriplePredicatePreview(0).contains('<pred>');
    MappingSteps.getTriplePredicatePreview(0).find('a').should('have.attr', 'href')
        .and('contain', 'resource?uri=http://example/base/pred');

    // A literal
    MappingSteps.getTripleObjectPreview(0).contains('"literalObj"');
    // Should not be a link
    MappingSteps.getTripleObjectPreview(0).find('a').should('not.be', 'visible');

    // A raw IRI that is not a URI
    MappingSteps.getTripleSubjectPreview(1).contains('<http://example/base/rawConstantIRI>');
    // Should be a link and uri should be baseURI + constant
    MappingSteps.getTripleSubjectPreview(1).find('a').should('have.attr', 'href')
        .and('contain', 'resource?uri=http://example/base/rawConstantIRI');

    // A type mapping ('a' or 'rdf:type')
    MappingSteps.getTriplePredicatePreview(1).contains('a');
    // Should not be a link
    MappingSteps.getTriplePredicatePreview(1).find('a').should('not.be', 'visible');

    MappingSteps.getTripleObjectPreview(1).contains('<constantIRI>');
    MappingSteps.getTripleObjectPreview(1).find('a').should('have.attr', 'href')
        .and('contain', 'resource?uri=http://example/base/constantIRI');

    // A raw IRI that is a URI
    MappingSteps.getTripleSubjectPreview(2).contains('<http://constant>');
    // Should be a link and URI should be it's own
    MappingSteps.getTripleSubjectPreview(2).find('a').should('have.attr', 'href')
        .and('contain', 'resource?uri=http://constant');

    MappingSteps.getTriplePredicatePreview(2).contains('a');
    MappingSteps.getTriplePredicatePreview(2).find('a').should('not.be', 'visible');

    // A prefixed constant
    MappingSteps.getTripleObjectPreview(2).contains('schema:Thing');
    // Should be a link and URI should have the namespace URI + constant
    MappingSteps.getTripleObjectPreview(2).find('a').should('have.attr', 'href')
        .and('contain', 'resource?uri=http://schema.org/Thing');
  });


  context('Edit and save', () => {
    it('Should save mapping and preserve preview', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/mapping-model-with-preview.json').as('loadProject');
      cy.route({
        method: 'POST',
        url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
        status: 200,
        delay: 1000
      }).as('saveMapping');
      // Given I have opened the application
      PrepareSteps.visitPageAndWaitToLoad();
      // When The mapping is loaded
      MappingSteps.getTriples().should('have.length', 7);
      // Then I expect the save button to be disabled
      HeaderSteps.getSaveMappingButton().should('be.disabled');
      // I delete a triple
      MappingSteps.deleteTriple(2);
      MappingSteps.confirm();
      // I delete a triple
      MappingSteps.deleteTriple(2);
      MappingSteps.confirm();
      // I switch to both preview
      HeaderSteps.getBothViewButton().click();
      // I see mapping preview
      MappingSteps.getTripleSubjectPreview(0).contains('<James%20Cameron>');
      MappingSteps.getTripleObjectPreview(0).contains('<person>');
      MappingSteps.getTriplePredicatePreview(1).contains('<test>');
      MappingSteps.getTripleObjectPreview(1).contains('<http%3A%2F%2Fwww.imdb.com%2Ftitle%2Ftt0499549%2F%3Fref_%3Dfn_tt_tt_1>');
      // And I save the mapping
      HeaderSteps.saveMapping();
      // And The mapping should be saved
      cy.fixture('create-mapping/save-mapping-request-body').then((saveResponse: string) => {
        cy.wait('@saveMapping');
        MappingSteps.getTripleSubjectPreview(0).contains('<James%20Cameron>');
        MappingSteps.getTripleObjectPreview(0).contains('person');
        MappingSteps.getTriplePredicatePreview(1).contains('test');
        MappingSteps.getTripleObjectPreview(1).contains('<http%3A%2F%2Fwww.imdb.com%2Ftitle%2Ftt0499549%2F%3Fref_%3Dfn_tt_tt_1>');
      });
    });

    it('Should mark empty mapping preview', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/mapping-model-with-preview.json').as('loadProject');

      // Given I have opened the application
      PrepareSteps.visitPageAndWaitToLoad();
      // When The mapping is loaded
      MappingSteps.getTriples().should('have.length', 7);

      // I delete a triple
      MappingSteps.deleteTriple(1);
      MappingSteps.confirm();

      // I switch to both preview
      HeaderSteps.getBothViewButton().click();
      // I see mapping preview with empty previews
      MappingSteps.getTripleSubjectPreview(0).contains('<James%20Cameron>')
      MappingSteps.getTriplePredicatePreview(0).contains('a');
      MappingSteps.getTripleObjectPreview(0).contains('<person>');
      MappingSteps.getTriplePredicatePreview(1).contains('testNoPreview');
      MappingSteps.getTripleObjectPreview(1).contains('empty');
      MappingSteps.getTriplePredicatePreview(2).contains('a');
      MappingSteps.getTripleObjectPreview(2).contains('empty');
      MappingSteps.getTriplePredicatePreview(3).contains('empty');
      MappingSteps.getTripleObjectPreview(3).contains('empty');

    });

    it('Should change object type and save it properly', () => {
      PrepareSteps.stubEmptyMappingModel();
      cy.route({
        method: 'POST',
        url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
        status: 200,
        delay: 1000,
        response: 'fixture:edit-mapping/save-mapping-success.json'
      }).as('saveMapping');
      // Given I have opened the application
      PrepareSteps.visitPageAndWaitToLoad();
      // I complete a tripple
      MappingSteps.completeTriple(0, 'sub', 'pred', 'obj');
      // I change to object to IRI
      MappingSteps.editTripleObjectWithData(0);
      EditDialogSteps.selectIri();
      EditDialogSteps.saveConfiguration();
      // Then I change the object to Datatype Literal
      MappingSteps.editTripleObjectWithData(0);
      EditDialogSteps.selectLiteral();
      EditDialogSteps.selectTypeDataTypeLiteral()
      EditDialogSteps.selectDataTypeConstant();
      EditDialogSteps.completeDataTypeConstant('con');
      EditDialogSteps.saveConfiguration();
      // WHEN I save the mapping
      HeaderSteps.saveMapping();

      // THEN I expect to send the right configuration
      cy.fixture('edit-mapping/save-mapping-request-body').then((saveResponse: string) => {
        cy.wait('@saveMapping');
        cy.get('@saveMapping').should((xhr: any) => {
          expect(xhr.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
          expect(xhr.method).to.equal('POST');
          expect(xhr.request.body).to.equal(saveResponse);
        });
      });

    });

  });

  context('Edit base IRI', () => {
    it('Should edit and save base IRI', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/base-iri-mapping-model.json').as('loadProject');
      cy.route({
        method: 'POST',
        url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
        status: 200,
        delay: 1000,
        response: 'fixture:edit-mapping/save-mapping-success.json'
      }).as('saveMapping');
      // Given I have loaded a mapping
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.getTriples().should('have.length', 2);
      // Then I expect the base IRI to be populated
      MappingSteps.getBaseIRI().should('have.value', 'http://example/base/');
      // When I edit the base IRI
      MappingSteps.getBaseIRI().type('123');
      MappingSteps.getBaseIRI().should('have.value', 'http://example/base/123');
      // And I save the mapping
      HeaderSteps.saveMapping();
      cy.fixture('edit-mapping/save-mapping-with-updated-iri-request-body').then((saveRequest: string) => {
        cy.wait('@saveMapping');
        cy.get('@saveMapping').should((xhr: any) => {
          expect(xhr.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
          expect(xhr.method).to.equal('POST');
          expect(xhr.request.body).to.equal(saveRequest);
        });
      });
      // Then I expect the base IRI to be set in the model properly and sent for save
      MappingSteps.getBaseIRI().should('have.value', 'http://example/base/123');
    });
  });

  context('Type mapping', () => {
    it('Should treat rdf:type as type mapping predicate when inline typing', () => {
      PrepareSteps.stubEmptyMappingModel();
      PrepareSteps.visitPageAndWaitToLoad();

      // WHEN I complete inline the triple with `rfd:type` predicate
      MappingSteps.completeTriple(0, 'sub', 'rdf:type', 'obj');
      // THEN
      // It is a type mapping triple
      MappingSteps.getTripleSubject(0).should('have.text', ' C  sub <IRI>');
      MappingSteps.getTriplePredicate(0).should('have.text', 'a<IRI>');
      MappingSteps.getTripleObject(0).should('have.text', ' C  obj <IRI>');
    });

    it('Should treat rdf:type as type mapping predicate when select it from autocomplete', () => {
      PrepareSteps.stubEmptyMappingModel();
      cy.route('POST', '/repositories/Movies', 'fixture:edit-mapping/autocomplete-rdf-type.json');
      PrepareSteps.visitPageAndWaitToLoad();

      MappingSteps.completeTriple(0, 's', undefined, undefined);
      MappingSteps.type('rdf:t', () => MappingSteps.getTriplePredicateValue(0));
      MappingSteps.getSuggestions().should('have.length', 1);
      MappingSteps.getSuggestions().first().should('contain', 'rdf:type').then((option) => {
        cy.wrap(option).trigger('click');
      });

      // THEN
      MappingSteps.getTriplePredicate(0).should('have.text', 'a<IRI>');
    });

    it('Should treat rdf:type as type mapping predicate in the edit mapping dialog', () => {
      PrepareSteps.stubEmptyMappingModel();
      PrepareSteps.visitPageAndWaitToLoad();
      // WHEN I complete the subject
      MappingSteps.completeTriple(0, 'sub', undefined, undefined);
      // And edit the predicate
      MappingSteps.editEmptyTriplePredicate(0);
      EditDialogSteps.selectConstant();
      EditDialogSteps.completeConstant('type');
      EditDialogSteps.completePrefix('rdf');
      EditDialogSteps.saveConfiguration();

      // THEN
      // It is a type mapping triple
      MappingSteps.getTriplePredicate(0).should('have.text', 'a<IRI>');
    });
  });
});

function assertNotAllowedNotification() {
  MappingSteps.getNotification().should('contain', 'The operation is not allowed. You have an incomplete mapping.');
  MappingSteps.getNotification().should('not.be.visible');
}
