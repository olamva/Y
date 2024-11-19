describe("Visit homepage", () => {
  it("successfully loads", () => {
    cy.visit("/");
    cy.contains("Latest");
    cy.scrollTo("bottom");
  });
});

describe("Visit post", () => {
  it("successfully loads a specific post", () => {
    cy.visit("/");
    cy.get("article").first().click("bottomRight", { force: true });

    cy.get('textarea[placeholder="Write your reply..."]').should("be.visible");
  });
});

describe("View All Users", () => {
  it("navigates to the All Users page", () => {
    cy.viewport(1920, 1080);
    cy.visit("/");
    cy.wait(2000);

    cy.get("a").contains("View All Users").click();

    cy.url().should("include", "/project2/users");

    cy.contains("All users");
  });
});
