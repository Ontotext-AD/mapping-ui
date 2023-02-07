import { AppComponentSelectors } from "../utils/selectors/app-component.selectors";

/**
 * Defines steps for the notifications during the functionality execution.
 *
 * @author A. Kunchev
 */
export default class NotificationSteps {

  static getErrorNotification(): Cypress.Chainable {
    return cy.get(AppComponentSelectors.ERROR_NOTIFICATION);
  }

  static getErrorNotificationContent(): Cypress.Chainable {
    return this.getErrorNotification().get(AppComponentSelectors.NOTIFICATION_CONTENT);
  }

  static getWarnNotification(): Cypress.Chainable {
    return cy.get(AppComponentSelectors.WARN_NOTIFICATION);
  }

  static getWarnNotificationContent(): Cypress.Chainable {
    return this.getWarnNotification().get(AppComponentSelectors.NOTIFICATION_CONTENT);
  }

  static getSuccessfulNotification(): Cypress.Chainable {
    return cy.get(AppComponentSelectors.SUCCESSFUL_NOTIFICATION);
  }

  static getSuccessfulNotificationContent(): Cypress.Chainable {
    return this.getSuccessfulNotification().get(AppComponentSelectors.NOTIFICATION_CONTENT);
  }
}