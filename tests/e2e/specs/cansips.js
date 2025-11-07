// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for CanSIPS ogc-api-coverage data with various form options', () => {
    it('Test startup values', () => {
        cy.visit('/#/seasonal-forecasts')

        cy.get('#var-sel-interval-type').should('have.value', 'monthly-products')
        cy.get('#var-sel-variable').should('have.value', 'AirTemp')
        cy.get('#var-sel-forecasted-probability').should('have.value', '-ProbNearNormal')

        // Get the current month and year
        const currDate = new Date().toJSON().slice(0, 7);

        cy.get('#date-model-run-month').should('have.value', currDate)
        cy.get('#var-sel-forecast-period').should('have.value', 'P00M')
        cy.get('#file_download_format').should('have.value', 'json')
    })
    it('Test download monthly air temp data', () => {
        cy.selectVar('#var-sel-interval-type', 'Monthly', 'monthly-products')
        cy.selectVar('#var-sel-variable', 'Air temperature', 'AirTemp')
        cy.selectVar('#var-sel-forecasted-probability', 'Probability near normal', '-ProbNearNormal')
        cy.inputText('#date-model-run-month', '2025-03{enter}')
        cy.selectVar('#var-sel-forecast-period', '2025-03 (P00M)', 'P00M')

        cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.type).to.equal('Coverage')
                expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
            })
        })

        // Change the period
        cy.selectVar('#var-sel-forecast-period', '2026-02 (P11M)', 'P11M')
        cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.type).to.equal('Coverage')
                expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
            })
        })
    })
    it('Test download seasonal air temp data', () => {
        cy.selectVar('#var-sel-interval-type', 'Seasonally', 'seasonal-products')
        cy.inputText('#date-model-run-month', `2023-10{enter}`)
        //cy.selectVar('#var-sel-forecast-period', '2023-10 to 2023-12 (P00M-P02M)', 'P00M-P02M')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.type).to.equal('Coverage')
                expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
            })
        })
    })
    it("Test changing forecast periods for different interval types", () => {
        // Set values for monthly interval
        cy.selectVar('#var-sel-interval-type', 'Monthly', 'monthly-products')
        cy.inputText('#date-model-run-month', `2025-05{enter}`)
        cy.selectVar('#var-sel-variable', 'Air temperature', 'AirTemp')
        cy.selectVar('#var-sel-forecasted-probability', 'Probability near normal', '-ProbNearNormal')
        cy.selectVar('#var-sel-forecast-period', '2025-06 (P01M)', 'P01M')

        // Next, it is changed to the seasonal interval, and the forecast period should change as desired

        // Periods for all seasonal gpt products
        var expectedPeriods = '2025-05 to 2025-07 (P00M-P02M)' +
                              '2025-06 to 2025-08 (P01M-P03M)' +
                              '2025-07 to 2025-09 (P02M-P04M)' +
                              '2025-08 to 2025-10 (P03M-P05M)' +
                              '2025-09 to 2025-11 (P04M-P06M)' +
                              '2025-10 to 2025-12 (P05M-P07M)' +
                              '2025-11 to 2026-01 (P06M-P08M)' +
                              '2025-12 to 2026-02 (P07M-P09M)' +
                              '2026-01 to 2026-03 (P08M-P10M)' +
                              '2026-02 to 2026-04 (P09M-P11M)'

        // Periods for seasonal probability products
        const expectedPeriodsSeasonalProb = '2025-05 to 2025-07 (P00M-P02M)' +
                                            '2025-06 to 2025-08 (P01M-P03M)' +
                                            '2025-08 to 2025-10 (P03M-P05M)' +
                                            '2025-11 to 2026-01 (P06M-P08M)' +
                                            '2026-02 to 2026-04 (P09M-P11M)'

        cy.selectVar('#var-sel-interval-type', 'Seasonally', 'seasonal-products')
        cy.get('#var-sel-forecast-period').should('have.value', 'P00M-P02M').should('have.text', expectedPeriodsSeasonalProb)

        // Then we change it back to monthly to ensure that the dates are displayed properly
        cy.selectVar('#var-sel-interval-type', 'Monthly', 'monthly-products')

        const expectedPeriodsMonth = '2025-05 (P00M)' +
                                     '2025-06 (P01M)' +
                                     '2025-07 (P02M)' +
                                     '2025-08 (P03M)' +
                                     '2025-09 (P04M)' +
                                     '2025-10 (P05M)' +
                                     '2025-11 (P06M)' +
                                     '2025-12 (P07M)' +
                                     '2026-01 (P08M)' +
                                     '2026-02 (P09M)' +
                                     '2026-03 (P10M)' +
                                     '2026-04 (P11M)'
        cy.get('#var-sel-forecast-period').should('have.value', 'P00M').should('have.text', expectedPeriodsMonth)

        // Also check that other seasonal is ok
        cy.selectVar('#var-sel-interval-type', 'Seasonally', 'seasonal-products')
        cy.selectVar('#var-sel-forecasted-probability', 'Probability above 40th percentile', '-ProbGT40Pct')
        cy.get('#var-sel-forecast-period').should('have.value', 'P00M-P02M').should('have.text', expectedPeriods)

    })
    it("Testing that options for monthly data can be shown as JSON", () => {
        // First set the data download to monthly airtemp
        cy.selectVar('#var-sel-interval-type', 'Monthly', 'monthly-products')
        cy.inputText('#date-model-run-month', `2025-03{enter}`)
        cy.selectVar('#var-sel-variable', 'Air temperature', 'AirTemp')
        cy.selectVar('#var-sel-forecasted-probability', 'Probability below normal', '-ProbBelowNormal')

        // Test that it works with this configuration
        cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.type).to.equal('Coverage')
                expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
            })
        })

        // Now change the probability and see that it can be downloaded
        cy.selectVar('#var-sel-forecasted-probability', 'Probability above 70th percentile', '-ProbGT70Pct')
        cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.type).to.equal('Coverage')
                expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
            })
        })

        // Next change to Precipitation data
        cy.selectVar('#var-sel-variable', 'Precipitation', 'PrecipAccum')
        cy.selectVar('#var-sel-forecasted-probability', 'Probability above 70th percentile', '-ProbGT70Pct')
        cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.type).to.equal('Coverage')
                expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
            })
        })

        // Lastly, test a different probability for Precipitation
        cy.selectVar('#var-sel-forecasted-probability', 'Probability below normal', '-ProbBelowNormal')
        cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.type).to.equal('Coverage')
                expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
            })
        })
    })
    it("Testing that options for seasonal data can be shown as JSON", () => {
        // First set the data download to seasonal airtemp
        cy.selectVar('#var-sel-interval-type', 'Seasonally', 'seasonal-products')
        cy.inputText('#date-model-run-month', `2025-03{enter}`)
        cy.selectVar('#var-sel-variable', 'Air temperature', 'AirTemp')
        cy.selectVar('#var-sel-forecasted-probability', 'Probability below normal', '-ProbBelowNormal')

        // Test that it works with this configuration
        cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.type).to.equal('Coverage')
                expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
            })
        })

        // Now change the probability and see that it can be downloaded
        cy.selectVar('#var-sel-forecasted-probability', 'Probability above 70th percentile', '-ProbGT70Pct')
        cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.type).to.equal('Coverage')
                expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
            })
        })

        // Next change to Precipitation data
        cy.selectVar('#var-sel-variable', 'Precipitation', 'PrecipAccum')
        cy.selectVar('#var-sel-forecasted-probability', 'Probability above 70th percentile', '-ProbGT70Pct')
        cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.type).to.equal('Coverage')
                expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
            })
        })

        // Lastly, test a different probability for Precipitation
        cy.selectVar('#var-sel-forecasted-probability', 'Probability below normal', '-ProbBelowNormal')
        cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.body.type).to.equal('Coverage')
                expect(response.headers['content-type']).to.equal('application/prs.coverage+json')
            })
        })
    })
    it("Test download in GRIB format", () => {
        // For this test, specify the properties:
        cy.selectVar('#var-sel-interval-type', 'Monthly', 'monthly-products')
        cy.inputText('#date-model-run-month', `2025-03{enter}`)
        cy.selectVar('#var-sel-variable', 'Air temperature', 'AirTemp')
        cy.selectVar('#var-sel-forecasted-probability', 'Probability above normal', '-ProbAboveNormal')
        cy.selectVar('#var-sel-forecast-period', '2025-03 (P00M)', 'P00M')
        cy.selectVar('#file_download_format', 'GRIB', 'GRIB')
        // visit download link
        cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
        cy.get('a#download-url').should('have.attr', 'href').then((href) => {
            cy.request('GET', href).then((response) => {
                expect(response.status).to.equal(200)
                expect(response.headers['content-type']).to.equal('application/x-grib2')
            })
        })
    })

    /**
     * The following are a series of tests created to check if data exists for all months and
     * periods of specified configurations.
     *
     * This no longer works due to the current implementation preventing users from selecting
     * a period and date combination where data is not recorded.
     *
     * It can be reworked for extensive testing if it is needed to find specific combinations
     * where data is missing.
     *
     * It is commented out below.
     */

    /**
    // When these tests were created seasonal probability products had a lower date bound of 2023-10
    var firstDate = new Date('2023-10 12:00:00')
    const periods = ['P00M-P02M', "P01M-P03M",
                "P02M-P04M", 'P03M-P05M', "P04M-P06M",
                "P05M-P07M", 'P06M-P08M', "P07M-P09M",
                "P08M-P10M", 'P09M-P11M']
    const valuesForTesting = []
    // Between (and including) 2023-10 to 2025-06 there are 21 months
    for(var i=0; i<21; i++){
        periods.forEach(period => {
            var needToChange = (period === 'P00M-P02M')
            valuesForTesting.push([i, period, needToChange])
        })
    }

    // Tests are dynamically created. One for each entry in valuesForTesting
    valuesForTesting.forEach(val => {
        var checkMonth = firstDate.getMonth() +1 + val[0]
        var checkYear = firstDate.getFullYear()

        while(checkMonth > 12){
            checkMonth = checkMonth - 12
            checkYear = checkYear + 1
        }
        var formattedMonth = `${checkYear}-${checkMonth}`
        it("Test current combination of CANSIPS product options", () => {
            if(val[2] === true){
                cy.inputText('#date-model-run-month', formattedMonth + '{enter}').wait(1050)
            }
            cy.get('#var-sel-forecast-period').select(val[1])

            // Now select the download link and check if it works
            cy.get('#url-download-box').scrollIntoView().wait(250).should('be.visible')
            cy.get('a#download-url').should('have.attr', 'href').then((href) => {
                cy.request({method: 'GET', url: href, failOnStatusCode: false}).should((response) => {
                    expect(response.status).to.equal(200)
                })
            })
        })
    })*/
})
