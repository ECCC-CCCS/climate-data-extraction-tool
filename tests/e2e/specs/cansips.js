// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for CanSIPS WCS data with various form options', () => {
  it('Test form changes and download sea level pressure data as GeoTIFF', () => {
    cy.visit('/#/seasonal-forecasts')

    let varName = 'Sea level pressure'
    let varVal = 'ETA_PN-SLP'
    let member = '8'
    let modelDate = '2018-03'
    let forecastDate = '2018-04'
    let formatName = 'GeoTIFF'
    let formatVal = 'image/tiff'

    // model type is disabled
    cy.get('#var-sel-model-type').scrollIntoView().should('be.disabled')

    // variable
    cy.selectVar('#var-sel-variable', varName, varVal)

    // member
    cy.inputText('#nummember', member)

    // date
    cy.inputText('#date-model-run-month', `${modelDate}{enter}`)
    cy.get('#date-forecast-month').should('have.value', forecastDate)

    // download format
    cy.selectVar('#raster_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('#url-download-box a:first').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        // attachment; filename="geomet-weather_CANSIPS.MEM.ETA_PN-SLP.08_2018-09-01T0000Z_PT720H.tif"
        expect(response.headers['content-disposition']).to.match(/.*geomet-weather_CANSIPS\.MEM\.ETA_PN-SLP\.08.*2018-03.*tif.*$/)
      })
    })
  })

  it('Download air temperature data as GeoTIFF', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click

    let varName = 'Air temperature'
    let varVal = 'ETA_TT'
    let member = '2'
    let modelDate = '2018-06'
    let forecastDate = '2018-07'
    let formatName = 'GeoTIFF'
    let formatVal = 'image/tiff'

    // model type is disabled
    cy.get('#var-sel-model-type').scrollIntoView().should('be.disabled')

    // variable
    cy.selectVar('#var-sel-variable', varName, varVal)

    // member
    cy.inputText('#nummember', member)

    // date
    cy.inputText('#date-model-run-month', `${modelDate}{enter}`)
    cy.get('#date-forecast-month').should('have.value', forecastDate)

    // download format
    cy.selectVar('#raster_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('#url-download-box a:first').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*geomet-weather_CANSIPS\.MEM\.ETA_TT\.02.*2018-06.*tif.*$/)
      })
    })
  })

  it('Download water temperature data as GeoTIFF', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    let varName = 'Water temperature'
    let varVal = 'ETA_WTMP'
    let member = '5'
    let modelDate = '2017-11'
    let forecastDate = '2017-12'
    let formatName = 'GeoTIFF'
    let formatVal = 'image/tiff'

    // model type is disabled
    cy.get('#var-sel-model-type').scrollIntoView().should('be.disabled')

    // variable
    cy.selectVar('#var-sel-variable', varName, varVal)

    // member
    cy.inputText('#nummember', member)

    // date
    cy.inputText('#date-model-run-month', `${modelDate}{enter}`)
    cy.get('#date-forecast-month').should('have.value', forecastDate)

    // download format
    cy.selectVar('#raster_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('#url-download-box a:first').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*geomet-weather_CANSIPS\.MEM\.ETA_WTMP\.05.*2017-11.*tif.*$/)
      })
    })
  })

  it('Download air temperature at 850mb data as NetCDF', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    let varName = 'Air temperature at 850mb'
    let varVal = 'PRES_TT.850'
    let member = '13'
    let modelDate = '2013-05'
    let forecastDate = '2013-06'
    let formatName = 'NetCDF'
    let formatVal = 'image/netcdf'

    // model type is disabled
    cy.get('#var-sel-model-type').scrollIntoView().should('be.disabled')

    // variable
    cy.selectVar('#var-sel-variable', varName, varVal)

    // member
    cy.inputText('#nummember', member)

    // date
    cy.inputText('#date-model-run-month', `${modelDate}{enter}`)
    cy.get('#date-forecast-month').should('have.value', forecastDate)

    // download format
    cy.selectVar('#raster_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('#url-download-box a:first').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*geomet-weather_CANSIPS\.MEM\.PRES_TT\.850\.13.*2013-05.*nc.*$/)
      })
    })
  })

  it('Download Instantaneous precipitation rate (m/s) data as NetCDF', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    let varName = 'Instantaneous precipitation rate (m/s)'
    let varVal = 'ETA_RT'
    let member = '10'
    let modelDate = '2016-08'
    let forecastDate = '2016-09'
    let formatName = 'NetCDF'
    let formatVal = 'image/netcdf'

    // model type is disabled
    cy.get('#var-sel-model-type').scrollIntoView().should('be.disabled')

    // variable
    cy.selectVar('#var-sel-variable', varName, varVal)

    // member
    cy.inputText('#nummember', member)

    // date
    cy.inputText('#date-model-run-month', `${modelDate}{enter}`)
    cy.get('#date-forecast-month').should('have.value', forecastDate)

    // download format
    cy.selectVar('#raster_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('#url-download-box a:first').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*geomet-weather_CANSIPS\.MEM\.ETA_RT\.10.*2016-08.*nc.*$/)
      })
    })
  })
})
