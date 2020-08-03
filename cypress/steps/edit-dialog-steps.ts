import {MapperComponentSelectors} from '../utils/selectors/mapper-component.selectors';

/**
 * Common edit mapping dialog steps.
 */
class EditDialogSteps {

  static getDialog() {
    return cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_SELECTOR);
  }

  static getOkButton() {
    return EditDialogSteps.getDialog().find(`[appCypressData=${MapperComponentSelectors.OK_MAPPING_BUTTON_SELECTOR}]`);
  }

  static saveConfiguration() {
    this.getOkButton().click();
    this.getDialog().should('not.be.visible');
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
      parseSpecialCharSequences: true
    });
  }

  // type section
  static getTypeSection() {
    return EditDialogSteps.getDialog().find('[appCypressData=type-section]');
  }

  static selectIri() {
    return this.getTypeSection().find('[appCypressData=type-iri]').should('be.visible').click();
  }

  static selectLiteral() {
    return this.getTypeSection().find('[appCypressData=type-literal]').should('be.visible').click();
  }

  static selectTypeDataTypeLiteral() {
    return this.getTypeSection().find('[appCypressData=type-datatype_literal]').should('be.visible').click();
  }

  static selectDataTypeConstant() {
    return this.getTypeSection().find('[appCypressData=datatype-constant]').click();
  }

  static completeDataTypeConstant(value: string) {
    return this.getTypeSection().find('[appCypressData=datatype-constant-input]').should('be.visible').type(value).blur();
  }

  static selectTypeLanguageLiteral() {
    return this.getTypeSection().find('[appCypressData=type-language_literal]').should('be.visible').click();
  }

  static selectLanguageConstant() {
    return this.getTypeSection().find('[appCypressData=language-constant]').click();
  }

  static completeLanguageConstant(value: string) {
    return this.getTypeSection().find('[appCypressData=language-constant-input]').should('be.visible').type(value).blur();
  }


  // source section
  static getSourceSection() {
    return EditDialogSteps.getDialog().find('[appCypressData=source-section]');
  }

  static selectConstant() {
    return this.getSourceSection().find('[appCypressData=constant]').click();
  }

  static completeConstant(value: string) {
    return this.getSourceSection().find('[appCypressData=constant-input]').should('be.visible').type(value).blur();
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

  // transformation section
  static getTransformationSection() {
    return EditDialogSteps.getDialog().find('[appCypressData=transformation-section]');
  }

  static getTransformationExpressionField() {
    return this.getTransformationSection().find('[appCypressData=transformation-expression]');
  }

  static getGrelTransformationButton() {
    return this.getTransformationSection().find('[appCypressData=transformation-grel]');
  }

  static selectGREL() {
    return this.getGrelTransformationButton().should('be.visible').click();
  }

  static selectDataTypeGREL() {
    return this.getTypeSection().find('[appCypressData=datatype-transformation-grel]').should('be.visible').click();
  }

  static selectDataTypePrefix() {
    return this.getTypeSection().find('[appCypressData=datatype-transformation-prefix]').should('be.visible').click();
  }

  static completeGREL(value: string) {
    return this.getTransformationExpressionField().should('be.visible').type(value);
  }

  static completeDataTypeGREL(value: string) {
    this.getTypeSection().find('[appCypressData=datatype-transformation-expression]').should('be.visible').type(value);
  }

  static completeDataTypePrefix(value: string) {
    this.getTypeSection().find('[appCypressData=datatype-transformation-expression]').should('be.visible').type(value);
  }

  static getGRELPreview() {
    return this.getTransformationSection().find('[appCypressData=grel-preview]');
  }

  static getPrefixTransformationButton() {
    return this.getTransformationSection().find(`[appCypressData=transformation-prefix]`);
  }

  static selectPrefix() {
    return this.getPrefixTransformationButton().should('be.visible').click();
  }

  static completePrefix(prefix: string) {
    // emulate [esc] button hit in order to close the autocomplete
    return this.getTransformationExpressionField().should('be.visible').type(`${prefix}{esc}`, {
      parseSpecialCharSequences: true
    });
  }

  static clearPrefix() {
    return this.getTransformationExpressionField().should('be.visible').clear().type('{esc}', {
      parseSpecialCharSequences: true
    });
  }

  static getDataTypeGRELPreview() {
    return this.getTypeSection().find('[appCypressData=datatype-grel-preview]');
  }

}

export default EditDialogSteps;
