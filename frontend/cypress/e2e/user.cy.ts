describe("User Page", () => {
  const user = {
    username: "cytest",
    password: "cytest1",
    confirmPassword: "cytest1",
  };

  beforeEach(() => {
    cy.session([user.username, user.password], () => {
      cy.login(user.username, user.password);
    });
  });

  it("Should edit the user profile", () => {
    cy.visit("/user/cytest");
    cy.contains("Edit Profile").click();
    cy.get("#biography").clear().type("This is a test bio");
    cy.get("button").contains("Save changes").click();
    cy.contains("This is a test bio").should("be.visible");
  });

  it("Should create a post and delete it", () => {
    cy.visit("/");
    cy.get("textarea").type("This is a test post");
    cy.get("button").contains("Post").click();
    cy.contains("This is a test post").should("be.visible");
    cy.visit("/user/cytest");
    cy.contains("This is a test post").should("be.visible");
    cy.get('[aria-label="Delete post"]').click();
    cy.contains("This is a test post").should("not.exist");
  });

  it("Should create a comment and delete it", () => {
    cy.visit("/");
    cy.get("article").first().click("bottomRight", { force: true });
    cy.get("textarea").type("This is a test comment");
    cy.get("button").contains("Post").click();
    cy.contains("This is a test comment").should("be.visible");
    cy.visit("/user/cytest");
    cy.get("button").contains("Comments").click();
    cy.contains("This is a test comment").should("be.visible");

    cy.get('[aria-label="Delete post"]').first().click();
  });

  it("Should follow and unfollow a user", () => {
    cy.visit("/user/ola");
    cy.get("button").contains("Follow").click();
    cy.wait(1000);
    cy.get("button").contains("Following").click();
  });

  it("Should like/unlike a post", () => {
    cy.visit("/");

    cy.get('[aria-label="Like post"]').first().as("likeButton");

    cy.get("@likeButton")
      .find("span.select-none")
      .invoke("text")
      .then((initialCountText) => {
        const initialCount = parseInt(initialCountText, 10);
        cy.get("@likeButton").click();
        cy.get("@likeButton")
          .find("span.select-none")
          .should(($span) => {
            const newCount = parseInt($span.text(), 10);
            expect(newCount).to.eq(initialCount + 1 || initialCount - 1);
          });
      });
  });
});
