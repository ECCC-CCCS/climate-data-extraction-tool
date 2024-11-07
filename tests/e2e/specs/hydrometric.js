// https://docs.cypress.io/api/introduction/api.html

const TIMEOUT_MS = 50000;
const INTERVAL_MS = 10000;
const CURRENT_DATE = new Date().toJSON(); // ie. 2022-06-17T11:06:50.369Z
const CURRENT_YYYY_MM_DD = CURRENT_DATE.slice(0, 10) // ie. "2022-06-17"
const CURRENT_YYYY_MM = CURRENT_DATE.slice(0, 7) // ie. "2022-06"

describe('E2E test for hydrometric data with various form options', () => {
  it('Check hydrometric stations and download daily mean data as CSV', () => {
    // station data
    cy.intercept('GET', /.*\/collections\/hydrometric-stations\/items\?.*f=json.*STATUS_EN=Active.*/).as('stationData')
    cy.visit('/#/water-quantity-data')
    const maxNumStations = 2820 // actual 2817

    // open map filters box
    cy.get('#map-filters-header').scrollIntoView().wait(250).click()
    cy.wait('@stationData', {timeout: TIMEOUT_MS}).then((xhr) => {
      expect(xhr.response.headers).to.have.property('access-control-allow-headers')
      expect(xhr.response.headers).to.have.property('access-control-allow-origin')
      try {
        expect(xhr.response.headers).to.have.property('content-encoding')
        expect(xhr.response.headers['content-encoding']).to.match(/gzip/ig)
      } catch {
        cy.log('content-encoding does not exist in response header. Test continued.')
      }
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.features.length).to.be.lessThan(maxNumStations)
    })

    // discontinued stations
    cy.intercept('GET', /.*\/collections\/hydrometric-stations\/items\?f=json&limit=10000&properties=PROV_TERR_STATE_LOC,STATION_NAME,STATION_NUMBER,STATUS_EN$/).as('entireStationData')
    cy.get('#toggle-discontinued-stations').click()
    const maxNumStationsDiscontinued = 7970 // actual: 7969
    cy.wait('@entireStationData', {timeout: TIMEOUT_MS}).then((xhr) => {
      expect(xhr.response.headers).to.have.property('access-control-allow-headers')
      expect(xhr.response.headers).to.have.property('access-control-allow-origin')
      try {
        expect(xhr.response.headers).to.have.property('content-encoding')
        expect(xhr.response.headers['content-encoding']).to.match(/gzip/ig)
      } catch {
        cy.log('content-encoding does not exist in response header. Test continued.')
      }
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.features.length).to.be.lessThan(maxNumStationsDiscontinued)
    })
    cy.get('table#station-select-table').scrollIntoView().wait(250).find('tr.selectableStation').should(($tr) => {
      expect($tr.length).to.be.lessThan(maxNumStationsDiscontinued)
    })

    // Remove showing discontinued stations
    cy.get('#toggle-discontinued-stations').click()
    cy.get('table#station-select-table').scrollIntoView().wait(250).find('tr.selectableStation').should(($tr) => {
      expect($tr.length).to.be.lessThan(maxNumStations)
    })

    // Stations are loaded on the map as clusters
    cy.checkMarkerClusters(8)

    // value type
    cy.selectVar('select#var-sel-value-type--time-interval', 'Daily mean', 'hydrometric-daily-mean')

    // date change
    cy.inputText('input#date-start-date', '2023-12-01{enter}')
    cy.inputText('input#date-end-date', `${CURRENT_YYYY_MM_DD}{enter}`)

    // geojson
    cy.selectVar('select#vector_download_format', 'CSV', 'csv')

    // retrieve download list
    const maxNumberMatched = 38410 // actual: 38405
    cy.intercept('GET', /.*\/collections\/hydrometric-daily-mean\/items.*/).as('countData')
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    cy.waitUntil(() => cy.wait('@countData').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.at.most(maxNumberMatched)
    }), {
      errorMsg: 'Timeout reached', // overrides the default error message
      timeout: TIMEOUT_MS, // waits up to TIMEOUT_MS, default to 6500 ms
      interval: INTERVAL_MS, // performs the check every INTERVAL_MS, default to 2000 ms
      verbose: true, // log the progress, default to false
      customCheckMessage: 'WaitUntil Check Happened' // check message, happens for every single check
    })
    cy.contains('#num-records-oapif-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (replace with limit 1)
    cy.get('#oapif-link-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#oapif-link-list').find('a').should('have.length.of.at.most', 6510)
    cy.get('#oapif-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited, { timeout: 40000 }).then((response) => {
        try {
          expect(response.headers).to.have.property('content-encoding')
          expect(response.headers['content-encoding']).to.match(/gzip/ig)
        } catch {
          cy.log('content-encoding does not exist in response header. Test continued.')
        }
        expect(response.status).to.equal(200)
        // expect(response.body).to.match(/^x,y,IDENTIFIER,STATION_NAME,STATION_NUMBER,PROV_TERR_STATE_LOC,DATE,LEVEL,DISCHARGE,DISCHARGE_SYMBOL_EN,DISCHARGE_SYMBOL_FR,LEVEL_SYMBOL_EN,LEVEL_SYMBOL_FR.*/)
        expect(response.body).to.include('IDENTIFIER')
        expect(response.body).to.include('PROV_TERR_STATE_LOC')
      })
    })
  })

  it('Download monthly mean data as GeoJSON by province', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Province
    const maxStations = 460 // actual: 460
    cy.selectVar('select#cccs_province', 'British Columbia', 'BC')
    cy.get('table#station-select-table').scrollIntoView().wait(250).find('tr.selectableStation').should(($tr) => {
      expect($tr.length).to.be.at.most(maxStations)
    })

    // value type
    cy.selectVar('select#var-sel-value-type--time-interval', 'Monthly mean', 'hydrometric-monthly-mean')

    // date change
    cy.inputText('input#date-start-date', '1986-03{enter}')
    cy.inputText('input#date-end-date', `${CURRENT_YYYY_MM}{enter}`)

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/hydrometric-monthly-mean\/items\?.*PROV_TERR_STATE_LOC=BC.*resulttype=hits.*f=json.*/).as('countData')
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    let maxMonthlyMean = 205690 // actual: 205684
    cy.waitUntil(() => cy.wait('@countData').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.at.most(maxMonthlyMean)
    }), {
      errorMsg: 'Timeout reached', // overrides the default error message
      timeout: TIMEOUT_MS, // waits up to TIMEOUT_MS, default to 6500 ms
      interval: INTERVAL_MS, // performs the check every INTERVAL_MS, default to 2000 ms
      verbose: true, // log the progress, default to false
      customCheckMessage: 'WaitUntil Check Happened' // check message, happens for every single check
    })
    cy.contains('#num-records-oapif-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (replace with limit 1)
    cy.get('#oapif-link-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#oapif-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited, { timeout: 40000 }).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.be.at.most(maxMonthlyMean)
      })
    })
  })

  it('Download annual peaks as GeoJSON by a select few stations', () => {
    // Reset province
    cy.selectVar('select#cccs_province', '-- None --', 'null')

    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Select stations by table
    cy.get('table#station-select-table').scrollIntoView().wait(250)
    cy.get('table#station-select-table tr.selectable:contains(08GA030):first').click()
    cy.get('table#station-select-table tr.selectable:contains(02HC048):first').click()
    cy.get('table#station-select-table tr.selectable:contains(02OA016):first').click()
    cy.get('button#show-selected-stations').click()
    cy.get('table#station-select-table').find('tr.selectedStation').should(($tr) => {
      expect($tr.length).to.equal(3)
    })

    // value type
    cy.selectVar('select#var-sel-value-type--time-interval', 'Annual max/min', 'hydrometric-annual-peaks')

    // date change
    cy.inputText('input#date-start-date', '2010-01-01{enter}')
    cy.inputText('input#date-end-date', `${CURRENT_YYYY_MM_DD}{enter}`)

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/hydrometric-annual-peaks\/items.*/).as('countData')
    cy.get('#retrieve-download-links').click()
    let numAnnualPeaks = 88 // actual: 88
    cy.waitUntil(() => cy.wait('@countData').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.equal(numAnnualPeaks)
    }), {
      errorMsg: 'Timeout reached', // overrides the default error message
      timeout: TIMEOUT_MS, // waits up to TIMEOUT_MS, default to 6500 ms
      interval: INTERVAL_MS, // performs the check every INTERVAL_MS, default to 2000 ms
      verbose: true, // log the progress, default to false
      customCheckMessage: 'WaitUntil Check Happened' // check message, happens for every single check
    })
    cy.contains('#num-records-oapif-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (replace with limit 1)
    cy.get('#oapif-link-list').should('be.visible')
    cy.get('#oapif-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.equal(numAnnualPeaks)
      })
    })
  })

  it('Download daily max/min as GeoJSON by a zoomed BBOX', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Reset station selection
    cy.get('#clear-selected-stations').scrollIntoView().wait(250).click({force: true})

    cy.get('#map-loading-screen').should('be.hidden')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500) // mimic user pause after a zoom click
    let maxNumStations = 55 // actual: 50
    cy.get('table#station-select-table').scrollIntoView().wait(250).find('tr.selectableStation').should(($tr) => {
      expect($tr.length).to.be.lessThan(maxNumStations)
    })

    // value type
    cy.selectVar('select#var-sel-value-type--time-interval', 'Daily max/min', 'hydrometric-annual-statistics')

    // date change
    cy.inputText('input#date-start-date', '2010-01-01{enter}')
    cy.inputText('input#date-end-date', `${CURRENT_YYYY_MM_DD}{enter}`)

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/hydrometric-annual-statistics\/items.*/).as('countData')
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    let maxAnnualStats = 800 // actual: 800
    cy.waitUntil(() => cy.wait('@countData').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.at.most(maxAnnualStats)
    }), {
      errorMsg: 'Timeout reached', // overrides the default error message
      timeout: TIMEOUT_MS, // waits up to TIMEOUT_MS, default to 6500 ms
      interval: INTERVAL_MS, // performs the check every INTERVAL_MS, default to 2000 ms
      verbose: true, // log the progress, default to false
      customCheckMessage: 'WaitUntil Check Happened' // check message, happens for every single check
    })
    cy.contains('#num-records-oapif-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (replace with limit 1)
    cy.get('#oapif-link-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#oapif-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.be.at.most(maxAnnualStats)
      })
    })
  })
})