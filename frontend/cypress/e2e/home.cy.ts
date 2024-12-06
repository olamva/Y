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
    cy.wait(1000);

    cy.get("a").contains("View All Users").click();

    cy.url().should("include", "/project2/users");

    cy.contains("All Users");
  });
});

describe("Search Functionality", () => {
  it("should perform a search and redirect to the search results page", () => {
    cy.visit("/");
    const searchQuery = "test";

    cy.get("input#search").type(`${searchQuery}{enter}`);
    cy.get('div[data-state="closed"]').should("not.exist");
    cy.url().should(
      "include",
      `/project2/search?q=${encodeURIComponent(searchQuery)}`,
    );
  });

  it("should test the auto suggestion", () => {
    cy.visit("/");

    cy.get("input#search").type("#sigma");

    cy.get('div[data-state="open"]')
      .should("be.visible")
      .within(() => {
        cy.contains("#sigma").click();
      });
    cy.get('div[data-state="closed"]').should("not.exist");
    cy.contains("#sigma");
    cy.url().should("include", "/project2/hashtag/sigma");
  });
});
