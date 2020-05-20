import {AppComponentSelectors} from '../utils/selectors/app.component.selectors';

describe('AppComponent', () => {

  it('should render title', () => {
    // GIVEN:
    // I visit home page
    cy.visit('');
    // THEN:
    // I see page title
    cy.title().should('eq', 'MappingUi');
    // I see page content
    cy.cypressData(AppComponentSelectors.APP_CONTENT_SELECTOR).contains('mapping-ui app is running!');
  });
});
