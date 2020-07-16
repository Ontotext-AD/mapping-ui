import MappingSteps from '../steps/mapping-steps';
import HeaderSteps from '../steps/header-steps';

describe('Delete', () => {

  beforeEach(() => {
    // stub labels
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    // stub namespaces
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    // stub columns
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
    // stub socksjs
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
  });

  context('triple', () => {
    it('Should be able to delete root level triple with IRI object and all its children', () => {
      // stub model
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete/mapping-model.json');

      // Given I have opened the mapping UI
      cy.visit('?dataProviderID=ontorefine:123');
      // And I see two triples + one empty template
      MappingSteps.getTriples().should('have.length', 3);
      // And The first triple has IRI as object
      MappingSteps.getTripleObjectType(0).should('contain', 'IRI');
      MappingSteps.getTripleObjectSource(0).should('contain', 'movie_imdb_link');
      // And The second triple has the IRI as subject
      MappingSteps.getTripleSubjectType(1).should('contain', 'IRI');
      MappingSteps.getTripleSubjectSource(1).should('contain', 'movie_imdb_link');
      // And The second triple is nested
      MappingSteps.getNestedTriple(1).should('have.length', 1);
      // When I try to delete the first triple
      MappingSteps.deleteTriple(0);
      // Then I expect confirmation
      MappingSteps.getConfirmationMessage().should('contain', 'Do You want to remove this mapping?');
      // When I deny confirmation
      MappingSteps.reject();
      // I expect same triples in the mapping
      MappingSteps.getTriples().should('have.length', 3);
      // When I delete the first triple
      MappingSteps.deleteTriple(0);
      MappingSteps.confirm();
      // Then I expect both triples to be deleted
      MappingSteps.getTriples().should('have.length', 1);
    });

    it('Should be able to delete nested triple', () => {
      // stub model
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete/mapping-model.json');

      // Given I have opened the mapping UI
      cy.visit('?dataProviderID=ontorefine:123');
      // And I see two triples + one empty template
      MappingSteps.getTriples().should('have.length', 3);
      // When I try to delete the nested triple
      MappingSteps.deleteTriple(1);
      // Then I expect confirmation
      MappingSteps.getConfirmationMessage().should('contain', 'Do You want to remove this mapping?');
      // When I deny confirmation
      MappingSteps.reject();
      // I expect same triples in the mapping
      MappingSteps.getTriples().should('have.length', 3);
      // When I delete the nested triple
      MappingSteps.deleteTriple(1);
      MappingSteps.confirm();
      // Then I expect the triple to be deleted
      MappingSteps.getTriples().should('have.length', 2);
      MappingSteps.getTripleSubjectSource(0).should('contain', 'director_name');
      MappingSteps.getTripleObjectType(0).should('contain', 'IRI');
      MappingSteps.getTripleObjectSource(0).should('contain', 'movie_imdb_link');
    });
  });

  context('subject', () => {
    it('Should be able to delete first triple\'s subject with enabled preview', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('POST', '/rest/rdf-mapper/preview/ontorefine:123', 'fixture:delete/preview-response.json').as('loadPreview');
      // Given I have opened the mapping UI
      cy.visit('?dataProviderID=ontorefine:123');
      // And I see empty mapping
      MappingSteps.getTriples().should('have.length', 1);
      // When I enable preview
      HeaderSteps.enablePreview();
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
      MappingSteps.getConfirmationMessage().should('contain', 'Do You want to remove this mapping?');
      MappingSteps.confirm();
      // Then I expect the whole triple to be deleted
      MappingSteps.getTriples().should('have.length', 1);
    });
  });
});
