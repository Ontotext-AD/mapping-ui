import MappingSteps from '../steps/mapping-steps';

describe('Delete triple', () => {

  beforeEach(() => {
    // stub labels
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    // stub namespaces
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    // stub model
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete-triple-with-iri-object/mapping-model.json');
    // stub columns
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
    // stub socksjs
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
  });

  it('Should be able to delete root level triple with IRI object and all its children', () => {
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

  it.only('Should be able to delete nested triple', () => {
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
