// https://docs.cypress.io/api/introduction/api.html

const TIMEOUT_MS = 6500;
const INTERVAL_MS = 2000;

describe('E2E test for LTCE data with various form options', () => {
  it('Check LTCE stations and download temperature data as CSV', () => {
    // station data
    cy.intercept('GET', /.*\/collections\/ltce-stations\/items\?.*f=json.*ELEMENT_NAME_E=TEMPERATURE.*offset=0.*/).as('stationData')
    cy.visit('/#/daily-climate-records')

    // open map filters box
    cy.get('#map-filters-header').scrollIntoView().wait(250).click()

    cy.waitUntil(() => cy.wait('@stationData').then((xhr) => {
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
      expect(xhr.response.body.features.length).to.equal(5819)
    }), {
      errorMsg: 'Timeout reached', // overrides the default error message
      timeout: TIMEOUT_MS, // waits up to TIMEOUT_MS, default to 6500 ms
      interval: INTERVAL_MS, // performs the check every INTERVAL_MS, default to 2000 ms
      verbose: true, // log the progress, default to false
      customCheckMessage: 'WaitUntil Check Happened' // check message, happens for every single check
    })


    // Stations are loaded on the map as clusters
    cy.checkMarkerClusters(10)

    // value type
    cy.selectVar('select#var-sel-climate-element--record-type', 'Temperature - Daily extremes of record', 'ltce-temperature')
    cy.get('#map-loading-screen').should('be.hidden')

    // date change
    cy.selectVar('#var-sel-local_month', 'All months', 'all')
    cy.selectVar('#var-sel-local_day', 'All 366 days of the year', 'all')

    // geojson
    cy.selectVar('select#vector_download_format', 'CSV', 'csv')

    // retrieve download list
    cy.intercept('GET', /.*\/collections\/ltce-temperature\/items.*resulttype=hits.*/).as('countData')
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    cy.waitUntil(() => cy.wait('@countData').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.greaterThan(260000)
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
    cy.get('#oapif-link-list').find('a').should('have.length.of.at.most', 30)
    cy.get('#oapif-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        try {
          expect(response.headers).to.have.property('content-encoding')
          expect(response.headers['content-encoding']).to.match(/gzip/ig)
        } catch {
          cy.log('content-encoding does not exist in response header. Test continued.')
        }
        expect(response.status).to.equal(200)
        expect(response.body).to.match(/^.*VIRTUAL_CLIMATE_ID.*RECORD_HIGH_MAX_TEMP_YR.*/)
      })
    })
  })

  it('Download temperature data as GeoJSON by province', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // value type
    cy.selectVar('select#var-sel-climate-element--record-type', 'Temperature - Daily extremes of record', 'ltce-temperature')
    cy.get('#map-loading-screen').should('be.hidden')

    // Province
    cy.selectVar('select#cccs_province', 'British Columbia', 'BC')
    cy.get('table#station-select-table').scrollIntoView().wait(250).find('tr.selectableStation').should(($tr) => {
      expect($tr.length).to.equal(95)
    })

    // date change
    cy.selectVar('#var-sel-local_month', '03 - March', '03')
    cy.selectVar('#var-sel-local_day', 'All 31 days of the month', 'all')

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/ltce-temperature\/items\?.*LOCAL_MONTH=03.*PROVINCE_CODE=BC.*resulttype=hits.*f=json.*/).as('countData')
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    cy.waitUntil(() => cy.wait('@countData').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.greaterThan(2898)
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
        expect(response.body.numberMatched).to.be.greaterThan(2898)
      })
    })
  })

  it('Download precipitation as GeoJSON by a select few stations', () => {
    // Reset province
    cy.selectVar('select#cccs_province', '-- None --', 'null')

    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // value type
    cy.intercept('GET', /.*\/collections\/ltce-stations\/items\?.*f=json.*ELEMENT_NAME_E=PRECIPITATION.*offset=0.*/).as('stationData')
    cy.selectVar('select#var-sel-climate-element--record-type', 'Precipitation - Daily extremes of record', 'ltce-precipitation')
    cy.waitUntil(() => cy.wait('@stationData').then((xhr) => {
      expect(xhr.response.headers).to.have.property('access-control-allow-headers')
      expect(xhr.response.headers).to.have.property('access-control-allow-origin')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.features.length).to.equal(2898)
    }), {
      errorMsg: 'Timeout reached', // overrides the default error message
      timeout: TIMEOUT_MS, // waits up to TIMEOUT_MS, default to 6500 ms
      interval: INTERVAL_MS, // performs the check every INTERVAL_MS, default to 2000 ms
      verbose: true, // log the progress, default to false
      customCheckMessage: 'WaitUntil Check Happened' // check message, happens for every single check
    })

    cy.get('#map-loading-screen').should('be.hidden')

    // Select stations by table
    cy.get('table#station-select-table').scrollIntoView().wait(250)
    cy.get('table#station-select-table tr.selectable:contains(VSBC74V):first').click()
    cy.get('table#station-select-table tr.selectable:contains(VSON143):first').click()
    cy.get('table#station-select-table tr.selectable:contains(VSQC76V):first').click()
    cy.get('button#show-selected-stations').click()
    cy.get('table#station-select-table').find('tr.selectedStation').should(($tr) => {
      expect($tr.length).to.equal(3)
    })

    // date change
    cy.selectVar('#var-sel-local_month', '10 - October', '10')
    cy.selectVar('#var-sel-local_day', '31', '31')

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/ltce-precipitation\/items.*resulttype=hits.*/).as('countData')
    cy.get('#retrieve-download-links').click()
    cy.waitUntil(() => cy.wait('@countData').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.equal(3)
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
        expect(response.body.numberMatched).to.equal(3)
      })
    })
  })

  it('Download daily max/min as GeoJSON by a zoomed BBOX', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Reset station selection
    cy.get('#clear-selected-stations').scrollIntoView().wait(250).click({force: true})

    // value type
    cy.intercept('GET', /.*\/collections\/ltce-stations\/items\?.*f=json.*ELEMENT_NAME_E=SNOWFALL.*offset=0.*/).as('stationData')
    cy.selectVar('select#var-sel-climate-element--record-type', 'Snowfall - Daily extremes of record', 'ltce-snowfall')
    cy.waitUntil(() => cy.wait('@stationData').then((xhr) => {
      expect(xhr.response.headers).to.have.property('access-control-allow-headers')
      expect(xhr.response.headers).to.have.property('access-control-allow-origin')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.features.length).to.be.greaterThan(2270)
    }), {
      errorMsg: 'Timeout reached', // overrides the default error message
      timeout: TIMEOUT_MS, // waits up to TIMEOUT_MS, default to 6500 ms
      interval: INTERVAL_MS, // performs the check every INTERVAL_MS, default to 2000 ms
      verbose: true, // log the progress, default to false
      customCheckMessage: 'WaitUntil Check Happened' // check message, happens for every single check
    })

    cy.get('#map-loading-screen').should('be.hidden')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('table#station-select-table').scrollIntoView().wait(250).find('tr.selectableStation').should(($tr) => {
      expect($tr.length).to.be.lessThan(200)
    })

    // date change
    cy.selectVar('#var-sel-local_month', '12 - December', '12')
    cy.selectVar('#var-sel-local_day', '25', '25')

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/ltce-snowfall\/items.*resulttype=hits.*/).as('countData')
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    cy.waitUntil(() => cy.wait('@countData').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.equal(14)
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
        expect(response.body.numberMatched).to.be.equal(14)
      })
    })
  })
})
