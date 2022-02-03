// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for CANGRD ogc-api-coverage data with various form options', () => {
  it('Performs various combination of form changes with expected response', () => {
    cy.visit('/#/historical-gridded-data')

    // Trend
    cy.selectVar('#var-sel-value-type', 'Trend values', 'trend')
    cy.get('#info-date-not-required-trends').should('be.visible')

    // Anomaly
    cy.selectVar('#var-sel-value-type', 'Anomaly values', 'anomaly')
    cy.get('#info-date-not-required-trends').should('not.be.visible')

    // variable
    cy.selectVar('#var-sel-variable', 'Total precipitation', 'pcp')
    cy.get('#date-end-date').should('have.value', '2014')
  })

  it('Download data as tmean, Annual, Anomaly, 1960-1962, GeoTIFF', () => {
    cy.visit('/#/historical-gridded-data')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click

    // value type
    cy.selectVar('#var-sel-value-type', 'Anomaly values', 'anomaly')

    // variable
    cy.selectVar('#var-sel-variable', 'Mean temperature', 'tmean')

    // time interval
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')

    // download format
    cy.selectVar('#file_download_format', 'GeoTIFF', 'GTiff')

    // start date
    cy.get('input#date-start-date').clear().type('1960{enter}')

    // end date
    cy.get('input#date-end-date').should('not.be.disabled').clear().type('1962{enter}')

    // URL download link
    cy.get('#url-download-box').should('be.visible')
    cy.get('#point-download-box').should('be.hidden')

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*CANGRD_hist_annual_anom_ps50km_TMEAN_1960-2018\.tif.*/)
      })
    })
  })

  it('Download data as tmin, anomaly, monthly, 1999-11 to 1999-12, GeoTIFF', () => {
    cy.visit('/#/historical-gridded-data')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    // value type
    cy.selectVar('#var-sel-value-type', 'Anomaly values', 'anomaly')

    // variable
    cy.selectVar('#var-sel-variable', 'Minimum temperature', 'tmin')

    // time interval
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')

    // download format
    cy.selectVar('#file_download_format', 'GeoTIFF', 'GTiff')

    // Date range
    cy.inputText('#date-start-date', '1999-11{enter}')
    cy.get('input#date-end-date').should('not.be.disabled')
    cy.inputText('#date-end-date', '1999-12{enter}')

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*CANGRD_hist_monthly_anom_ps50km_TMIN_1999-11-1948-01\.tif.*$/)
      })
    })
  })

  it('Download data as pcp, trend, CoverageJSON', () => {
    cy.visit('/#/historical-gridded-data')

    // value type
    cy.selectVar('#var-sel-value-type', 'Trend values', 'trend')

    // variable
    cy.selectVar('#var-sel-variable', 'Total precipitation', 'pcp')

    // download format
    cy.selectVar('#file_download_format', 'CoverageJSON', 'json')

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.type).to.equal('Coverage')
        expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
      })
    })
  })

  it('Download data as tmax, Anomaly, Monthly, 2010-01 to 2010-02, CoverageJSON', () => {
    cy.visit('/#/historical-gridded-data')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    // value type
    cy.selectVar('#var-sel-value-type', 'Anomaly values', 'anomaly')

    // variable
    cy.selectVar('#var-sel-variable', 'Maximum temperature', 'tmax')

    // time interval
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')

    // Date range
    cy.inputText('#date-start-date', '2010-01{enter}')
    cy.get('input#date-end-date').should('be.disabled')
    //cy.inputText('#date-end-date', '2010-02{enter}')

    // download format
    cy.selectVar('#file_download_format', 'CoverageJSON', 'json')

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.type).to.equal('Coverage')
        expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
      })
    })
  })
})
