import MappingSteps from '../steps/mapping-steps';
import HeaderSteps from '../steps/header-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';

describe('Edit mapping', () => {

  beforeEach(() => {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Movies');
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    cy.route('POST', '/repositories/Movies', 'fixture:edit-mapping/autocomplete-response.json');
    cy.route('GET', '/rest/autocomplete/enabled', 'true');
  });

  context('Edit and close dialog with hotkeys', () => {
    it('Should open and close the edit dialog with a hotkey', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      // Given I have opened an empty mapping
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');
      MappingSteps.getTriples().should('have.length', 1);
      // When I focus the first triple's subject and execute ctrl+enter key combination
      // Add some wait here to prevent finding the input in detached state
      MappingSteps.getTripleSubjectValue(0).wait(200).focus().type('{ctrl}{enter}', {
        parseSpecialCharSequences: true
      });
      // Then I expect the subject edit dialog to be opened
      EditDialogSteps.getDialogTitle().should('contain', 'Subject mapping');
      // When I complete the form
      EditDialogSteps.selectConstant();
      EditDialogSteps.completeConstant('1');
      // And execute ctrl+enter key combination while dialog is opened
      EditDialogSteps.getPrefixTransformationButton().focus().type('{ctrl}{enter}', {
        parseSpecialCharSequences: true
      });
      // Then I expect subject mapping configuration to be saved
      MappingSteps.getTripleSubjectValuePreview(0).should('contain', '1');
      MappingSteps.getTripleSubjectSourceType(0).should('contain', 'C');
    });
  });

  context('Edit IRI', () => {
    it('Should have a warning message in IRI edit dialog when object has children', () => {
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('POST', '/repositories/Movies', 'fixture:edit-mapping/autocomplete-response.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
      cy.route('POST', '/rest/rdf-mapper/preview/ontorefine:123', 'fixture:edit-mapping/iri-with-children-model-preview-response.json');
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/iri-with-children-model.json');
      // Given I have opened a model with triple containing IRI object with some children
      cy.visit('?dataProviderID=ontorefine:123');
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

    it('Should set populate the prefix properly if it is autocompleted in the edit dialog', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/prefix-autocomplete-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:edit-mapping/namespaces-with-wine.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.route('POST', '/repositories/Movies', 'fixture:edit-mapping/autocomplete-with-prefix-response.json');
      // Given I have opened a mapping with an IRI object
      cy.visit('?dataProviderID=ontorefine:123');
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
      EditDialogSteps.getPrefixTransformationButton().should('be.visible').find('button').should('have.attr', 'aria-pressed', 'true');
      EditDialogSteps.getTransformationExpressionField().should('have.value', 'wine');
    });
  });

  it('Should validate subject edit form', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('POST', '/repositories/Movies', 'fixture:edit-mapping/autocomplete-response.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');
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

  context('Update JSON mapping', () => {
    it('Should not update JSON mapping when the mapping is not manipulated', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
      cy.route({
        method: 'POST',
        url: '/rest/rdf-mapper/preview/ontorefine:123',
        status: 200,
        response: 'fixture:edit-mapping/simple-mapping-model.json',
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
      cy.fixture('edit-mapping/update-mapping1.json').then(updated => {
        HeaderSteps.getJSON().should("deep.equal", updated);
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
      cy.fixture('edit-mapping/update-mapping2.json').then(updated => {
        HeaderSteps.getJSON().should("deep.equal", updated);
      });
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
    }

    it('Should preview empty object', () => {
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');

      mockPreview('["James Cameron","Gore Verbinski","Sam Mendes","Christopher Nolan"]');

      // When I load application
      cy.visit('?dataProviderID=ontorefine:123');
      MappingSteps.completeTriple(0, 'subject', 'predicate', undefined);
      MappingSteps.editTripleObject(0);
      EditDialogSteps.selectIri();
      EditDialogSteps.selectColumn();
      EditDialogSteps.completeColumn('director_name');
      EditDialogSteps.selectGREL();
      EditDialogSteps.completeGREL('value');
      EditDialogSteps.getGRELPreview().first().should('contain', 'James Cameron');
    });

    it('Should preview datatype expression properly', () => {
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
      mockPreview('["James Cameron","Gore Verbinski","Sam Mendes","Christopher Nolan"]');

      // When I load application
      cy.visit('?dataProviderID=ontorefine:123');
      MappingSteps.completeTriple(0, 'subject', 'predicate', '@director_name');
      MappingSteps.editTripleObjectWithData(0);
      EditDialogSteps.selectTypeDataTypeLiteral();
      EditDialogSteps.selectGREL();
      EditDialogSteps.completeGREL('value');
      EditDialogSteps.getGRELPreview().first().should('contain', 'James Cameron');
      EditDialogSteps.getTransformationExpressionField().blur();

      // Unfortunately cypress cannot return response based on POST data so mock twice the request
      mockPreview('["alabala"]');

      // Verify datatype GREL preview
      EditDialogSteps.selectDataTypeConstant();
      EditDialogSteps.completeDataTypeConstant('foo');
      EditDialogSteps.selectDataTypeGREL();
      EditDialogSteps.completeDataTypeExpression('value');
      EditDialogSteps.getDataTypeGRELPreview().first().should('contain', 'alabala');
    });

    it('Should show GREL preview in a popover', () => {
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/grel-expression-edit-mapping-model.json');
      mockPreview('[null]');
      // Given I have created and loaded a mapping
      cy.visit('?dataProviderID=ontorefine:123');
      MappingSteps.getTriples().should('have.length', 2);

      // Verify source GREL transformation preview

      // When I open the subject edit dialog and focus on source GREL field
      MappingSteps.editTripleSubject(0);
      EditDialogSteps.selectGREL();
      EditDialogSteps.getTransformationExpressionField().focus();
      // Then I expect a preview popover to appear which contains no preview message
      EditDialogSteps.getGRELPreview().first().should('contain', 'No GREL preview');
      // When I type in the field
      EditDialogSteps.completeGREL('v');
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
      EditDialogSteps.completeGREL('value');
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
      EditDialogSteps.completeLanguageGREL('v');
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
      EditDialogSteps.completeLanguageGREL('value');
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
      EditDialogSteps.selectTypeDataTypeLiteral();
      EditDialogSteps.selectSourceTypeColumn();
      EditDialogSteps.completeSourceTypeColumn('director_name');
      EditDialogSteps.selectDataTypeGREL();
      EditDialogSteps.getDataTypeExpressionField().focus();
      // Then I expect a preview popover to appear which contains no preview message
      EditDialogSteps.getDataTypeGRELPreview().first().should('contain', 'No GREL preview');
      // When I type in the field
      EditDialogSteps.completeDataTypeExpression('v');
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
      EditDialogSteps.completeDataTypeExpression('value');
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
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/incomplete-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');

      // When I load application
      cy.visit('?dataProviderID=ontorefine:123');

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
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');

      // When I load application
      cy.visit('?dataProviderID=ontorefine:123');
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

  context('Edit and save', () => {
    it('Should save mapping and preserve preview', () => {
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('POST', '/repositories/Movies', 'fixture:create-mapping/autocomplete-response.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/mapping-model-with-preview.json');
      cy.route({
        method: 'POST',
        url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
        status: 200,
        delay: 1000
      }).as('saveMapping');
      // Given I have opened the application
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');
      // When The mapping is loaded
      MappingSteps.getTriples().should('have.length', 4);
      // Then I expect the save button to be disabled
      HeaderSteps.getSaveMappingButton().should('be.disabled');
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

    it('Should change object type and save it properly', () => {
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('POST', '/repositories/Movies', 'fixture:create-mapping/autocomplete-response.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route({
        method: 'POST',
        url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
        status: 200,
        delay: 1000,
        response: 'fixture:edit-mapping/save-mapping-success.json'
      }).as('saveMapping');
      // Given I have opened the application
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');
      // I complete a tripple
      MappingSteps.completeTriple(0, 'sub', 'pred', 'obj');
      // I change to object to IRI
      MappingSteps.editTripleObjectWithData(0);
      EditDialogSteps.selectIri();
      EditDialogSteps.saveConfiguration();
      // Then I change the object to Datatype Literal
      MappingSteps.editTripleObjectWithData(0);
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
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/base-iri-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.route({
        method: 'POST',
        url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
        status: 200,
        delay: 1000,
        response: 'fixture:edit-mapping/save-mapping-success.json'
      }).as('saveMapping');
      // Given I have loaded a mapping
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');
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

  context('Edit namespaces', () => {
    it('Should make the mapping dirty when namespaces are added', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/base-iri-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.route({
        method: 'POST',
        url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
        status: 200,
        delay: 1000,
        response: 'fixture:edit-mapping/save-mapping-success.json'
      }).as('saveMapping');

      // Given I have loaded a mapping
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');
      MappingSteps.getTriples().should('have.length', 2);
      HeaderSteps.getSaveMappingButton().should('be.disabled');
      // I expect to see some default namespaces
      MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
      MappingSteps.getNamespace('rdf').should('be.visible');
      // When I add a new namespace
      MappingSteps.addNamespace('ga=http://google/namespace');
      MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 2);
      MappingSteps.getNamespace('ga').should('be.visible');
      // Then I expect the mapping to become dirty
      HeaderSteps.getDirtyMappingBanner().should('contain', 'Mapping has unsaved changes');
      HeaderSteps.getSaveMappingButton().should('be.enabled');
      // When I save the mapping
      HeaderSteps.saveMapping();
      // Then I expect the updated namespaces to be sent for save
      cy.fixture('edit-mapping/save-mapping-with-new-namespace-request-body').then((saveRequest: string) => {
        cy.wait('@saveMapping');
        cy.get('@saveMapping').should((xhr: any) => {
          expect(xhr.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
          expect(xhr.method).to.equal('POST');
          expect(xhr.request.body).to.equal(saveRequest);
        });
      });
      HeaderSteps.getSaveMappingButton().should('be.disabled');
    });

    it('Should make the mapping dirty when namespaces are removed', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/custom-namespace-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.route({
        method: 'POST',
        url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
        status: 200,
        delay: 1000,
        response: 'fixture:edit-mapping/save-mapping-success.json'
      }).as('saveMapping');

      // Given I have loaded a mapping
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');
      MappingSteps.getTriples().should('have.length', 2);
      HeaderSteps.getSaveMappingButton().should('be.disabled');
      // I expect to see some default namespaces
      MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 2);
      MappingSteps.getNamespace('rdf').should('be.visible');
      MappingSteps.getNamespace('ga').should('be.visible');
      // When I remove a some namespace
      MappingSteps.removeNamespace('rdf');
      MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
      MappingSteps.getNamespace('ga').should('be.visible');
      // Then I expect the mapping to become dirty
      HeaderSteps.getDirtyMappingBanner().should('contain', 'Mapping has unsaved changes');
      HeaderSteps.getSaveMappingButton().should('be.enabled');
      // When I save the mapping
      HeaderSteps.saveMapping();
      // Then I expect the updated namespaces to be sent for save
      cy.fixture('edit-mapping/save-mapping-with-removed-namespace-request-body').then((saveRequest: string) => {
        cy.wait('@saveMapping');
        cy.get('@saveMapping').should((xhr: any) => {
          expect(xhr.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
          expect(xhr.method).to.equal('POST');
          expect(xhr.request.body).to.equal(saveRequest);
        });
      });
      HeaderSteps.getSaveMappingButton().should('be.disabled');
    });

    it('Should edit namespace', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/custom-namespace-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.route({
        method: 'POST',
        url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
        status: 200,
        delay: 1000,
        response: 'fixture:edit-mapping/save-mapping-success.json'
      }).as('saveMapping');

      // Given I have loaded a mapping
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');
      MappingSteps.getTriples().should('have.length', 2);
      // When I click over a namespace
      MappingSteps.getNamespace('ga').click();
      // Then I expect the namespace value to be visible in the field
      MappingSteps.getNamespaceField().should('have.value', 'ga=http://google/namespace');
      // When I change the namespace value
      MappingSteps.editNamespace('ga', 'ga=http://google/namespace/123');
      // Then I expect the namespace to be updated
      MappingSteps.getNamespace('ga').click();
      MappingSteps.getNamespaceField().should('have.value', 'ga=http://google/namespace/123');
      // And the mapping to become dirty
      HeaderSteps.getDirtyMappingBanner().should('contain', 'Mapping has unsaved changes');
      HeaderSteps.getSaveMappingButton().should('be.enabled');
      // When I save the mapping
      HeaderSteps.saveMapping();
      // Then I expect the changed namespace to be sent for saving
      cy.fixture('edit-mapping/save-mapping-with-updated-namespace-request-body').then((saveRequest: string) => {
        cy.wait('@saveMapping');
        cy.get('@saveMapping').should((xhr: any) => {
          expect(xhr.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
          expect(xhr.method).to.equal('POST');
          expect(xhr.request.body).to.equal(saveRequest);
        });
      });
      HeaderSteps.getSaveMappingButton().should('be.disabled');
    });

    it('Should validate namespaces when added', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/base-iri-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');

      // Given I have loaded a mapping
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');
      // When I add a new namespace without equal sign
      MappingSteps.addNamespace('ga-http://google/namespace');
      // THEN I expect to see error
      MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
      MappingSteps.getNamespace('ga').should('not.be.visible');
      MappingSteps.getNamespaceValidationError().should('be.visible');

      // I clear the namespace
      MappingSteps.clearNamespace();
      MappingSteps.getNamespaceValidationError().should('not.be.visible');

      // When I add a prefix with colon inside
      MappingSteps.addNamespace('ga:=http://google/namespace');
      // THEN I expect to see error
      MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
      MappingSteps.getNamespace('ga').should('not.be.visible');
      MappingSteps.getNamespaceValidationError().should('be.visible');

      // I clear the namespace
      MappingSteps.clearNamespace();
      MappingSteps.getNamespaceValidationError().should('not.be.visible');

      // When I add a prefix with blank namespace
      MappingSteps.addNamespace('ga=');
      // THEN I expect to see error
      MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
      MappingSteps.getNamespace('ga').should('not.be.visible');
      MappingSteps.getNamespaceValidationError().should('be.visible');
    });
  });

  context('type mapping', () => {
    it('Should treat rdf:type as type mapping predicate when inline typing', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');

      // WHEN I complete inline the triple with `rfd:type` predicate
      MappingSteps.completeTriple(0, 'sub', 'rdf:type', 'obj');
      // THEN
      // It is a type mapping triple
      MappingSteps.getTripleSubject(0).should('have.text', ' C  sub IRI');
      MappingSteps.getTriplePredicate(0).should('have.text', 'aIRI');
      MappingSteps.getTripleObject(0).should('have.text', ' C  obj IRI');
    });

    it('Should treat rdf:type as type mapping predicate in the edit mapping dialog', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');

      // WHEN I complete the subject
      MappingSteps.completeTriple(0, 'sub', undefined, undefined);
      // And edit the predicate
      MappingSteps.editEmptyTriplePredicate(0);
      EditDialogSteps.selectConstant();
      EditDialogSteps.completeConstant('type');
      EditDialogSteps.selectPrefix();
      EditDialogSteps.completePrefix('rdf');
      EditDialogSteps.saveConfiguration();

      // THEN
      // It is a type mapping triple
      MappingSteps.getTriplePredicate(0).should('have.text', 'aIRI');
    });
  });
});

function assertNotAllowedNotification() {
  MappingSteps.getNotification().should('contain', 'The operation is not allowed. You have an incomplete mapping.');
  MappingSteps.getNotification().should('not.be.visible');
}
