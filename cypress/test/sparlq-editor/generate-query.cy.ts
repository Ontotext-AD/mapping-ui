import NotificationSteps from '../../steps/notification-steps';
import PrepareSteps from '../../steps/prepare-steps';
import SparqlEditorSteps, {QueryOption} from '../../steps/sparql-editor-steps';

/**
 * Executes straightforward test case, where everything is working as expected. 
 * 
 * @param queryType the type of the query template that should be generated
 * @param expectedFile the file containing the expected SPARQL query result
 */
function executeStraightforwardTest(queryType: QueryOption, expectedFile: string): void {
  PrepareSteps.prepareQueriesGenerationResponses();

  // Open SPARQL editor
  PrepareSteps.visitPageAndOpenSparqlEditor();

  // Open Generate Query Menu
  SparqlEditorSteps.clickGenerateQuery();

  // Select template option
  SparqlEditorSteps.clickQueryMenuOption(queryType);

  // New editor tab was opened
  SparqlEditorSteps.getActiveTabElement().should(($elem) => {
    expect($elem.first()).to.contain('Generated 1');
  });

  // And the content in it, is as expected
  cy.fixture(expectedFile).then((expected) => {
    SparqlEditorSteps.getActiveTabContent().then((query) => {
      expect(expected).to.be.equal(query);
    });
  });
}

function executeErrorCaseTest(errorExpectedToContain: string): void {
  // Open SPARQL editor
  PrepareSteps.visitPageAndOpenSparqlEditor();

  // Open Generate Query Menu
  SparqlEditorSteps.clickGenerateQuery();

  // Select template option
  SparqlEditorSteps.clickQueryMenuOption('standard');

  // The editor should remain on the initial tab
  SparqlEditorSteps.getActiveTabElement().should(($elem) => {
    expect($elem.first()).to.contain('Unnamed');
  });

  // There should be an error message
  NotificationSteps.getErrorNotificationContent().should(($elem) => {
    expect($elem).to.contain(errorExpectedToContain);
  })
}

describe('SPARQL Query Editor: Generate Query', () => {

  beforeEach(() => {
    PrepareSteps.prepareRestaurantsNamespacesAndColumns();
    PrepareSteps.stubEmptyMappingModel();
    PrepareSteps.prepareEmptyEditorConfigurations();
  });

  context('Standard Queries Templates', () => {

    it('Should generate SELECT query based on the project data columns', () => {
      executeStraightforwardTest('standard', 'sparql-editor/standard-query-generation');
    });

    it('Should generate SELECT query with SERVICE clause based on the project data columns', () => {
      executeStraightforwardTest(
        'standard-with-service',
        'sparql-editor/standard-with-service-query-generation');
    });
  });

  context('From Mapping Query Templates', () => {

    it('Should generate CONSTRUCT query based on mapping defined in Visual RDF Mapper', () => {
      executeStraightforwardTest('mapping-based', 'sparql-editor/mapping-based-query-generation');
    });

    it('Should generate CONSTRUCT query with SERVICE clause based on mapping defined in Visual RDF Mapper', () => {
      executeStraightforwardTest(
        'mapping-based-with-service',
        'sparql-editor/mapping-based-with-service-query-generation');
    });
  });

  context('Error cases', () => {

    it('Should receive an error message when there is an error on the server.', () => {
      cy.intercept('GET', '/rest/sparql-mapper/query?project=ontorefine:123&type=standard', {
        statusCode: 500
      });

      executeErrorCaseTest('500 Internal Server Error');
    });

    it('Should receive an error message when the endpoint is not found.', () => {
      cy.intercept('GET', '/rest/sparql-mapper/query?project=ontorefine:123&type=standard', {
        statusCode: 404
      });

      executeErrorCaseTest('404 Not Found');
    });
  });
});
