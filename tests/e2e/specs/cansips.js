// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for CanSIPS ogc-api-coverage data with various form options', () => {
  it('Test form changes and download sea level pressure data as CoverageJSON', () => {
    cy.visit('/#/seasonal-forecasts')

    let varName = 'Sea level pressure'
    let varVal = '4'
    let member = '8'
    let modelDate = '2018-03'
    let forecastDate = '2018-04'
    let formatName = 'CoverageJSON'
    let formatVal = 'json'

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
    cy.selectVar('#file_download_format', formatName, formatVal)

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

  it('Download air temperature data as CoverageJSON', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click

    let varName = 'Air temperature'
    let varVal = '1'
    let member = '2'
    let modelDate = '2018-06'
    let forecastDate = '2018-07'
    let formatName = 'CoverageJSON'
    let formatVal = 'json'

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
    cy.selectVar('#file_download_format', formatName, formatVal)

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

  it('Download water temperature data as CoverageJSON', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    let varName = 'Water temperature'
    let varVal = '6'
    let member = '5'
    let modelDate = '2017-11'
    let forecastDate = '2017-12'
    let formatName = 'CoverageJSON'
    let formatVal = 'json'

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
    cy.selectVar('#file_download_format', formatName, formatVal)

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

  it('Download air temperature at 850mb data as GRIB', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    let varName = 'Air temperature at 850mb'
    let varVal = '5'
    let member = '13'
    let modelDate = '2013-05'
    let forecastDate = '2013-06'
    let formatName = 'GRIB'
    let formatVal = 'GRIB'

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
    cy.selectVar('#file_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*cansips_forecast_raw_latlon2\.5x2\.5_TMP_ISBL_0850_2013-05_allmembers\.grib2.*$/)
      })
    })
  })

  it('Download Instantaneous precipitation rate (m/s) data as GRIB', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    let varName = 'Instantaneous precipitation rate (m/s)'
    let varVal = '3'
    let member = '10'
    let modelDate = '2016-08'
    let forecastDate = '2016-09'
    let formatName = 'GRIB'
    let formatVal = 'GRIB'

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
    cy.selectVar('#file_download_format', formatName, formatVal)

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-disposition']).to.match(/.*cansips_forecast_raw_latlon2\.5x2\.5_PRATE_SFC_0_2016-08_allmembers\.grib2.*$/)
      })
    })
  })
})
