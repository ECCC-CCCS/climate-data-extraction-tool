// https://docs.cypress.io/api/introduction/api.html

const TIMEOUT_MS = 6500;
const INTERVAL_MS = 2000;

describe('E2E test for raster drill data with various form options', () => {
  it('Visits CMIP5 and perform raster drill downloads, as GeoJSON format', () => {
    cy.visit('/#/cmip5-data')

    // point selection
    cy.selectRadio('option-radio-map-selection-type', 'yes')
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
    cy.intercept('POST', /.*\/processes\/raster-drill\/execution.*/).as('rasterDrillDownload')
    cy.get('#point-download-box button').click()
    cy.waitUntil(() => cy.wait('@rasterDrillDownload').then((xhr) => {
      try {
        expect(xhr.response.headers).to.have.property('content-encoding')
        expect(xhr.response.headers['content-encoding']).to.match(/gzip/ig)
      } catch {
        cy.log('content-encoding does not exist in response header. Test continued.')
      }
      expect(xhr.request.method).to.equal('POST')
      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.response.body.properties.values.length).to.be.greaterThan(90)
    }), {
      errorMsg: 'Timeout reached', // overrides the default error message
      timeout: TIMEOUT_MS, // waits up to TIMEOUT_MS, default to 6500 ms
      interval: INTERVAL_MS, // performs the check every INTERVAL_MS, default to 2000 ms
      verbose: true, // log the progress, default to false
      customCheckMessage: 'WaitUntil Check Happened' // check message, happens for every single check
    })
  })

  it('Visits DCS and perform raster drill downloads, as CSV format', () => {
    cy.visit('/#/downscaled-data')

    // point selection
    cy.selectRadio('option-radio-map-selection-type', 'yes')
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
    cy.intercept('POST', /.*\/processes\/raster-drill\/execution.*/).as('rasterDrillDownload')
    cy.get('#point-download-box button').click()
    cy.waitUntil(() => cy.wait('@rasterDrillDownload').then((xhr) => {
      try {
        expect(xhr.response.headers).to.have.property('content-encoding')
        expect(xhr.response.headers['content-encoding']).to.match(/gzip/ig)
      } catch {
        cy.log('content-encoding does not exist in response header. Test continued.')
      }
      expect(xhr.request.method).to.equal('POST')
      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.response.body).to.contain('time_2006/2100/P1Y,values,longitude,latitude')
    }), {
      errorMsg: 'Timeout reached', // overrides the default error message
      timeout: TIMEOUT_MS, // waits up to TIMEOUT_MS, default to 6500 ms
      interval: INTERVAL_MS, // performs the check every INTERVAL_MS, default to 2000 ms
      verbose: true, // log the progress, default to false
      customCheckMessage: 'WaitUntil Check Happened' // check message, happens for every single check
    })
  })

  it('Visits CANGRD and perform raster drill downloads, as GeoJSON format', () => {
    cy.visit('/#/historical-gridded-data')

    // point selection
    cy.selectRadio('option-radio-map-selection-type', 'yes')
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
    cy.intercept('POST', /.*\/processes\/raster-drill\/execution.*/).as('rasterDrillDownload')
    cy.get('#point-download-box button').click()
    cy.waitUntil(() => cy.wait('@rasterDrillDownload').then((xhr) => {
      try {
        expect(xhr.response.headers).to.have.property('content-encoding')
        expect(xhr.response.headers['content-encoding']).to.match(/gzip/ig)
      } catch {
        cy.log('content-encoding does not exist in response header. Test continued.')
      }
      expect(xhr.request.method).to.equal('POST')
      expect(xhr.response.statusCode).to.equal(200)
      expect(xhr.response.body.properties.values.length).to.be.greaterThan(100)
    }), {
      errorMsg: 'Timeout reached', // overrides the default error message
      timeout: TIMEOUT_MS, // waits up to TIMEOUT_MS, default to 6500 ms
      interval: INTERVAL_MS, // performs the check every INTERVAL_MS, default to 2000 ms
      verbose: true, // log the progress, default to false
      customCheckMessage: 'WaitUntil Check Happened' // check message, happens for every single check
    })
  })
})
