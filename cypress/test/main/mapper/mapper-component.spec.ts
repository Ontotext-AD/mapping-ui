import {MapperComponentSelectors} from "../../../../cypress/utils/selectors/mapper-component.selectors";

describe('MapperComponent', () => {

  it('should render mapper', () => {
    // GIVEN:
    // I visit home page
    cy.fixture('mapping-response').as('mappingResponse'); 
    cy.server();    
    cy.route({
      method: 'GET',      
      url: '/rest/rdf-mapper/columns/ontorefine:123',
      response: ['col1', 'col2']        
    });
    cy.route({
      method: 'GET',      
      url: '/orefine/command/core/get-models/?project=123',
      response: '@mappingResponse'
    });
    cy.visit('?dataProviderID=ontorefine:123');

    // THEN:
    // I see header content
    cy.cypressData(MapperComponentSelectors.MAPPER_SELECTOR).should('be.visible');
    // I see mapping holders
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR).should('be.visible');
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR).should('be.visible');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR).should('be.visible');
  });

  // TODO FIX with real data
  it.skip('should render mapping dialog', () => {
    // GIVEN:
    // I visit home page
    cy.visit('');

    // WHEN:
    // I drag and drop the first source in the subject holder
    cy.cypressData(MapperComponentSelectors.FIRST_SOURCE_SELECTOR).trigger("mousedown", {button: 0});
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR)
      .trigger("mousemove")
      .click()
      .trigger(("mouseup"));

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.SUBJECT_MAPPER_DIALOG_SELECTOR).should('be.visible');

  });

});
