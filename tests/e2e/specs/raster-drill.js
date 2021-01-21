// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for raster drill pages', () => {
  it('Visits CMIP5 and perform raster drill downloads, as GeoJSON format', () => {
    cy.visit('/#/cmip5-data')

    // point selection
    cy.selRadio('option-radio-map-selection-type', 'on')
    cy.get('#point-download-box').scrollIntoView().wait(250).should('be.visible').should('have.class', 'alert-danger')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click

    // Pan map (to BC)
    cy.get('#bbox-map').focus().type('{downarrow}').wait(500).type('{downarrow}').wait(500).type('{downarrow}').wait(500).type('{leftarrow}').wait(500).type('{leftarrow}').wait(500).type('{leftarrow}')

    // click on map
    cy.clickOnMap('center')

    // download format
    cy.selectVar('#vector_download_format', 'GeoJSON', 'geojson')

    // download url
    cy.get('#point-download-box').scrollIntoView().wait(250).should('have.class', 'alert-success')
    cy.intercept('POST', /.*\/processes\/raster-drill\/jobs.*/).as('rasterDrillDownload')
    cy.get('#point-download-box button').click()
    cy.wait('@rasterDrillDownload', { timeout: 60000 }).then((xhr) => {
      expect(xhr.request.method).to.equal('POST')
      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.response.body.outputs.properties.values.length).to.be.greaterThan(90)
    })
  })

  it('Visits DCS and perform raster drill downloads, as CSV format', () => {
    cy.visit('/#/downscaled-data')

    // point selection
    cy.selRadio('option-radio-map-selection-type', 'on')
    cy.get('#point-download-box').scrollIntoView().wait(250).should('be.visible').should('have.class', 'alert-danger')

    // Pan map (to QC)
    cy.get('#bbox-map').focus().type('{downarrow}').wait(500).type('{downarrow}').wait(500).type('{rightarrow}').wait(500).type('{rightarrow}')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click

    // click on map
    cy.clickOnMap('center')

    // download format
    cy.selectVar('#vector_download_format', 'CSV', 'csv')

    // download url
    cy.get('#point-download-box').scrollIntoView().wait(250).should('have.class', 'alert-success')
    cy.intercept('POST', /.*\/processes\/raster-drill\/jobs.*/).as('rasterDrillDownload')
    cy.get('#point-download-box button').click()
    cy.wait('@rasterDrillDownload', { timeout: 60000 }).then((xhr) => {
      expect(xhr.request.method).to.equal('POST')
      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.response.body).to.contain('time_2006/2100/P1Y,values,longitude,latitude')
    })
  })

  it('Visits CANGRD and perform raster drill downloads, as GeoJSON format', () => {
    cy.visit('/#/historical-gridded-data')

    // point selection
    cy.selRadio('option-radio-map-selection-type', 'on')
    cy.get('#point-download-box').scrollIntoView().wait(250).should('be.visible').should('have.class', 'alert-danger')

    // Pan map (to Regina, SK)
    cy.get('#bbox-map').focus().type('{downarrow}').wait(500).type('{downarrow}').wait(500).type('{downarrow}')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click

    // click on map
    cy.clickOnMap('center')

    // download format
    cy.selectVar('#vector_download_format', 'GeoJSON', 'geojson')

    // download url
    cy.get('#point-download-box').scrollIntoView().wait(250).should('have.class', 'alert-success')
    cy.intercept('POST', /.*\/processes\/raster-drill\/jobs.*/).as('rasterDrillDownload')
    cy.get('#point-download-box button').click()
    cy.wait('@rasterDrillDownload', { timeout: 60000 }).then((xhr) => {
      expect(xhr.request.method).to.equal('POST')
      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.response.body.outputs.properties.values.length).to.be.greaterThan(100)
    })
  })
})
