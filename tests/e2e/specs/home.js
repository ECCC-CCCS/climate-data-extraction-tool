// https://docs.cypress.io/api/introduction/api.html

describe('CCCS Query UI E2E Test', () => {
  it('Visits the app home page and gets expected response', () => {
    // XHR to get latest GitHub release details on page load
    cy.server({ delay: 1500 })
      .route('GET', 'https://api.github.com/repos/ECCC-CCCS/climate-data-extraction-tool/releases/latest').as('apiGithubReleaseLatest')
    cy.visit('/') // App home page
    cy.wait('@apiGithubReleaseLatest').should((req) => {
      expect(req.method).to.equal('GET')
      expect(req, 'has duration in ms').to.have.property('duration').and.be.a('number')
    })
    cy.get('@apiGithubReleaseLatest').its('response').then((res) => {
      expect(res.body).to.have.property('url')
      expect(res.body.url).to.match(/^https:\/\/api\.github\.com\/repos\/ECCC-CCCS\/climate-data-extraction-tool\/releases\/\d+$/)
      expect(res.body.tag_name).to.match(/^\d{1,2}\.\d{1,2}\.\d{1,2}$/)
    })

    // Title
    cy.contains('h1', 'Climate data extraction tool').should('be.visible')

    // Latest release details
    cy.contains('#latest-release h3', 'Latest changes').should('be.visible')
    cy.contains('#latest-release', /Date: \d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])/).should('be.visible')

    // Information section
    cy.get('#info-contact-support').contains('h2', 'Information').should('be.visible')

    // More resources
    cy.contains('#more-resources h5', 'More resources from the Canadian Centre for Climate Services').should('be.visible')

    // Side navigation (datasets)
    cy.contains('nav#wb-sec h2', 'Section menu').should('be.visible')
    cy.get('nav#wb-sec > section h3 a').should('have.class', 'router-link-exact-active router-link-active')
  })
})
