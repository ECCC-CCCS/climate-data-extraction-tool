// https://docs.cypress.io/api/introduction/api.html

const TIMEOUT_MS = 6500;
const INTERVAL_MS = 2000;

describe('E2E test for home page', () => {
  it('Visits the app home page and gets expected response', () => {
    // XHR to get latest GitHub release details on page load
    cy.intercept('GET', /https:\/\/api\.github\.com\/repos\/ECCC-CCCS\/climate-data-extraction-tool\/releases\/latest/).as('apiGithubReleaseLatest')
    cy.visit('/') // App home page
    cy.waitUntil(() => cy.wait('@apiGithubReleaseLatest').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.response.body).to.have.property('url')
      expect(xhr.response.body.url).to.match(/^https:\/\/api\.github\.com\/repos\/ECCC-CCCS\/climate-data-extraction-tool\/releases\/\d+$/)
      expect(xhr.response.body.tag_name).to.match(/^\d{1,2}\.\d{1,2}\.\d{1,2}$/)
    }), {
      errorMsg: 'Timeout reached', // overrides the default error message
      timeout: TIMEOUT_MS, // waits up to TIMEOUT_MS, default to 6500 ms
      interval: INTERVAL_MS, // performs the check every INTERVAL_MS, default to 2000 ms
      verbose: true, // log the progress, default to false
      customCheckMessage: 'WaitUntil Check Happened' // check message, happens for every single check
    })

    // Title
    cy.contains('h1', 'Climate data extraction tool').scrollIntoView().wait(250).should('be.visible')

    // Latest release details
    cy.contains('#latest-release summary', 'Latest changes').scrollIntoView().wait(250).should('be.visible')
    cy.contains('#latest-release', /Date: \d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/).should('be.visible')

    // More resources
    cy.contains('#more-resources h5', 'More resources from the Canadian Centre for Climate Services').scrollIntoView().wait(250).should('be.visible')

    // Side navigation (datasets)
    cy.contains('nav#wb-sec h2', 'Section menu').should('be.visible')
    cy.get('nav#wb-sec > section h3 a').should('have.class', 'router-link-exact-active router-link-active')
  })
})
