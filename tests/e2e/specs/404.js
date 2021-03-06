// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for 404 page', () => {
  it('Visits a non-existent page and get 404 page', () => {
    cy.visit('/#/a-page-that-does-not-exist')
    cy.contains('We couldn\'t find that Web page (Error 404)').should('be.visible')
    cy.contains('Nous ne pouvons trouver cette page Web (Erreur 404)').should('be.visible')
  })
})
