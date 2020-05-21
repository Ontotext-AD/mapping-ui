import {MapperComponentSelectors} from "../../../../cypress/utils/selectors/mapper-component.selectors";


describe('MapperComponent', () => {

  it('should render mapper', () => {
    // GIVEN:
    // I visit home page
    cy.visit('');
    // THEN:
    // I see header content
    cy.cypressData(MapperComponentSelectors.MAPPER_SELECTOR).should('be.visible');
    // I see mapping holders
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR).should('be.visible');
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR).should('be.visible');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR).should('be.visible');
  });

  it('should render mapping dialog', () => {
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
    cy.cypressData(MapperComponentSelectors.OBJECT_MAPPER_DIALOG_SELECTOR).should('be.visible');

  });

});
