Cypress.Commands.add("login", (username, password) => {
  cy.visit("/login");
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get("button").contains("Login").click();
  cy.contains(`@${username}`).should("be.visible");
});
