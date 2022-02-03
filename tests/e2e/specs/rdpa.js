// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for RDPA ogc-api-coverage data with various form options', () => {
  it('Test dynamic form changes for expected response', () => {
    cy.visit('/#/regional-deterministic-precipitation-analysis')

    // model type to Archive changes analysis date
    cy.selectVar('#var-sel-model-type', 'Archive', 'ARC')
    cy.get('#date-analysis-date').should('have.value', '2011-04-06')

    // interval to 24 hours changes run hour
    cy.selectVar('#var-sel-precipitation-accumulation-interval', '24 hours', '24F')
    cy.get('#var-sel-analysis-run-hour').should('have.value', '12Z').should('be.disabled')

    // model type to Analysis changes date
    cy.selectVar('#var-sel-model-type', 'Analysis', 'FORE')
    cy.get('#date-analysis-date').should('have.value', '2012-10-03')
  })

  it('Download analysis 6F 18Z data as GeoTIFF', () => {
    cy.visit('/#/regional-deterministic-precipitation-analysis')

    let modelName = 'Analysis'
    let modelVal = 'FORE'
    let intervalName = '6 hours'
    let intervalVal = '6F'
    let date = '2018-08-08'
    let runName = '18Z'
    let runVal = runName
    let formatName = 'GeoTIFF'
    let formatVal = 'image/tiff'

    // model type
    cy.selectVar('#var-sel-model-type', modelName, modelVal)

    // interval
    cy.selectVar('#var-sel-precipitation-accumulation-interval', intervalName, intervalVal)

    // date
    cy.inputText('#date-analysis-date', `${date}{enter}`)

    // run hour
    cy.selectVar('#var-sel-analysis-run-hour', runName, runVal)

    // download format
    cy.selectVar('#file_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*geomet-weather_RDPA\.6F_PR_2018-08-08T1800Z.*tif.*$/)
      })
    })
  })

  it('Download analysis 24F data as GeoTIFF', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click

    let modelName = 'Analysis'
    let modelVal = 'FORE'
    let intervalName = '24 hours'
    let intervalVal = '24F'
    let date = '2018-08-08'
    let runName = '12Z'
    let runVal = runName
    let formatName = 'GeoTIFF'
    let formatVal = 'image/tiff'

    // model type
    cy.selectVar('#var-sel-model-type', modelName, modelVal)

    // interval
    cy.selectVar('#var-sel-precipitation-accumulation-interval', intervalName, intervalVal)

    // date
    cy.inputText('#date-analysis-date', `${date}{enter}`)

    // run hour
    cy.get('#var-sel-analysis-run-hour').should('be.disabled').should('have.value', runVal)

    // download format
    cy.selectVar('#file_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        // geomet-weather_RDPA.24F_PR_2018-08-08T1200Z.tif
        expect(response.headers['content-disposition']).to.match(/.*geomet-weather_RDPA\.24F_PR_2018-08-08T1200Z.*tif.*$/)
      })
    })
  })

  it('Download archive 6F 06Z data as NetCDF', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    let modelName = 'Archive'
    let modelVal = 'ARC'
    let intervalName = '6 hours'
    let intervalVal = '6F'
    let date = '2011-09-11'
    let runName = '06Z'
    let runVal = runName
    let formatName = 'NetCDF'
    let formatVal = 'image/netcdf'

    // model type
    cy.selectVar('#var-sel-model-type', modelName, modelVal)

    // interval
    cy.selectVar('#var-sel-precipitation-accumulation-interval', intervalName, intervalVal)

    // date
    cy.inputText('#date-analysis-date', `${date}{enter}`)

    // run hour
    cy.selectVar('#var-sel-analysis-run-hour', runName, runVal)

    // download format
    cy.selectVar('#file_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        // geomet-weather_RDPA.ARC_15km.6F_PR_2011-09-11T0600Z.nc
        expect(response.headers['content-disposition']).to.match(/.*geomet-weather_RDPA\.ARC_15km\.6F_PR_2011-09-11T0600Z.*nc.*$/)
      })
    })
  })

  it('Download archive 6F 00Z data as NetCDF', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    let modelName = 'Archive'
    let modelVal = 'ARC'
    let intervalName = '6 hours'
    let intervalVal = '6F'
    let date = '2012-10-02'
    let runName = '00Z'
    let runVal = runName
    let formatName = 'NetCDF'
    let formatVal = 'image/netcdf'

    // model type
    cy.selectVar('#var-sel-model-type', modelName, modelVal)

    // interval
    cy.selectVar('#var-sel-precipitation-accumulation-interval', intervalName, intervalVal)

    // date
    cy.inputText('#date-analysis-date', `${date}{enter}`)

    // run hour
    cy.selectVar('#var-sel-analysis-run-hour', runName, runVal)

    // download format
    cy.selectVar('#file_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*geomet-weather_RDPA\.ARC_15km\.6F_PR_2012-10-02T0000Z.*nc.*$/)
      })
    })
  })

  it('Download archive 24F data as GeoTIFF', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    let modelName = 'Archive'
    let modelVal = 'ARC'
    let intervalName = '24 hours'
    let intervalVal = '24F'
    let date = '2011-04-06'
    let runName = '12Z'
    let runVal = runName
    let formatName = 'GeoTIFF'
    let formatVal = 'image/tiff'

    // model type
    cy.selectVar('#var-sel-model-type', modelName, modelVal)

    // interval
    cy.selectVar('#var-sel-precipitation-accumulation-interval', intervalName, intervalVal)

    // date
    cy.inputText('#date-analysis-date', `${date}{enter}`)

    // run hour disabled
    cy.get('#var-sel-analysis-run-hour').should('be.disabled').should('have.value', runVal)

    // download format
    cy.selectVar('#file_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*geomet-weather_RDPA\.ARC_15km\.24F_PR_2011-04-06T1200Z.*tif.*$/)
      })
    })
  })
})
