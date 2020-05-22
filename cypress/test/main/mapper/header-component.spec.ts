import {HeaderComponentSelectors} from "../../../../cypress/utils/selectors/header-component.selectors";


describe('HeaderComponent', () => {

  it('should render header', () => {
    // GIVEN:
    // I visit home page
    cy.visit('');
    // THEN:
    // I see header content
    cy.cypressData(HeaderComponentSelectors.HEADER_SELECTOR).should('be.visible');
  });
});
