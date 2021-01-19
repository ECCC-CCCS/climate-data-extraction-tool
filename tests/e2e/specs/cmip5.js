// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for CMIP5 page with WCS data', () => {
  it('Download data as GeoTIFF by various selection options', () => {
    cy.visit('/#/cmip5-data')

    // variable
    cy.get('#var-sel-variable').scrollIntoView().wait(250).select('Mean temperature').should('have.value', 'TT')
    cy.get('[name="option-radio-options"]').check('RCP')

    // scenario
    cy.get('#rcp_scenario').scrollIntoView().wait(250).select('Low emissions scenario (RCP 2.6)').should('have.value', 'RCP26')

    // time interval
    cy.get('#var-sel-time-interval--time-of-year').scrollIntoView().wait(250).select('Annual').should('have.value', 'YEAR')

    // value type
    cy.get('#var-sel-value-type').scrollIntoView().wait(250).select('Anomaly values').should('have.value', 'ANO')

    // Ensemble percentile
    cy.get('#var-sel-ensemble-percentile').scrollIntoView().wait(250).should('be.disabled').should('have.value', 'PCTL50') // .select('50th percentile').should('have.value', 'PCTL50')

    // time range type
    cy.get('[name="option-radio-time-range-type"]').check('custom')

    // start date
    cy.get('input#date-start-date').clear().type('2010{enter}')

    // end date
    cy.get('input#date-end-date').clear().type('2100{enter}')

    // 20-year average
    cy.get('#var-sel-20-year-average-range').should('be.hidden') // .select('2081-2100').should('have.value', '2081-2100')

    // download format
    cy.get('#raster_download_format').select('GeoTIFF').should('have.value', 'image/tiff')

    // URL download link
    cy.get('#url-download-box').should('be.visible')
    cy.get('#point-download-box').should('be.hidden')
  })

  it('Download data as NetCDF by various selection options', () => {
    cy.visit('/#/cmip5-data')

    // variable
    cy.get('#var-sel-variable').scrollIntoView().wait(250).select('Mean precipitation').should('have.value', 'PR')
    cy.get('#val-radio-future').check().should('have.value', 'RCP')
  })
})
