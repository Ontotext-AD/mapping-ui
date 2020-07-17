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
    return this.getOkButton().click();
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
}

export default EditDialogSteps;
