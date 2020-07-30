import MappingSteps from '../steps/mapping-steps';
import HeaderSteps from '../steps/header-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';

describe('Edit mapping', () => {

  beforeEach(() => {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Movies');
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
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

  context('edit inline prefix', () => {
    beforeEach(() => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('POST', '/repositories/Movies', 'fixture:edit-mapping/autocomplete-response.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');
    });

    it('Should set prefix expression', () => {
      MappingSteps.getTriples().should('have.length', 1);
      // And I have created a subject, a predicate and an object
      MappingSteps.completeTriple(0, 'rdf:subject', 'rdf:@Title', 'rdf:$row_index');
      MappingSteps.getTripleSubjectPropertyTransformation(0).should('have.text', 'rdf');
      MappingSteps.getTripleSubjectSourceType(0).should('have.text', ' C ');
      MappingSteps.getTripleSubjectSource(0).should('have.text', ' C  subject ')

      MappingSteps.getTriplePredicatePropertyTransformation(0).should('have.text', 'rdf');
      MappingSteps.getTriplePredicateSourceType(0).should('have.text', ' @ ');
      MappingSteps.getTriplePredicateValuePreview(0).should('have.text', ' @  Title ')

      MappingSteps.getTripleObjectPropertyTransformation(0).should('have.text', 'rdf');
      MappingSteps.getTripleObjectSourceType(0).should('have.text', ' $ ');
      MappingSteps.getTripleObjectSource(0).should('have.text', ' $  row_index ')
    });

    it('Should set extended prefix expressions', () => {
      MappingSteps.getTriples().should('have.length', 1);
      // And I have created a subject, a predicate and an object
      MappingSteps.completeTriple(0, 'rdf:Actor@actor_1_name', 'rdf:Actor/@actor_1_name', 'rdf:Actor#@actor_1_name');
      MappingSteps.getTripleSubjectPropertyTransformation(0).should('have.text', 'rdf:Actor');
      MappingSteps.getTripleSubjectSourceType(0).should('have.text', ' @ ');
      MappingSteps.getTripleSubjectSource(0).should('have.text', ' @  actor_1_name ')

      MappingSteps.getTriplePredicatePropertyTransformation(0).should('have.text', 'rdf:Actor/');
      MappingSteps.getTriplePredicateSourceType(0).should('have.text', ' @ ');
      MappingSteps.getTriplePredicateValuePreview(0).should('have.text', ' @  actor_1_name ')

      MappingSteps.getTripleObjectPropertyTransformation(0).should('have.text', 'rdf:Actor#');
      MappingSteps.getTripleObjectSourceType(0).should('have.text', ' @ ');
      MappingSteps.getTripleObjectSource(0).should('have.text', ' @  actor_1_name ')
    });
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
    it('Should update JSON mapping when manipulating the mapping', () => {
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
      // When I click View JSON button
      HeaderSteps.viewJSON();
      // Then I expect to view JSON popup window
      MappingSteps.getViewJSONDialog().should('be.visible');
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
      // When I click View JSON button
      HeaderSteps.viewJSON();
      // Then I expect to view JSON popup window
      MappingSteps.getViewJSONDialog().should('be.visible').and('contain', 'datatype_literal');
    });
  });

  context('Preview GREL', () => {
    function mockPreview(response: string) {
      cy.route({
        method: 'POST',
        url: '/rest/rdf-mapper/grel/ontorefine:123?limit=10',
        status: 200,
        response: response,
        headers: {
          'Content-Type': 'application/json'
        }
      });
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

      // Unfortunately cypress cannot return response based on POST data so mock twice the request
      mockPreview('["alabala"]');

      // Verify datatype GREL preview
      EditDialogSteps.selectDataTypeConstant();
      EditDialogSteps.completeDataTypeConstant('foo');
      EditDialogSteps.selectDataTypeGREL();
      EditDialogSteps.completeDataTypeGREL('value');
      EditDialogSteps.getDataTypeGRELPreview().first().should('contain', 'alabala');
    });
  });


  context('incomplete mapping', () => {
    it('Should not allow operations with incomplete mapping', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:edit-mapping/incomplete-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');

      // When I load application
      cy.visit('?dataProviderID=ontorefine:123');

      // WHEN:
      // I press View JSON button
      HeaderSteps.viewJSON();
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
      HeaderSteps.getPreviewButton().click()

      //WHEN
      //I delete the object
      MappingSteps.deleteTripleObject(0);
      MappingSteps.confirm();

      //THEN
      // Subject and predicate are in preview mode
      MappingSteps.getTripleSubject(0).should('contain', '<James%20Cameron>');
      MappingSteps.getTriplePredicate(0).should('contain', '<test>');
      MappingSteps.getTripleObject(0).should('have.length',1);
    });
  });
});

function assertNotAllowedNotification() {
  MappingSteps.getNotification().should('contain', 'The operation is not allowed. You have an incomplete mapping.');
  MappingSteps.getNotification().should('not.be.visible')
}
