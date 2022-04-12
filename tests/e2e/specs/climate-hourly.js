// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for climate hourly data with various form options', () => {
  it('Check hourly climate stations and download data as CSV', () => {
    // station data and daterange
    cy.intercept('GET', /.*\/collections\/climate-stations\/items\?.*f=json.*properties=PROV_STATE_TERR_CODE,STATION_NAME,CLIMATE_IDENTIFIER,HLY_FIRST_DATE,HLY_LAST_DATE.*/).as('stationData')
    cy.intercept('GET', /.*\/collections\/climate-hourly\/items\?.*limit=1&sortby=LOCAL_DATE.*/).as('dateRangeData')
    cy.visit('/#/hourly-climate-data')

    // open map filters box
    cy.get('#map-filters-header').scrollIntoView().wait(250).click()

    cy.wait('@stationData', {timeout: 60000}).then((xhr) => {
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
      expect(xhr.response.body.features.length).to.be.greaterThan(1090)
    })
    cy.wait('@dateRangeData', {timeout: 30000}).then((xhr) => {
      console.log(xhr)
      expect(xhr.response.headers).to.have.property('access-control-allow-headers')
      expect(xhr.response.headers).to.have.property('access-control-allow-origin')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberReturned).to.be.equal(1)
    })

    // Stations are loaded on the map as clusters
    cy.checkMarkerClusters(15)

    // geojson
    cy.selectVar('select#vector_download_format', 'CSV', 'csv')

    // Zoom in and pan map to reduce number of stations for testing
    cy.get('a.leaflet-control-zoom-in').scrollIntoView().wait(250).click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('#bbox-map').focus().type('{downarrow}').wait(500).type('{downarrow}').wait(500).type('{downarrow}').wait(500).type('{downarrow}')
    cy.get('table#station-select-table').scrollIntoView().wait(250).find('tr.selectableStation').should(($tr) => {
      expect($tr.length).to.be.lessThan(150)
      expect($tr.length).to.be.greaterThan(100)
    })

    // retrieve download list
    cy.intercept('GET', /.*\/collections\/climate-hourly\/items.*/).as('countData')
    const numMatched = 34560000
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    cy.wait('@countData', {timeout: 60000}).then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.greaterThan(numMatched)
    })
    cy.contains('#num-records-oapif-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (replace with limit 1)
    cy.get('#oapif-link-list').scrollIntoView().wait(250).should('be.visible')
    const numLinks = 3500
    cy.get('#oapif-link-list').find('a').should('have.length.of.at.most', numLinks)
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
        expect(response.body).to.match(/^x,y,STATION_NAME,CLIMATE_IDENTIFIER,ID,LOCAL_DATE,PROVINCE_CODE,LOCAL_YEAR,LOCAL_MONTH,LOCAL_DAY,LOCAL_HOUR,TEMP.*/)
      })
    })
  })

  it('Download data as GeoJSON by province', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Province
    cy.selectVar('select#cccs_province', 'British Columbia', 'BC')
    cy.get('table#station-select-table').scrollIntoView().wait(250).find('tr.selectableStation').should(($tr) => {
      expect($tr.length).to.be.greaterThan(170)
    })

    // date change
    cy.inputText('input#date-start-date', '1999-01-01{enter}')
    cy.inputText('input#date-end-date', '1999-01-31{enter}')

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    const numMatched = 58800
    cy.intercept('GET', /.*\/collections\/climate-hourly\/items\?.*PROVINCE_CODE=BC.*resulttype=hits.*f=json.*/).as('countData')
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    cy.wait('@countData', {timeout: 60000}).then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.greaterThan(numMatched)
    })
    cy.contains('#num-records-oapif-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (replace with limit 1)
    cy.get('#oapif-link-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#oapif-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.be.greaterThan(numMatched)
      })
    })
  })

  it('Download data as GeoJSON by a select few stations', () => {
    // Reset province
    cy.selectVar('select#cccs_province', '-- None --', 'null')

    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()
    cy.get('table#station-select-table').scrollIntoView().wait(250).find('tr.selectableStation').should(($tr) => {
      expect($tr.length).to.be.greaterThan(170)
    })

    // date change
    cy.inputText('input#date-start-date', '2020-01-01{enter}')
    cy.inputText('input#date-end-date', '2020-01-02{enter}')

    // Select stations by table
    cy.get('table#station-select-table').scrollIntoView().wait(250)
    cy.get('table#station-select-table tr.selectable:contains(1108395):first').click()
    cy.get('table#station-select-table tr.selectable:contains(6158731):first').click()
    cy.get('table#station-select-table tr.selectable:contains(702S006):first').click()
    cy.get('button#show-selected-stations').click()
    cy.get('table#station-select-table').find('tr.selectedStation').should(($tr) => {
      expect($tr.length).to.equal(3)
    })

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/climate-hourly\/items.*/).as('countData')
    cy.get('#retrieve-download-links').click()
    const numMatched = 70
    cy.wait('@countData', {timeout: 60000}).then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.greaterThan(numMatched)
    })
    cy.contains('#num-records-oapif-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (replace with limit 1)
    cy.get('#oapif-link-list').should('be.visible')
    cy.get('#oapif-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.be.greaterThan(numMatched)
      })
    })
  })

  it('Download data as GeoJSON by a zoomed BBOX', () => {
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
    cy.get('table#station-select-table').scrollIntoView().wait(250).find('tr.selectableStation').should(($tr) => {
      expect($tr.length).to.be.lessThan(200)
    })

    // date change
    cy.inputText('input#date-start-date', '2010-08-08{enter}')
    cy.inputText('input#date-end-date', '2010-08-09{enter}')

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/climate-hourly\/items.*/).as('countData')
    const numMatched = 730
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    cy.wait('@countData', {timeout: 60000}).then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.greaterThan(numMatched)
    })
    cy.contains('#num-records-oapif-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (replace with limit 1)
    cy.get('#oapif-link-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#oapif-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.be.greaterThan(numMatched)
      })
    })
  })
})
