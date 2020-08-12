import MappingSteps from '../steps/mapping-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';

describe('Apply prefixes', () => {

  beforeEach(() => {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Movies');
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    cy.route('POST', '/repositories/Movies', 'fixture:apply-prefixes/autocomplete-response.json');
    cy.route('GET', '/rest/autocomplete/enabled', 'true');
  });

  context('add and remove prefix', () => {
    it('Should add and remove datatype prefix during edit', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:apply-prefixes/datatype-literal-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');

      // - Try with some non-empty prefix
      // Given I have loaded a mapping with datatype literal object
      MappingSteps.getTriples().should('have.length', 2);
      MappingSteps.getTripleObjectValueTransformation(0).should('not.be.visible');
      // When I set prefix from the edit dialog
      MappingSteps.editTripleObjectWithData(0);
      EditDialogSteps.selectDataTypePrefix();
      EditDialogSteps.completeDataTypeExpression('wine');
      EditDialogSteps.saveConfiguration();
      // Then I expect to see the prefix badge in the object cell
      MappingSteps.getTripleObjectValueTransformation(0).should('contain', 'wine');
      // When I open edit dialog again
      MappingSteps.editTripleObjectWithData(0);
      // Then I expect to see the selected prefix
      EditDialogSteps.getDatatypePrefixButton().should('be.visible').find('button').should('have.attr', 'aria-pressed', 'true');
      EditDialogSteps.getDataTypeExpressionField().should('have.value', 'wine');
      // When I remove the prefix
      EditDialogSteps.clearDataTypeExpression();
      EditDialogSteps.saveConfiguration();
      // Then I expect the prefix to not be visible in the object cell
      MappingSteps.getTripleObjectValueTransformation(0).should('not.be.visible');

      // - Try with the empty prefix
      // When I set the empty prefix
      MappingSteps.editTripleObjectWithData(0);
      EditDialogSteps.selectDataTypePrefix();
      EditDialogSteps.completeDataTypeExpression(':');
      EditDialogSteps.saveConfiguration();
      // Then I expect to see the empty prefix sign ":" in the object cell
      MappingSteps.getTripleObjectValueTransformation(0).should('contain', ':');
      // When I open the edit dialog
      MappingSteps.editTripleObjectWithData(0);
      // Then I expect to see the empty prefix in the prefix field
      EditDialogSteps.getDatatypePrefixButton().should('be.visible').find('button').should('have.attr', 'aria-pressed', 'true');
      EditDialogSteps.getDataTypeExpressionField().should('have.value', ':');
      // When I remove the prefix
      EditDialogSteps.clearDataTypeExpression();
      EditDialogSteps.saveConfiguration();
      // Then I expect the prefix badge to not be visible
      MappingSteps.getTripleObjectValueTransformation(0).should('not.be.visible');
      // When I open the edit dialog again
      MappingSteps.editTripleObjectWithData(0);
      // Then I expect the prefix button to be deselected
      EditDialogSteps.getDatatypePrefixButton().should('be.visible').find('button').should('have.attr', 'aria-pressed', 'false');
    });

    it('Should add and remove property prefix during edit', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:apply-prefixes/iri-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');

      // - Try with some non-empty prefix
      // Given I have loaded a mapping with IRI object
      MappingSteps.getTriples().should('have.length', 2);
      MappingSteps.getTripleObjectPropertyTransformation(0).should('not.be.visible');
      // When I set prefix from the edit dialog
      MappingSteps.editTripleObjectWithData(0);
      EditDialogSteps.selectPrefix();
      EditDialogSteps.completePrefix('wine');
      EditDialogSteps.saveConfiguration();
      // Then I expect to see the prefix badge in the object cell
      MappingSteps.getTripleObjectPropertyTransformation(0).should('contain', 'wine');
      // When I open edit dialog again
      MappingSteps.editTripleObjectWithData(0);
      // Then I expect to see the selected prefix
      EditDialogSteps.getPrefixTransformationButton().should('be.visible').find('button').should('have.attr', 'aria-pressed', 'true');
      EditDialogSteps.getTransformationExpressionField().should('have.value', 'wine');
      // When I remove the prefix
      EditDialogSteps.clearPrefix();
      EditDialogSteps.saveConfiguration();
      // Then I expect the prefix to not be visible in the object cell
      MappingSteps.getTripleObjectPropertyTransformation(0).should('not.be.visible');

      // - Try with the empty prefix
      // When I set the empty prefix
      MappingSteps.editTripleObjectWithData(0);
      EditDialogSteps.selectPrefix();
      EditDialogSteps.completePrefix(':');
      EditDialogSteps.saveConfiguration();
      // Then I expect to see the empty prefix sign ":" in the object cell
      MappingSteps.getTripleObjectPropertyTransformation(0).should('contain', ':');
      // When I open the edit dialog
      MappingSteps.editTripleObjectWithData(0);
      // Then I expect to see the empty prefix in the prefix field
      EditDialogSteps.getPrefixTransformationButton().should('be.visible').find('button').should('have.attr', 'aria-pressed', 'true');
      EditDialogSteps.getTransformationExpressionField().should('have.value', ':');
      // When I remove the prefix
      EditDialogSteps.clearPrefix();
      EditDialogSteps.saveConfiguration();
      // Then I expect the prefix badge to not be visible
      MappingSteps.getTripleObjectPropertyTransformation(0).should('not.be.visible');
      // When I open the edit dialog again
      MappingSteps.editTripleObjectWithData(0);
      // Then I expect the prefix button to be deselected
      EditDialogSteps.getPrefixTransformationButton().should('be.visible').find('button').should('have.attr', 'aria-pressed', 'false');
    });
  });

  context('edit inline prefix', () => {
    beforeEach(() => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
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
      MappingSteps.getTripleSubjectSource(0).should('have.text', ' C  subject ');

      MappingSteps.getTriplePredicatePropertyTransformation(0).should('have.text', 'rdf');
      MappingSteps.getTriplePredicateSourceType(0).should('have.text', ' @ ');
      MappingSteps.getTriplePredicateValuePreview(0).should('have.text', ' @  Title ');

      MappingSteps.getTripleObjectPropertyTransformation(0).should('have.text', 'rdf');
      MappingSteps.getTripleObjectSourceType(0).should('have.text', ' $ ');
      MappingSteps.getTripleObjectSource(0).should('have.text', ' $  row_index ');
    });

    it('Should set extended prefix expressions', () => {
      MappingSteps.getTriples().should('have.length', 1);
      // And I have created a subject, a predicate and an object
      MappingSteps.completeTriple(0, 'rdf:Actor@actor_1_name', 'rdf:Actor/@actor_1_name', 'rdf:Actor#@actor_1_name');
      MappingSteps.getTripleSubjectPropertyTransformation(0).should('have.text', 'rdf:Actor');
      MappingSteps.getTripleSubjectSourceType(0).should('have.text', ' @ ');
      MappingSteps.getTripleSubjectSource(0).should('have.text', ' @  actor_1_name ');

      MappingSteps.getTriplePredicatePropertyTransformation(0).should('have.text', 'rdf:Actor/');
      MappingSteps.getTriplePredicateSourceType(0).should('have.text', ' @ ');
      MappingSteps.getTriplePredicateValuePreview(0).should('have.text', ' @  actor_1_name ');

      MappingSteps.getTripleObjectPropertyTransformation(0).should('have.text', 'rdf:Actor#');
      MappingSteps.getTripleObjectSourceType(0).should('have.text', ' @ ');
      MappingSteps.getTripleObjectSource(0).should('have.text', ' @  actor_1_name ');
    });

    it('Should show error on unrecognized prefix', () => {
      MappingSteps.getTriples().should('have.length', 1);
      // And I have created a subject, a predicate and an object
      MappingSteps.completeTriple(0, 'rdf:Actor$row_index', 'rdf:Actor2#@actor_1_name', 'www:Actor/actor_1_name');
      MappingSteps.getNotification().should('be.visible').and('contain', 'Unrecognized prefix');
      MappingSteps.getNamespace('www').should('not.be.visible');
    });
  });
});