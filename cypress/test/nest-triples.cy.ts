import MappingSteps from '../steps/mapping-steps';
import PrepareSteps from '../steps/prepare-steps';

describe('Nest triples', () => {
  beforeEach(() => {
    PrepareSteps.prepareMoviesNamespacesAndColumns();
  });

  it('Should nest triples properly', () => {
    cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture: 'nest-triples/mapping-model.json'}).as('loadProject');
    // Given I have created a mapping with multiple nested triples
    // When I load the mapping
    PrepareSteps.visitPageAndWaitToLoad();
    // Then I expect to see 9 triples (+1 empty template)
    MappingSteps.getTriples().should('have.length', 10);
    // And I expect to have 2 root level triples and 3 levels of nesting under the first one
    MappingSteps.getTriple(0).should('have.class', 'level-0');
    // first nesting level
    MappingSteps.getTriple(1).should('have.class', 'level-1');
    MappingSteps.getTriple(2).should('have.class', 'level-1');
    MappingSteps.getTriple(3).should('have.class', 'level-1');
    // second nesting level
    MappingSteps.getTriple(4).should('have.class', 'level-2');
    MappingSteps.getTriple(5).should('have.class', 'level-2');
    // third nesting level
    MappingSteps.getTriple(6).should('have.class', 'level-3');
    MappingSteps.getTriple(7).should('have.class', 'level-3');
    // last triple is at root level
    MappingSteps.getTriple(8).should('have.class', 'level-0');
    // The template triple is at level-0
    MappingSteps.getTriple(9).should('have.class', 'level-0');
  });

  it('Should nest new triple properly', () => {
    cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture: 'nest-triples/mapping-model.json'}).as('loadProject');
    // Given I have created a mapping with multiple nested triples
    // When I load the mapping
    PrepareSteps.visitPageAndWaitToLoad();
    // Then I expect to see 9 triples (+1 empty template)
    MappingSteps.getTriples().should('have.length', 10);
    MappingSteps.addNestedTriple(0);
    MappingSteps.getTriplePredicate(4).find('input').should('have.focus');
    MappingSteps.getTriple(4).should('have.class', 'level-1');
    MappingSteps.addNestedTriple(6);
    MappingSteps.getTriplePredicate(9).find('input').should('have.focus');
    MappingSteps.getTriple(9).should('have.class', 'level-3');
  });
});
