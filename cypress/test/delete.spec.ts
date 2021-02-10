import MappingSteps from '../steps/mapping-steps';
import HeaderSteps from '../steps/header-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';
import PrepareSteps from '../steps/prepare-steps';

describe('Delete', () => {

  beforeEach(() => {
    PrepareSteps.prepareMoviesNamespacesAndColumns();
    PrepareSteps.enableAutocompleteWithEmptyResponse();
  });

  context('parent', () => {
    function stubServicesAndVisit() {
      PrepareSteps.stubEmptyMappingModel();
      PrepareSteps.visitPageAndWaitToLoad();
    }

    it('Should be able to delete a subject with a predicate and have a warning', () => {
      stubServicesAndVisit();
      // Given I have opened an empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // And I have created a subject and a predicate
      MappingSteps.completeTriple(0, 'sub', 'pre');
      MappingSteps.verifyTriple(0, 'sub', 'pre', '');
      // When I try to delete the subject
      MappingSteps.deleteTripleSubject(0);
      // Then I expect a warning
      MappingSteps.getConfirmationMessage().should('contain', 'This mapping has children. If you delete it, all its children will be removed. Do you want to remove this mapping?');
      MappingSteps.confirm();
      MappingSteps.getTriples().should('have.length', 1);
      MappingSteps.verifyTriple(0, '', '', '');
    });

    it('Should be able to delete a predicate with an object and have a warning', () => {
      stubServicesAndVisit();
      // Given I have opened an empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // And I have created a subject, predicate and an object
      MappingSteps.completeTriple(0, 'sub', 'pre', 'obj');
      MappingSteps.verifyTriple(0, 'sub', 'pre', 'obj');
      // When I try to delete the predicate
      MappingSteps.deleteTriplePredicate(0);
      // Then I expect a warning
      MappingSteps.getConfirmationMessage().should('contain', 'This mapping has children. If you delete it, all its children will be removed. Do you want to remove this mapping?');
      MappingSteps.confirm();
      MappingSteps.getTriples().should('have.length', 1);
      MappingSteps.verifyTriple(0, 'sub', '', '');
    });

    it('Should be able to delete an object with nested triples and have a warning', () => {
      stubServicesAndVisit();
      // Given I have opened an empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // And I have created a triple
      MappingSteps.completeTriple(0, 'sub', 'pre');
      MappingSteps.editEmptyTripleObject(0);
      EditDialogSteps.getDialog().should('be.visible');
      EditDialogSteps.selectIri();
      EditDialogSteps.selectConstant();
      EditDialogSteps.completeConstant('iri value');
      EditDialogSteps.saveConfiguration();
      MappingSteps.verifyTriple(0, 'sub', 'pre', 'iri value');
      // And a nested triple
      MappingSteps.addNestedTriple(0);
      MappingSteps.completePredicate(1, 'pre2');
      MappingSteps.getTriples().should('have.length', 3);
      MappingSteps.completeObject(1, 'obj2');
      MappingSteps.getTriplePredicateValuePreview(1).should('contain', 'pre2');
      MappingSteps.getTripleObjectValuePreview(1).should('contain', 'obj2');
      // When I delete the object for the parent triple
      MappingSteps.deleteTripleObject(0);
      // Then I expect warning
      MappingSteps.getConfirmationMessage().should('contain', 'This mapping has children. If you delete it, all its children will be removed. Do you want to remove this mapping?');
      MappingSteps.confirm();
      MappingSteps.getTriples().should('have.length', 1);
      MappingSteps.verifyTriple(0, 'sub', 'pre', '');
    });

    it('Should be able to delete a triple with children and have a warning', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete/triple-with-children-mapping-model.json').as('loadProject');
      PrepareSteps.visitPageAndWaitToLoad();
      // Given I have opened a mapping which contains triple with children
      MappingSteps.getTriples().should('have.length', 4);
      // When I try to delete a nested triple which doesn't have children
      MappingSteps.deleteTriple(2);
      // Then I expect confirmation with the default warning
      MappingSteps.getConfirmationMessage().should('contain', 'Do you want to remove this mapping?');
      MappingSteps.reject();
      // When I try to delete a nested triple which has children
      MappingSteps.deleteTriple(1);
      // Then I expect confirmation with warning for triple with children deletion
      MappingSteps.getConfirmationMessage().should('contain', 'This mapping has children. If you delete it, all its children will be removed. Do you want to remove this mapping?');
      MappingSteps.reject();
      // When I try to delete a nested triple which has children
      MappingSteps.deleteTriple(0);
      // Then I expect confirmation with warning for triple with children deletion
      MappingSteps.getConfirmationMessage().should('contain', 'Do you want to remove this mapping?');
      MappingSteps.reject();
    });
  });

  context('triple', () => {
    it('Should be able to delete nested triple', () => {
      // stub model
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete/mapping-model.json').as('loadProject');

      // Given I have opened the mapping UI and waited to load the data
      PrepareSteps.visitPageAndWaitToLoad();
      // And I see two triples + one empty template
      MappingSteps.getTriples().should('have.length', 3);

      // Delete and reject operation
      // When I try to delete the nested triple
      MappingSteps.deleteTriple(1);
      // Then I expect confirmation
      MappingSteps.getConfirmationMessage().should('contain', 'Do you want to remove this mapping?');
      // When I deny confirmation
      MappingSteps.reject();
      // I expect same triples in the mapping
      MappingSteps.getTriples().should('have.length', 3);

      // Delete completed nested triple
      // When I delete the nested triple
      MappingSteps.deleteTriple(1);
      MappingSteps.confirm();
      // Then I expect the triple to be deleted
      MappingSteps.getTriples().should('have.length', 2);
      MappingSteps.getTripleSubjectSource(0).should('contain', 'director_name');
      MappingSteps.getTripleObjectType(0).should('contain', 'IRI');
      MappingSteps.getTripleObjectSource(0).should('contain', 'movie_imdb_link');

      // Delete triple with empty predicate and object
      // When I add new nested triple
      MappingSteps.addNestedTriple(0);
      MappingSteps.getTriples().should('have.length', 3);
      // And I delete the new nested triple
      MappingSteps.deleteTriple(1);
      MappingSteps.confirm();
      // Then I expect the triple to be deleted
      MappingSteps.getTriples().should('have.length', 2);

      // Delete triple with empty object: predicate is 'a'
      // When I add new nested triple
      MappingSteps.addNestedTriple(0);
      MappingSteps.getTriples().should('have.length', 3);
      MappingSteps.completeTriple(1, undefined, 'a');
      // And I delete the new nested triple
      MappingSteps.deleteTriple(1);
      MappingSteps.confirm();
      // Then I expect the triple to be deleted
      MappingSteps.getTriples().should('have.length', 2);

      // Delete triple with empty object: predicate is a constant
      // When I add new nested triple
      MappingSteps.addNestedTriple(0);
      MappingSteps.getTriples().should('have.length', 3);
      MappingSteps.completeTriple(1, undefined, 'predicate');
      // And I delete the new nested triple
      MappingSteps.deleteTriple(1);
      MappingSteps.confirm();
      // Then I expect the triple to be deleted
      MappingSteps.getTriples().should('have.length', 2);
    });

    it('Should be able to delete all triples on New mapping button click', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete/mapping-model.json').as('loadProject');
      // Given I have opened the mapping UI
      PrepareSteps.visitPageAndWaitToLoad();
      // And I see two triples + one empty template
      MappingSteps.getTriples().should('have.length', 3);
      // I click and confirm new mapping
      HeaderSteps.newMapping();
      MappingSteps.confirm();
      // // I see one empty template
      MappingSteps.getTriples().should('have.length', 1);
    });
  });

  context('subject', () => {
    it('Should be able to delete first triple\'s subject with enabled preview', () => {
      PrepareSteps.stubEmptyMappingModel();
      cy.route('POST', '/rest/rdf-mapper/preview/ontorefine:123', 'fixture:delete/preview-response.json').as('loadPreview');
      // Given I have opened the mapping UI
      PrepareSteps.visitPageAndWaitToLoad();
      // And I see empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // I switch to preview and configuration view
      HeaderSteps.getBothViewButton().click();
      // And I complete one triple
      MappingSteps.completeTriple(0, '@duration', 'as', '123');
      // Then I should see 2 triples
      MappingSteps.getTriples().should('have.length', 2);
      // And I should see the preview for the completed triple
      MappingSteps.getTripleSubjectValuePreview(0).should('contain', 'duration');
      cy.wait('@loadPreview');
      MappingSteps.getTripleSubjectPreview(0).should('contain', '<178>');
      MappingSteps.getTriplePredicatePreview(0).should('contain', '<as>');
      MappingSteps.getTripleObjectPreview(0).should('contain', '"123"');
      // When I delete the subject node
      MappingSteps.deleteTripleSubject(0);
      MappingSteps.getConfirmationMessage().should('contain', 'Do you want to remove this mapping?');
      MappingSteps.confirm();
      // Then I expect the whole triple to be deleted
      MappingSteps.getTriples().should('have.length', 1);
    });
  });

  context('object', () => {
    it('Should be able to delete object', () => {
      PrepareSteps.stubEmptyMappingModel();
      PrepareSteps.visitPageAndWaitToLoad();
      // Given I have created a mapping column-constant-column
      MappingSteps.getTriples().should('have.length', 1);
      MappingSteps.completeTriple(0, '@duration', 'as', '@color');
      MappingSteps.getTriples().should('have.length', 2);
      // When I delete the object
      MappingSteps.deleteTripleObject(0);
      MappingSteps.confirm();
      // Then I expect the object to be deleted
      MappingSteps.getTriples().should('have.length', 1);
      MappingSteps.getTripleObjectValue(0).should('be.empty');
      MappingSteps.getTripleObjectType(0).should('have.length', 0);
      // Then I'll be able to add new object
      MappingSteps.completeObject(0, 'new');
      MappingSteps.verifyTriple(0, 'duration', 'as', 'new');
    });

    it('Should be able to delete the object in a nested triple', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete/object-in-nested-triple-mapping-model.json').as('loadProject');

      // Given I have loaded a mapping with a nested triple
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.getTriples().should('have.length', 3);

      // Delete nested object literal
      // When I try to delete the object in the nested triple
      MappingSteps.deleteTripleObject(1);
      MappingSteps.confirm();
      // Then I expect the object to be deleted
      MappingSteps.getTriples().should('have.length', 2);
      MappingSteps.getTripleObjectValue(1).should('be.empty');
    });

    it('Should be able to insert subject at same place as the deleted object when type predicate', () => {
      PrepareSteps.stubEmptyMappingModel();
      PrepareSteps.visitPageAndWaitToLoad();
      // Given I have created a mapping column-constant-column
      MappingSteps.getTriples().should('have.length', 1);
      MappingSteps.completeTriple(0, 'sub', 'a', '111');
      MappingSteps.completeObject(1, '222');
      MappingSteps.completeObject(2, '333');
      MappingSteps.getTriples().should('have.length', 4);
      // When I delete the object
      MappingSteps.deleteTripleObject(1);
      MappingSteps.confirm();
      // Then I expect the object to be deleted
      MappingSteps.getTriples().should('have.length', 3);
      MappingSteps.getTripleObjectValue(1).should('be.empty');
      MappingSteps.getTripleObjectType(1).should('have.length', 0);
      // Then I'll be able to add new object
      MappingSteps.getTripleObjectValue(1).type('222').blur();

      // Then objects keep order
      MappingSteps.getTripleObjectValuePreview(0).should('contain', '111');
      MappingSteps.getTripleObjectValuePreview(1).should('contain', '222');
      MappingSteps.getTripleObjectValuePreview(2).should('contain', '333');
    });

    it('Should be able to insert subject at same place as the deleted object when property predicate', () => {
      PrepareSteps.stubEmptyMappingModel();
      PrepareSteps.visitPageAndWaitToLoad();
      // Given I have created a mapping column-constant-column
      MappingSteps.getTriples().should('have.length', 1);
      MappingSteps.completeTriple(0, 'sub', 'pre', '111');
      MappingSteps.completeObject(1, '222');
      MappingSteps.completeObject(2, '333');
      MappingSteps.getTriples().should('have.length', 4);
      // When I delete the object
      MappingSteps.deleteTripleObject(1);
      MappingSteps.confirm();
      // Then I expect the object to be deleted
      MappingSteps.getTriples().should('have.length', 3);
      MappingSteps.getTripleObjectValue(1).should('be.empty');
      MappingSteps.getTripleObjectType(1).should('have.length', 0);
      // Then I'll be able to add new object
      MappingSteps.getTripleObjectValue(1).type('222').blur();

      // Then objects keep order
      MappingSteps.getTripleObjectValuePreview(0).should('contain', '111');
      MappingSteps.getTripleObjectValuePreview(1).should('contain', '222');
      MappingSteps.getTripleObjectValuePreview(2).should('contain', '333');
    });
  });
});

