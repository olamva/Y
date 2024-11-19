// cypress/support/commands.d.ts

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to log in a user.
     * @example cy.login('username', 'password')
     */
    login(username: string, password: string): Chainable<void>;
  }
}
