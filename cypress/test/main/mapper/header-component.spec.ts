import {HeaderComponentSelectors} from '../../../../cypress/utils/selectors/header-component.selectors';
import {MapperComponentSelectors} from '../../../../cypress/utils/selectors/mapper-component.selectors';
import MappingSteps from '../../../../cypress/steps/mapping-steps';
import HeaderSteps from "../../../../cypress/steps/header-steps";


describe('HeaderComponent', () => {
  beforeEach(() => {
    // stub labels
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    // stub namespaces
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    // stub model
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete/mapping-model.json');
    // stub columns
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
    // stub socksjs
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');
  });

  it('should render header', () => {
    // THEN:
    // I see header content
    cy.cypressData(HeaderComponentSelectors.HEADER_SELECTOR).should('be.visible');
  });

  it('should upload JSON mapping', () => {
    // I see header content
    cy.cypressData(MapperComponentSelectors.MAPPER_SELECTOR).should('be.visible');
    // I see mapping holders
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-0').should('be.visible').and('contain', 'director_name');
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + '-0').should('be.visible').and('contain', 'test');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-0').should('be.visible').and('contain', ' movie_imdb_link');
    // WHEN:
    // I upload valid JSON file
    cy.get('[appCypressData=json-file-input]').attachFile('upload/json.txt');
    // A conformation message pops up
    MappingSteps.getConfirmationMessage().should('contain', 'All mappings will be overwritten. Do you want to proceed?');
    // I confirm
    MappingSteps.confirm();
    // THEN:
    // A new mapping is loaded
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-0').should('be.visible').and('contain', 'Pesho');
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + '-0').should('be.visible').and('contain', 'loves');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-0').should('be.visible').and('contain', 'Maria');

    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-4').should('be.visible').and('have.length', 1);
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + '-4').should('be.visible').and('have.length', 1);
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-4').should('be.visible').and('contain', 'Sirma');

    HeaderSteps.getSaveMappingButton().should('be.enabled');
  });

  it('should not insert uploaded JSON mapping if not confirmed', () => {
    // WHEN:
    // I upload valid JSON file
    cy.get('[appCypressData=json-file-input]').attachFile('upload/json.txt');
    // A conformation message pops up
    MappingSteps.getConfirmationMessage().should('contain', 'All mappings will be overwritten. Do you want to proceed?');
    // I reject
    MappingSteps.reject();
    // THEN:
    // I see mapping holders
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-0').should('be.visible').and('contain', 'director_name');
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + '-0').should('be.visible').and('contain', 'test');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-0').should('be.visible').and('contain', ' movie_imdb_link');
  });

  it('should display error message if file is wrong or JSON is corrupted', () => {
    // WHEN:
    // I upload valid JSON file
    cy.get('[appCypressData=json-file-input]').attachFile('upload/img.jpg');
    // THEN:
    // A error message pops up
    MappingSteps.getNotification().should('contain', 'Unexpected token � in JSON at position 0');
  });
});
