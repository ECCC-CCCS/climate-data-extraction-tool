// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for RDPA ogc-api-coverage data with various form options', () => {
  it('Test dynamic form changes for expected response', () => {
    cy.visit('/#/regional-deterministic-precipitation-analysis')

    // model type to Archive changes analysis date
    cy.selectVar('#var-sel-model-type', 'Archive (15km)', '15km')
    cy.get('#date-analysis-date').should('have.value', '2011-04-06')

    // interval to 24 hours changes run hour
    cy.selectVar('#var-sel-precipitation-accumulation-interval', '24 hours', '24f')
    cy.get('#var-sel-analysis-run-hour').should('have.value', '12Z').should('be.disabled')

    // model type to 10km changes date
    cy.selectVar('#var-sel-model-type', 'Analysis (10km)', '10km')
    cy.get('#date-analysis-date').should('have.value', '2012-10-03')
  })

  it('Download analysis 6f 18Z data as CoverageJSON', () => {
    cy.visit('/#/regional-deterministic-precipitation-analysis')

    let modelName = 'Analysis (10km)'
    let modelVal = '10km'
    let intervalName = '6 hours'
    let intervalVal = '6f'
    let date = '2018-08-08'
    let runName = '18Z'
    let runVal = runName
    let formatName = 'CoverageJSON'
    let formatVal = 'json'

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
        expect(response.body.type).to.equal('Coverage')
        expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
      })
    })
  })

  it('Download analysis 24f data as CoverageJSON', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click

    let modelName = 'Analysis (10km)'
    let modelVal = '10km'
    let intervalName = '24 hours'
    let intervalVal = '24f'
    let date = '2018-08-08'
    let runName = '12Z'
    let runVal = runName
    let formatName = 'CoverageJSON'
    let formatVal = 'json'

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
        expect(response.body.type).to.equal('Coverage')
        expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
      })
    })
  })

  it('Download archive 6f 06Z data as GRIB', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    let modelName = 'Archive (15km)'
    let modelVal = '15km'
    let intervalName = '6 hours'
    let intervalVal = '6f'
    let date = '2011-09-11'
    let runName = '06Z'
    let runVal = runName
    let formatName = 'GRIB'
    let formatVal = 'GRIB'

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
        expect(response.headers['content-type']).to.equal('application/x-grib2')
        expect(response.headers['content-disposition']).to.match(/.*CMC_RDPA_APCP-006-0700cutoff_SFC_0_ps15km_2011091106_000.grib2.*$/)
      })
    })
  })

  it('Download archive 6f 00Z data as GRIB', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    let modelName = 'Archive (15km)'
    let modelVal = '15km'
    let intervalName = '6 hours'
    let intervalVal = '6f'
    let date = '2012-10-02'
    let runName = '00Z'
    let runVal = runName
    let formatName = 'GRIB'
    let formatVal = 'GRIB'

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
        expect(response.headers['content-type']).to.equal('application/x-grib2')
        expect(response.headers['content-disposition']).to.match(/.*CMC_RDPA_APCP-006-0700cutoff_SFC_0_ps15km_2012100200_000\.grib2.*$/)
      })
    })
  })

  it('Download archive 24f data as CoverageJSON', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    let modelName = 'Archive (15km)'
    let modelVal = '15km'
    let intervalName = '24 hours'
    let intervalVal = '24f'
    let date = '2011-04-06'
    let runName = '12Z'
    let runVal = runName
    let formatName = 'CoverageJSON'
    let formatVal = 'json'

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
        expect(response.body.type).to.equal('Coverage')
        expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
      })
    })
  })
})
