import {HeaderComponentSelectors} from '../../../utils/selectors/header-component.selectors';
import {MapperComponentSelectors} from '../../../utils/selectors/mapper-component.selectors';
import MappingSteps from '../../../../cypress/steps/mapping-steps';
import HeaderSteps from '../../../../cypress/steps/header-steps';
import PrepareSteps from '../../../steps/prepare-steps';

describe('HeaderComponent', () => {
  beforeEach(() => {
    PrepareSteps.prepareMoviesNamespacesAndColumns();
  });

  it('Should render header', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:header/mapping-model.json').as('loadProject');
    PrepareSteps.visitPageAndWaitToLoad();
    // THEN:
    // I see header content
    cy.cypressData(HeaderComponentSelectors.HEADER_SELECTOR).should('be.visible');
  });

  context('Generate RDF', () => {
    it('Should be disabled initially when the mapping is empty', () => {
      PrepareSteps.stubEmptyMappingModel();
      // When I load an empty mapping model
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.getTriples().should('have.length', 1);
      // Then I expect the generate rdf button to be disabled
      HeaderSteps.getGenerateRdfButton().should('be.disabled');
      // When I add a new triple
      MappingSteps.completeTriple(0, 's', 'p', 'o');
      MappingSteps.getTriples().should('have.length', 2);
      // Then I expect the button to become enabled
      HeaderSteps.getGenerateRdfButton().should('be.enabled');
    });

    it('Should be enabled initially when the mapping is not empty', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:header/mapping-model.json').as('loadProject');
      // When I load a mapping model
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.getTriples().should('have.length', 3);
      // Then I expect the generate rdf button to be disabled
      HeaderSteps.getGenerateRdfButton().should('be.enabled');
      // When I delete a triple but the mapping is still not empty
      MappingSteps.deleteTriple(1);
      MappingSteps.confirm();
      MappingSteps.getTriples().should('have.length', 2);
      // Then I expect the button to be enabled
      HeaderSteps.getGenerateRdfButton().should('be.enabled');
      // When I delete all triples
      MappingSteps.deleteTriple(0);
      MappingSteps.confirm();
      MappingSteps.getTriples().should('have.length', 1);
      // Then I expect the button to become disabled
      HeaderSteps.getGenerateRdfButton().should('be.disabled');
    });

    it('Should be disabled when mapping is cleared', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:header/mapping-model.json').as('loadProject');
      // When I load a mapping model
      PrepareSteps.visitPageAndWaitToLoad();
      MappingSteps.getTriples().should('have.length', 3);
      // When I clear the mapping
      HeaderSteps.newMapping();
      MappingSteps.confirm();
      MappingSteps.getTriples().should('have.length', 1);
      // Then I expect the button to become disabled
      HeaderSteps.getGenerateRdfButton().should('be.disabled');
    });
  });

  context('Upload mapping as JSON', () => {
    it('Should upload JSON mapping', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:header/mapping-model.json').as('loadProject');
      PrepareSteps.visitPageAndWaitToLoad();
      cy.route({
        method: 'POST',
        url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
        status: 200,
        delay: 1000,
        response: 'fixture:save-mapping-success.json'
      });
      // I see header content
      cy.cypressData(MapperComponentSelectors.MAPPER_SELECTOR).should('be.visible');
      // I see mapping holders
      cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-0').should('be.visible').and('contain', 'director_name');
      cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + '-0').should('be.visible').and('contain', 'test');
      cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-0').should('be.visible').and('contain', ' movie_imdb_link');
      // When I update and save the loaded mapping
      MappingSteps.completeTriple(2, 's', 'p', 'o');
      HeaderSteps.saveMapping();
      MappingSteps.getTriples().should('have.length', 4);
      // Then I expect the save button to become disabled
      HeaderSteps.getSaveMappingButton().should('be.disabled');
      // When I upload valid JSON file
      cy.get('[appCypressData=json-file-input]').attachFile('upload/json.txt');
      // A conformation message pops up
      MappingSteps.getConfirmationMessage().should('contain', 'All mappings will be overwritten. Do you want to proceed?');
      // When I confirm
      MappingSteps.confirm();
      // Then A new mapping is loaded
      cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-0').should('be.visible').and('contain', 'Pesho');
      cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + '-0').should('be.visible').and('contain', 'loves');
      cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-0').should('be.visible').and('contain', 'Maria');

      cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-4').should('be.visible').and('have.length', 1);
      cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + '-4').should('be.visible').and('have.length', 1);
      cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-4').should('be.visible').and('contain', 'Sirma');
      // And I expect the save button to become enabled so that I can save the new mapping
      HeaderSteps.getSaveMappingButton().should('be.enabled');
    });

    it('Should not insert uploaded JSON mapping if not confirmed', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:header/mapping-model.json').as('loadProject');
      PrepareSteps.visitPageAndWaitToLoad();
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

    it('Should display error message if file is wrong or JSON is corrupted', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:header/mapping-model.json').as('loadProject');
      PrepareSteps.visitPageAndWaitToLoad();
      // WHEN:
      // I upload valid JSON file
      cy.get('[appCypressData=json-file-input]').attachFile('upload/img.jpg');
      // THEN:
      // A error message pops up
      MappingSteps.getNotification().should('contain', 'Unexpected token � in JSON at position 0');
    });
  });
});
