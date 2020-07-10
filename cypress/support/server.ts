beforeEach(() => {
  // Activate serving by default and force all unstubbed URLs to be 404 NOT FOUND
  cy.server({
    force404: true
  });
});
