// https://docs.cypress.io/api/introduction/api.html

describe('E2E test for climate monthly data with various form options', () => {
  it('Check climate monthly stations and download data as CSV', () => {
    // station data and daterange
    cy.intercept('GET', /.*\/collections\/climate-stations\/items\?.*HAS_MONTHLY_SUMMARY=Y.*f=json.*/).as('stationData')
    cy.intercept('GET', /.*\/collections\/climate-monthly\/items\?.*sortby=LOCAL_DATE&limit=1.*f=json.*/).as('dateRangeData')
    cy.visit('/#/monthly-climate-summaries')
    cy.wait('@stationData', {timeout: 30000}).then((xhr) => {
      expect(xhr.response.headers).to.have.property('access-control-allow-headers')
      expect(xhr.response.headers).to.have.property('access-control-allow-origin')
      expect(xhr.response.headers).to.have.property('content-encoding')
      expect(xhr.response.headers['content-encoding']).to.match(/gzip/ig)
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.features.length).to.be.greaterThan(8200)
    })
    cy.wait('@dateRangeData', {timeout: 20000}).then((xhr) => {
      expect(xhr.response.headers).to.have.property('access-control-allow-headers')
      expect(xhr.response.headers).to.have.property('access-control-allow-origin')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberReturned).to.be.equal(1)
    })

    // Stations are loaded on the map as clusters
    cy.checkMarkerClusters(10)

    // geojson
    cy.selectVar('select#vector_download_format', 'CSV', 'csv')

    // retrieve download list
    cy.intercept('GET', /.*\/collections\/climate-monthly\/items.*/).as('countData')
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    cy.wait('@countData', {timeout: 20000}).then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.greaterThan(1835000)
    })
    cy.contains('#num-records-wfs3-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (limit 1)
    cy.get('#wfs3-link-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#wfs3-link-list').find('a').should('have.lengthOf', 13)
    cy.get('#wfs3-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.headers).to.have.property('content-encoding')
        expect(response.headers['content-encoding']).to.match(/gzip/ig)
        expect(response.status).to.equal(200)
        expect(response.body).to.match(/^x,y,LATITUDE,LONGITUDE,STATION_NAME,CLIMATE_IDENTIFIER,ID,.*/)
      })
    })
  })

  it('Download data as GeoJSON by province', () => {
    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Province
    cy.selectVar('select#cccs_province', 'British Columbia', 'BC')
    cy.get('table#station-select-table').scrollIntoView().wait(250).find('tr.selectedStation').should(($tr) => {
      expect($tr.length).to.be.greaterThan(1600)
    })

    // date change
    cy.inputText('input#date-start-date', '1899-01{enter}')
    cy.inputText('input#date-end-date', '2020-12{enter}')

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/climate-monthly\/items\?.*PROVINCE_CODE=BC.*resulttype=hits.*f=json.*/).as('countData')
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    cy.wait('@countData', {timeout: 20000}).then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.greaterThan(375000)
    })
    cy.contains('#num-records-wfs3-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (limit 1)
    cy.get('#wfs3-link-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#wfs3-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.be.greaterThan(375000)
      })
    })
  })

  it('Download data as GeoJSON by a select few stations', () => {
    // Reset province
    cy.selectVar('select#cccs_province', '-- None --', 'null')

    // Reset map
    cy.get('#reset-map-view').scrollIntoView().wait(250).click()

    // Select stations by table
    cy.get('table#station-select-table').scrollIntoView().wait(250)
    cy.get('table#station-select-table tr.selectable:contains(1108395):first').click()
    cy.get('table#station-select-table tr.selectable:contains(6158731):first').click()
    cy.get('table#station-select-table tr.selectable:contains(702S006):first').click()
    cy.get('button#show-selected-stations').click()
    cy.get('table#station-select-table').find('tr.selectedStation').should(($tr) => {
      expect($tr.length).to.equal(3)
    })

    // date change
    cy.inputText('input#date-start-date', '2000-01{enter}')
    cy.inputText('input#date-end-date', '2010-12{enter}')

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/climate-monthly\/items.*/).as('countData')
    cy.get('#retrieve-download-links').click()
    cy.wait('@countData', {timeout: 20000}).then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.equal(85)
    })
    cy.contains('#num-records-wfs3-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (limit 1)
    cy.get('#wfs3-link-list').should('be.visible')
    cy.get('#wfs3-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.be.greaterThan(80)
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
    cy.inputText('input#date-start-date', '2010-01{enter}')
    cy.inputText('input#date-end-date', '2020-12{enter}')

    // geojson
    cy.selectVar('select#vector_download_format', 'GeoJSON', 'geojson')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/climate-monthly\/items.*/).as('countData')
    cy.get('#retrieve-download-links').scrollIntoView().wait(250).click()
    cy.wait('@countData', {timeout: 20000}).then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.greaterThan(3900)
    })
    cy.contains('#num-records-wfs3-download', /Total number of records: \d+/).should('be.visible')

    // visit download link (limit 1)
    cy.get('#wfs3-link-list').scrollIntoView().wait(250).should('be.visible')
    cy.get('#wfs3-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.be.greaterThan(3900)
      })
    })
  })
})
