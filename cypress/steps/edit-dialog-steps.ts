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

  // transformation section
}

export default EditDialogSteps;
