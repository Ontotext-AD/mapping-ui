import {MapperComponentSelectors} from '../utils/selectors/mapper-component.selectors';
import MappingSteps from '../steps/mapping-steps';

/**
 * Common edit mapping dialog steps.
 */
class EditDialogSteps {
  static getDialog() {
    return cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_SELECTOR);
  }

  static getDialogTitle() {
    return this.getDialog().find('[appCypressData="dialog-title"]');
  }

  static getOkButton() {
    return EditDialogSteps.getDialog().find(`[appCypressData=${MapperComponentSelectors.OK_MAPPING_BUTTON_SELECTOR}]`);
  }

  static saveConfiguration() {
    cy.wait(500);
    this.getOkButton().click();
    this.getDialog().should('not.exist');
  }

  static getWarningMessage() {
    return this.getDialog().find('[appCypressData=warning-message]');
  }

  // fields
  static getColumnField() {
    return EditDialogSteps.getDialog().find(`[appCypressData=${MapperComponentSelectors.COLUMN_INPUT}]`);
  }

  static clearColumnValue() {
    // in order to close the autocomplete dialog, simulate [esc] key click
    return EditDialogSteps.getColumnField().clear().type('{esc}', {
      parseSpecialCharSequences: true,
    });
  }

  // type section
  static getTypeSection() {
    return EditDialogSteps.getDialog().find('[appCypressData=type-section]');
  }

  static getLiteralTypeSection() {
    return EditDialogSteps.getDialog().find('[appCypressData=literal-type-section]');
  }

  static selectIri() {
    return this.getTypeSection().find('[appCypressData=type-iri]').should('be.visible').click();
  }

  static selectLiteral() {
    return this.getTypeSection().find('[appCypressData=type-literal]').should('be.visible').click();
  }

  static selectUniqueBnode() {
    return this.getTypeSection().find('[appCypressData=type-unique_bnode]').should('be.visible').click();
  }

  static selectValueBnode() {
    return this.getTypeSection().find('[appCypressData=type-value_bnode]').should('be.visible').click();
  }

  static selectTypeDataTypeLiteral() {
    this.selectLiteral();
    return this.getLiteralTypeSection().find('[appCypressData=transformation-datatype_literal]').should('be.visible').click();
  }

  static selectDataTypeConstant() {
    return this.getLiteralTypeSection().find('[appCypressData=datatype-constant]').click();
  }

  static completeDataTypeConstant(value: string) {
    return this.getLiteralTypeSection().find('[appCypressData=datatype-constant-input]').should('be.visible').type(value).blur();
  }

  static selectTypeLanguageLiteral() {
    this.selectLiteral();
    return this.getLiteralTypeSection().find('[appCypressData=transformation-language_literal]').should('be.visible').click();
  }

  static selectLanguageConstant() {
    return this.getLiteralTypeSection().find('[appCypressData=language-constant]').click();
  }

  static selectLanguageColumn() {
    return this.getLiteralTypeSection().find('[appCypressData=language-column]').click();
  }

  static completeLanguageConstant(value: string) {
    return this.getLiteralTypeSection().find('[appCypressData=language-constant-input]').should('be.visible').type(value).blur();
  }

  static selectDataTypeColumn() {
    return this.getLiteralTypeSection().find('[appCypressData=datatype-column]').click();
  }

  static completeSourceTypeColumn(value: string) {
    return this.getLiteralTypeSection().find('[appCypressData=datatype-column-input]').should('be.visible')
      .type(value + '{esc}', {
        parseSpecialCharSequences: true,
      }).blur();
  }

  // source section
  static getSourceSection() {
    return EditDialogSteps.getDialog().find('[appCypressData=source-section]');
  }

  static selectConstant() {
    return this.getSourceSection().find('[appCypressData=constant]').click();
  }

  static getConstantField() {
    return this.getSourceSection().find('[appCypressData=constant-input]');
  }

  static completeConstant(value: string) {
    return this.getConstantField().should('be.visible').type(value).blur();
  }

  static clearConstantValue() {
    return EditDialogSteps.getConstantField().clear().type('{esc}', {
      parseSpecialCharSequences: true,
    });
  }

  static selectColumn() {
    return this.getSourceSection().find('[appCypressData=column]').click();
  }

  static completeColumn(value: string) {
    return this.getSourceSection().find('[appCypressData=column-input]').should('be.visible').type(value).blur();
  }

  static selectRowIndex() {
    return this.getSourceSection().find('[appCypressData=row_index]').click();
  }

  static selectGrelButton() {
    return this.getSourceSection().find('[appCypressData=grel]');
  }

  static setRawIRI() {
    return this.getSourceSection().find('[appCypressData=transformation-raw]').click();
  }

  static isRawIRI() {
    return this.getSourceSection().find('[appCypressData=transformation-raw] button').should('have.attr', 'aria-pressed', 'true');
  }

  // transformation section
  static getTransformationSection() {
    return EditDialogSteps.getDialog().find('[appCypressData=transformation-section]');
  }

  // Source GREL transformation

  static getTransformationExpressionField() {
    return this.getTransformationSection().find('[appCypressData=transformation-expression]');
  }

  static getGrelTransformationButton() {
    return this.selectGrelButton();
  }

  static selectGREL() {
    return this.selectGrelButton().should('be.visible').click();
  }

  static completeGREL(value: string) {
    return this.getTransformationExpressionField().should('be.visible').type(value);
  }

  static clearGREL() {
    return this.getTransformationExpressionField().should('be.visible').clear().blur();
  }

  static getGRELPreview() {
    return cy.get('[appCypressData=expression-grel-preview]');
  }

  // Datatype GREL transformation

  static selectDataTypeGREL() {
    return this.getLiteralTypeSection().find('[appCypressData=datatype-grel]').should('be.visible').click();
  }

  static getDatatypePrefixButton() {
    return this.getLiteralTypeSection().find('[appCypressData=datatype-transformation-prefix]');
  }

  static getDataTypeExpressionField() {
    return this.getLiteralTypeSection().find('[appCypressData=datatype-transformation-expression]');
  }

  static completeDataTypeExpression(value: string) {
    // type is invoked with force: true due to the field suggest stealing the focus.
    return this.getDataTypeExpressionField().should('be.visible').focus().type(value, {force: true});
  }

  static getDataTypeGRELPreview() {
    return cy.get('[appCypressData=datatype-grel-preview-content]');
  }

  static clearDataTypeExpression() {
    // clear is invoked with force: true due to the field suggest stealing the focus.
    return this.getDataTypeExpressionField().should('be.visible').clear({force: true}).type('{esc}', {
      parseSpecialCharSequences: true,
    });
  }

  // Language GREL transformation

  static selectLanguageGREL() {
    return this.getLiteralTypeSection().find('[appCypressData=language-grel]').should('be.visible').click();
  }

  static getLanguageTransformationExpressionField() {
    return this.getLiteralTypeSection().find('[appCypressData=language-transformation-expression]');
  }

  static getLanguageGRELPreview() {
    return cy.get('[appCypressData=language-grel-preview-content]');
  }

  static completeDataTypePrefix(value: string) {
    this.getLiteralTypeSection().find('[appCypressData=datatype-transformation-expression]').should('be.visible').type(value);
  }

  static completeLanguageGREL(value: string) {
    return this.getLanguageTransformationExpressionField().should('be.visible').type(value);
  }

  static clearLanguageGREL() {
    return this.getLanguageTransformationExpressionField().should('be.visible').clear();
  }

  // Prefix transformation

  static getPrefixTransformationButton() {
    return this.getTransformationSection().find(`[appCypressData=transformation-prefix]`);
  }

  static selectPrefix() {
    return this.getPrefixTransformationButton().should('be.visible').click();
  }

  static completePrefix(prefix: string) {
    // type is invoked with force: true due to the field suggest stealing the focus.
    return this.getTransformationExpressionField().should('be.visible').focus().type(`${prefix}`, {
      parseSpecialCharSequences: true,
      force: true
    });
  }

  static clearPrefix() {
    return this.getTransformationExpressionField().should('be.visible').clear({force: true}).type('{esc}', {
      parseSpecialCharSequences: true,
    });
  }

  static getPrefixSuggestions() {
    return cy.get('.mat-autocomplete-panel').find(`[appCypressData="prefix-suggestion"]`);
  }

  static getColumnSuggestions() {
    return cy.get('.mat-autocomplete-panel').find(`[appCypressData="column-suggestion"]`);
  }

  static assertNewLineNotAddedToField(fieldAccessorCb: any) {
    MappingSteps.type('{enter}', () => fieldAccessorCb);
    fieldAccessorCb.should('have.value', '');
  }
}

export default EditDialogSteps;
