// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for DCS page with ogc-api-coverage data', () => {
  it('Performs various combination of form changes with expected response', () => {
    cy.visit('/#/downscaled-data')

    // historical
    cy.selectRadio('option-radio-options', 'historical')
    cy.get('#rcp_scenario').should('be.hidden')
    cy.get('#historical-date-range').should('be.visible')
    cy.get('#rcp-date-range').should('be.hidden')
    cy.get('#val-radio-user-defined-range').should('be.checked')
    cy.get('#date-historical-start-date').should('not.have.attr', 'required', 'required')
    cy.get('#date-historical-end-date').should('not.have.attr', 'required', 'required')

    // monthly check
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.get('#var-sel-value-type').should('be.disabled')
    cy.get('#date-historical-start-date').should('have.attr', 'required', 'required')
    cy.get('#date-historical-end-date').should('have.attr', 'required', 'required')
    cy.get('#val-radio-20-year-average').should('not.exist')
    cy.get('#oapi-download-links-list').find('a').should('have.lengthOf', 1)
    cy.get('button#clear-hist-dates-btn').click()
    cy.get('label[for="date-historical-start-date"').contains('This field is required')
    cy.get('label[for="date-historical-end-date"').contains('This field is required')

    // future
    cy.selectRadio('option-radio-options', 'projected')
    cy.get('#var-sel-value-type').should('be.disabled')
    cy.selectVar('#rcp_scenario', 'High emissions scenario (RCP 8.5)', 'RCP8.5')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Spring (March-May)', 'MAM')
    cy.selectVar('#var-sel-value-type', 'Anomaly values', 'anomaly')
    cy.get('#val-radio-20-year-average').should('exist')
  })

  it('Download data as tm, RCP2.6, Annual, Anomaly, 50 percentile, 2099-2100, CoverageJSON', () => {
    cy.visit('/#/downscaled-data')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click

    // variable
    cy.selectVar('#var-sel-variable', 'Mean temperature', 'tm')

    // future
    cy.selectRadio('option-radio-options', 'projected')

    // scenario
    cy.selectVar('#rcp_scenario', 'Low emissions scenario (RCP 2.6)', 'RCP2.6')

    // time interval
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')

    // value type
    cy.selectVar('#var-sel-value-type', 'Anomaly values', 'anomaly')

    // Ensemble percentile
    cy.get('#var-sel-ensemble-percentile').scrollIntoView().wait(250).should('be.disabled').should('have.value', '50')

    // time range type
    cy.selectRadio('option-radio-time-range-type', 'custom')

    // start date
    cy.get('input#date-start-date').clear().type('2099{enter}')

    // end date
    cy.get('input#date-end-date').clear().type('2100{enter}')

    // 20-year average
    cy.get('#var-sel-20-year-average-range').should('be.hidden') // .select('2081-2100').should('have.value', '2081-2100')

    // download format
    cy.selectVar('#file_download_format', 'CoverageJSON', 'json')

    // URL download link
    cy.get('#url-download-box').should('be.visible')
    cy.get('#point-download-box').should('be.hidden')

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

  it('Download data as tn, historical, monthly, 1999-11 to 1999-12, CoverageJSON', () => {
    cy.visit('/#/downscaled-data')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    // variable
    cy.selectVar('#var-sel-variable', 'Minimum temperature', 'tn')

    // historical
    cy.selectRadio('option-radio-options', 'historical')

    // Monthly
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')

    // Date range
    cy.inputText('#date-historical-start-date', '1999-11{enter}')
    cy.inputText('#date-historical-end-date', '1999-12{enter}')

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

  it('Download data as pr, RCP2.6, 20-year average, 2081-2100, NetCDF', () => {
    cy.visit('/#/downscaled-data')

    // variable
    cy.selectVar('#var-sel-variable', 'Total precipitation', 'pr')

    // future
    cy.selectRadio('option-radio-options', 'projected')

    // 20-year average
    cy.selectRadio('option-radio-time-range-type', 'P20Y-Avg')
    cy.selectVar('#var-sel-20-year-average-range', '2081-2100', '2081-2100')

    // download format
    cy.selectVar('#file_download_format', 'NetCDF', 'NetCDF')

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-type']).to.equal('application/x-netcdf')
        expect(response.headers['content-disposition']).to.match(/.*DCS_rcp2\.6_annual_2081-2100_latlon0\.086x0\.086_pr_pctl50_P1Y\.nc.*$/)
      })
    })


  })

  it('Download data as tx, RCP8.5, Monthly, 2010-01 to 2010-02, NetCDF', () => {
    cy.visit('/#/downscaled-data')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)

    // variable
    cy.selectVar('#var-sel-variable', 'Maximum temperature', 'tx')

    // future
    cy.selectRadio('option-radio-options', 'projected')

    // RCP8.5
    cy.selectVar('#rcp_scenario', 'High emissions scenario (RCP 8.5)', 'RCP8.5')

    // Monthly
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')

    // Date range
    cy.inputText('#date-start-date', '2010-01{enter}')
    cy.inputText('#date-end-date', '2010-02{enter}')

    // download format
    cy.selectVar('#file_download_format', 'NetCDF', 'NetCDF')

    // visit download link
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-type']).to.equal('application/x-netcdf')
        expect(response.headers['content-disposition']).to.match(/.*DCS_rcp8\.5_monthly_abs_latlon0\.086x0\.086_tx_pctl50_P1M\.nc.*$/)
      })
    })
  })
})
