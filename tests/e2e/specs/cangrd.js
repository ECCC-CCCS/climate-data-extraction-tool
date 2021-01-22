// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for CANGRD WCS data with various form options', () => {
  it('Performs various combination of form changes with expected response', () => {
    cy.visit('/#/historical-gridded-data')

    // Trend
    cy.selectVar('#var-sel-value-type', 'Trend values', 'TREND')
    cy.get('#info-date-not-required-trends').should('be.visible')

    // Anomaly
    cy.selectVar('#var-sel-value-type', 'Anomaly values', 'ANO')
    cy.get('#info-date-not-required-trends').should('not.be.visible')

    // variable
    cy.selectVar('#var-sel-variable', 'Total precipitation', 'PR')
    cy.get('#date-end-date').should('have.value', '2014')
  })

  it('Download data as TM, Annual, Anomaly, 1960-1970, GeoTIFF', () => {
    cy.visit('/#/historical-gridded-data')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click

    // value type
    cy.selectVar('#var-sel-value-type', 'Anomaly values', 'ANO')

    // variable
    cy.selectVar('#var-sel-variable', 'Mean temperature', 'TM')

    // time interval
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'ANNUAL')

    // start date
    cy.get('input#date-start-date').clear().type('1960{enter}')

    // end date
    cy.get('input#date-end-date').clear().type('1970{enter}')

    // download format
    cy.selectVar('#raster_download_format', 'GeoTIFF', 'image/tiff')

    // URL download link
    cy.get('#url-download-box').should('be.visible')
    cy.get('#point-download-box').should('be.hidden')

    // visit download link
    cy.get('#wcs-download-links-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#wcs-download-links-list a:first').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*geomet-climate-CANGRD\.ANO\.TM.*ANNUAL.*tif.*$/)
      })
    })
  })

  it('Download data as TN, anomaly, monthly, 1999-11 to 1999-12, GeoTIFF', () => {
    cy.visit('/#/historical-gridded-data')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    // value type
    cy.selectVar('#var-sel-value-type', 'Anomaly values', 'ANO')

    // variable
    cy.selectVar('#var-sel-variable', 'Minimum temperature', 'TN')

    // time interval
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'MONTHLY')

    // Date range
    cy.inputText('#date-start-date', '1999-11{enter}')
    cy.inputText('#date-end-date', '1999-12{enter}')

    // visit download link
    cy.get('#wcs-download-links-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#wcs-download-links-list a:first').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*geomet-climate-CANGRD\.ANO\.TN_MONTHLY.*tif.*$/)
      })
    })
  })

  it('Download data as PR, trend, NetCDF', () => {
    cy.visit('/#/historical-gridded-data')

    // value type
    cy.selectVar('#var-sel-value-type', 'Trend values', 'TREND')

    // variable
    cy.selectVar('#var-sel-variable', 'Total precipitation', 'PR')

    // download format
    cy.selectVar('#raster_download_format', 'NetCDF', 'image/netcdf')

    // visit download link
    cy.get('#wcs-download-links-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#wcs-download-links-list a:first').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*geomet-climate-CANGRD\.TREND\.PR_ANNUAL.*nc.*$/)
      })
    })
  })

  it('Download data as TX, Anomaly, Monthly, 2010-01 to 2010-02, NetCDF', () => {
    cy.visit('/#/historical-gridded-data')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    // value type
    cy.selectVar('#var-sel-value-type', 'Anomaly values', 'ANO')

    // variable
    cy.selectVar('#var-sel-variable', 'Maximum temperature', 'TX')

    // time interval
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'MONTHLY')

    // Date range
    cy.inputText('#date-start-date', '2010-01{enter}')
    cy.inputText('#date-end-date', '2010-02{enter}')

    // download format
    cy.selectVar('#raster_download_format', 'NetCDF', 'image/netcdf')

    // visit download link
    cy.get('#wcs-download-links-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#wcs-download-links-list a:first').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*geomet-climate-CANGRD\.ANO\.TX_MONTHLY.*nc.*$/)
      })
    })
  })
})
