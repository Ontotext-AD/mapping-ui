import PrepareSteps from '../steps/prepare-steps';
import MappingSteps from '../steps/mapping-steps';

describe('End triple with the proper sign', () => {

  beforeEach(() => {
    PrepareSteps.prepareMoviesNamespacesAndColumns();
    cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture:'add-siblings/mapping-model.json'}).as('loadProject');
    // Given I have created a mapping with multiple nested triples
    // When I load the mapping
    PrepareSteps.visitPageAndWaitToLoad();
    // Then I expect to see 9 triples (+1 empty template)
    MappingSteps.getTriples().should('have.length', 7);
  });

  it('Object with siblings ends with comma', () => {
    MappingSteps.getTriple(0).find('.triples-block').should('have.class', 'triples-block-end-comma');
  });

  it('Last object ends with ; if there are more predicates', () => {
    MappingSteps.getTriple(1).find('.triples-block').should('have.class', 'triples-block-end-column');
  });

  it('Last object ends with . if there are no more predicates of its subject', () => {
    MappingSteps.getTriple(3).find('.triples-block').should('have.class', 'triples-block-end-dot');
  });

  it('Last object in nested triple ends with ; if there are more predicates of its subject', () => {
    MappingSteps.getTriple(4).find('.triples-block').should('have.class', 'triples-block-end-column');
  });

  it('Last object ends in nested triple ends with . if there are no more predicates of its subject', () => {
    MappingSteps.getTriple(5).find('.triples-block').should('have.class', 'triples-block-end-dot');
  });
});
