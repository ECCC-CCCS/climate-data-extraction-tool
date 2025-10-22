describe('E2E test for CanDCSU6 ogc-api-coverage data with various form options', () => {
  it('Check that initial values are as expected', () => {
    cy.visit('/#/candcsu6-data')
    
    cy.get('#var-sel-variable').should('have.value', 'AirTemp')
    cy.get('#var-sel-time-interval--time-of-year').should('have.value', 'annual')
    cy.get('#var-sel-value-type').should('have.value', 'anomaly')
    cy.get('#var-sel-ensemble-percentile').should('have.value', '50')
    cy.get('#ssp_scenario').should('have.value', 'SSP126')
    cy.get('#var-sel-30-year-average-range').should('have.value', '2021-2050')
    cy.get('#file_download_format').should('have.value', 'json')
  })
  it('Test that the year for the beginning and ending dates are preserved', () => {
    // Ensure that the projected data is selected and set to user defined range
    cy.selectRadio('option-radio-options', 'projected')
    cy.selectRadio('option-radio-time-range-type', 'custom')
    
    // Start with annual data
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    
    // Change the date to be 2061-2097
    cy.get('input#date-start-date').clear().type('2061{enter}')
    cy.get('input#date-end-date').clear().type('2097{enter}')
    
    // Next, ensure that seasonal data retains that same range
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Spring (March-May)', 'MAM')
    cy.get('input#date-start-date').should('have.value', '2061')
    cy.get('input#date-end-date').should('have.value', '2097')
    
    // Then change to monthly data and then back to annual data
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    cy.get('input#date-start-date').should('have.value', '2061')
    cy.get('input#date-end-date').should('have.value', '2097')
  })
  it('Basic situations for dataset changes with monthly data', () => {
    // We'll set the projected data to use the dates 2065-05 to 2098-12
    var projStart = '2065-05'
    var projEnd = '2098-12'
    
    // Ensure everything is set to its default
    cy.selectRadio('option-radio-options', 'projected')
    cy.selectRadio('option-radio-time-range-type', 'custom')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    
    // add in the dates
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.get('input#date-start-date').clear().type(`${projStart}{enter}`)
    cy.get('input#date-end-date').clear().type(`${projEnd}{enter}`)
    
    // See if the monthly data is retained when switching to a different dataset
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.get('input#date-start-date').should('have.value', projStart)
    cy.get('input#date-end-date').should('have.value', projEnd)
    
    // Now try changing to the historical data and then back
    cy.selectRadio('option-radio-options', 'historical')
    cy.selectRadio('option-radio-options', 'projected')
    cy.get('input#date-start-date').should('have.value', projStart)
    cy.get('input#date-end-date').should('have.value', projEnd)
  })
  it('Ensuring projected month is preserved with specific scenarios', () => {
    var projStart = '2065-05'
    var projEnd = '2098-11'
    
    // Set the default values
    cy.selectRadio('option-radio-options', 'projected')
    cy.selectRadio('option-radio-time-range-type', 'custom')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    
    // add in the dates
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.get('input#date-start-date').clear().type(`${projStart}{enter}`)
    cy.get('input#date-end-date').clear().type(`${projEnd}{enter}`)
    
    // We will change the data to a different time period, set to historical data,
    // and then return to the original setting to ensure it is still the same
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    cy.selectRadio('option-radio-options', 'historical')
    cy.selectRadio('option-radio-options', 'projected')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.get('input#date-start-date').should('have.value', projStart)
    cy.get('input#date-end-date').should('have.value', projEnd)
    
    // Repeat but instead change it to monthly before reverting to projected data
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    cy.selectRadio('option-radio-options', 'historical')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.selectRadio('option-radio-options', 'projected')
    cy.get('input#date-start-date').should('have.value', projStart)
    cy.get('input#date-end-date').should('have.value', projEnd)
  })
  it('Ensuring historical month is preserved with specific scenarios', () => {
    var histStart = '1999-06'
    var histEnd = '2012-11'
    
    // Set the default values
    cy.selectRadio('option-radio-options', 'historical')
    cy.selectRadio('option-radio-time-range-type', 'custom')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    
    // add in the dates
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.get('input#date-historical-start-date').clear().type(`${histStart}{enter}`)
    cy.get('input#date-historical-end-date').clear().type(`${histEnd}{enter}`)
    
    // We will change the data to a different time period, set to projected data,
    // and then return to the original setting to ensure it is still the same
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    cy.selectRadio('option-radio-options', 'projected')
    cy.selectRadio('option-radio-options', 'historical')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.get('input#date-historical-start-date').should('have.value', histStart)
    cy.get('input#date-historical-end-date').should('have.value', histEnd)
    
    // Repeat but set to monthly before reverting
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    cy.selectRadio('option-radio-options', 'projected')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.selectRadio('option-radio-options', 'historical')
    cy.get('input#date-historical-start-date').should('have.value', histStart)
    cy.get('input#date-historical-end-date').should('have.value', histEnd)
  })
  it('Set month to Jan when changing to a different year', () => {
    cy.selectRadio('option-radio-options', 'projected')
    cy.selectRadio('option-radio-time-range-type', 'custom')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    var projStart = '2065-05'
    var projEnd = '2098-12'
    cy.get('input#date-start-date').clear().type(`${projStart}{enter}`)
    cy.get('input#date-end-date').clear().type(`${projEnd}{enter}`)
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    cy.get('input#date-end-date').clear().type(`2095{enter}`)
    
    // When setting it back to monthly data, only the date that has been modified 
    // should have the month reset to January
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.get('input#date-start-date').should('have.value', projStart)
    cy.get('input#date-end-date').should('have.value', '2095')
  })
  it('Check that warnings appear when changing the date', () => {
    cy.get('input#date-start-date').clear().type(`2099-01{enter}`)
    cy.get('input#date-end-date').clear().type(`2099-01{enter}`)
    cy.get('*[class^="alert alert-warning"]').should('be.hidden')
    
    // When there is at least 9 months of data, the warning should display
    cy.get('input#date-end-date').clear().type(`2099-09{enter}`)
    cy.get('*[class^="alert alert-warning"]').should('be.visible')
    
    // For yearly data it appears when they are 10 years apart
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    cy.get('*[class^="alert alert-warning"]').should('be.hidden')
    cy.get('input#date-start-date').clear().type(`2090{enter}`)
    cy.get('*[class^="alert alert-warning"]').should('be.visible')
  })
  it('Download mean daily mean temperature data as projected, Spring (March-May), 10th percentile, SSP126, 2021-2050, CoverageJSON', () => {
    cy.selectVar('#var-sel-variable', 'Mean daily mean temperature', 'AirTemp')
    cy.selectRadio('option-radio-options', 'projected')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Spring (March-May)', 'MAM')
    cy.selectVar('#var-sel-ensemble-percentile', '10th percentile', '10')
    cy.selectVar('#ssp_scenario', 'SSP126', 'SSP126')
    cy.selectRadio('option-radio-time-range-type', 'P30Y-Avg')
    cy.selectVar('#var-sel-30-year-average-range', '2021-2050', '2021-2050')
    cy.selectVar('#file_download_format', 'CoverageJSON', 'json')
    
    // Ensure it is anomaly value
    cy.get('#var-sel-value-type').should('have.value', 'anomaly')
    
    // Past date selection and future date selection shouldn't be visible
    cy.get('#date-start-date').should('be.hidden')
    cy.get('#date-end-date').should('be.hidden')
    
    cy.get('#date-historical-start-date').should('be.hidden')
    cy.get('#date-historical-end-date').should('be.hidden')
    
    // Ensure that the data can be downloaded
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.type).to.equal('Coverage')
        expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
      })
    })
  })
  it('Download mean daily max temperature data as projected, Annual, 50th percentile, SSP585, 2061-2061, NetCDF', () => {
    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)
    
    cy.selectVar('#var-sel-variable', 'Mean daily max temperature', 'AirTempMax')
    cy.selectRadio('option-radio-options', 'projected')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    cy.selectVar('#var-sel-ensemble-percentile', '50th percentile', '50')
    cy.selectVar('#ssp_scenario', 'SSP585', 'SSP585')
    cy.get('#ssp_scenario').should('have.value', 'SSP585')
    cy.selectRadio('option-radio-time-range-type', 'custom')
    cy.get('input#date-start-date').clear().type('2061{enter}')
    cy.get('input#date-end-date').clear().type('2061{enter}')
    cy.wait(1000)
    cy.selectVar('#file_download_format', 'NetCDF', 'NetCDF')
    
    // Ensure it is actual value
    cy.get('#var-sel-value-type').should('have.value', 'absolute')
    
    // 30 year range and future date selection shouldn't be visible
    cy.get('#var-sel-30-year-average-range').should('be.hidden')
    
    cy.get('#date-historical-start-date').should('be.hidden')
    cy.get('#date-historical-end-date').should('be.hidden')
    
    // Ensure that the data can be downloaded
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-type']).to.equal('application/x-netcdf')
        expect(response.headers['content-disposition']).to.match(/.*2015-2100_ECCC_CanDCSU6-SSP585_AirTempMax-Pct50_Sfc_LatLon0\.86_P1Y\.nc.*$/)
      })
    })
  })
  it('Test for mean daily minimum temperature data', () => {
    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500)
    
    // Set the presets
    cy.selectVar('#var-sel-variable', 'Mean daily min temperature', 'AirTempMin')
    cy.selectRadio('option-radio-options', 'historical')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
    cy.selectVar('#var-sel-ensemble-percentile', '90th percentile', '90')
    cy.selectRadio('option-radio-time-range-type', 'custom')
    cy.get('input#date-historical-start-date').clear().type('2013-02{enter}')
    cy.get('input#date-historical-end-date').clear().type('2013-02{enter}')
    cy.wait(1000)
    
    // Ensure that 30 year selection, projected date options and scenario are not visible
    cy.get('#date-start-date').should('be.hidden')
    cy.get('#date-end-date').should('be.hidden')
    cy.get('#var-sel-30-year-average-range').should('be.hidden')
    cy.get('#ssp_scenario').should('be.hidden')
    
    // Ensure working with actual values
    cy.get('#var-sel-value-type').should('have.value', 'absolute')
    
    cy.selectVar('#file_download_format', 'CoverageJSON', 'json')
    // Ensure that the data can be downloaded
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.type).to.equal('Coverage')
        expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
      })
    })
  })
  it('Test for Precipitation data', () => {
    cy.selectVar('#var-sel-variable', 'Total precipitation', 'Precip')
    cy.selectRadio('option-radio-options', 'historical')
    cy.selectVar('#var-sel-time-interval--time-of-year', 'Annual', 'annual')
    cy.selectVar('#var-sel-ensemble-percentile', '10th percentile', '10')
    cy.selectRadio('option-radio-time-range-type', 'custom')
    cy.get('input#date-historical-start-date').clear().type('2012{enter}')
    cy.get('input#date-historical-end-date').clear().type('2013{enter}')
    cy.wait(1000)
    
    // Ensure that 30 year selection, projected date options and scenario are not visible
    cy.get('#date-start-date').should('be.hidden')
    cy.get('#date-end-date').should('be.hidden')
    cy.get('#var-sel-30-year-average-range').should('be.hidden')
    cy.get('#ssp_scenario').should('be.hidden')
    
    // Ensure working with actual values
    cy.get('#var-sel-value-type').should('have.value', 'absolute')
    
    cy.selectVar('#file_download_format', 'NetCDF', 'NetCDF')
    // Ensure that the data can be downloaded
    cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
    cy.get('a#download-url').should('have.attr', 'href').then((href) => {
      cy.request('GET', href).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.headers['content-type']).to.equal('application/x-netcdf')
        //1950-2014_ECCC_CanDCSU6_Precip-Pct10_Sfc_LatLon0.86_P1Y.nc
        expect(response.headers['content-disposition']).to.match(/.*1950-2014_ECCC_CanDCSU6_Precip-Pct10_Sfc_LatLon0\.86_P1Y\.nc.*$/)
      })
    })
  })
  
  // The following are tests for checking the values of every month in the historical monthly dataset
  // it('Initialize values for testing', () => {
  //   cy.visit('/#/candcsu6-data')
  //   cy.selectRadio('option-radio-options', 'historical')
  //   cy.selectRadio('option-radio-time-range-type', 'custom')
  //   cy.selectVar('#var-sel-time-interval--time-of-year', 'Monthly', 'monthly')
  // })
  // var firstDate = new Date('1950-01 12:00:00')
  // const valuesForTesting = []
  // var i = 0
  // var track = 0
  // while(i<65){
  //   valuesForTesting.push(track)
  //   i++
  //   if (i % 12 === 0) {
  //     // Currently at December, next test will need to loop back to January
  //     track = track+1
  //   } else{
  //     track = track + 13
  //   }
  // }
  
  // valuesForTesting.forEach(val => {
  //   var checkMonth = firstDate.getMonth() +1 + val
  //   var checkYear = firstDate.getFullYear()
  //   while(checkMonth > 12){
  //     checkMonth = checkMonth - 12
  //     checkYear = checkYear + 1
  //   }
  //   var formattedMonth = `${checkYear}-${checkMonth}`
  //   it("Check that data exists for the selected month and year", () => {
  //     Cypress.config('responseTimeout', 70000)
  //     cy.get('input#date-historical-start-date').clear().type(`${formattedMonth}{enter}`)
  //     cy.get('input#date-historical-end-date').clear().type(`${formattedMonth}{enter}`)
  //     cy.wait(5000)
  //     cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
  //     cy.get('a#download-url').should('have.attr', 'href').then((href) => {
  //       cy.request({method: 'GET', url: href, failOnStatusCode: false}).should((response) => {
  //         expect(response.status).to.equal(200)
  //       })
  //     })
  //   })
  // })
})
