// https://docs.cypress.io/api/introduction/api.html

describe('CCCS Query UI E2E Test', () => {
  it('Gets expected response of AHCCD stations and loaded into leaflet map and download trends as CSV', () => {
    cy.intercept('GET', /.*\/collections\/ahccd-stations\/items\?.*f=json.*/)
      .as('ahccdStations')
    cy.visit('/#/adjusted-station-data')
    cy.wait('@ahccdStations').then((xhr) => {
      expect(xhr.response.headers).to.have.property('access-control-allow-headers')
      expect(xhr.response.headers).to.have.property('access-control-allow-origin')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.features.length).to.be.greaterThan(1300)
    })

    // Stations are loaded on the map as clusters
    cy.get('div.leaflet-container div.leaflet-map-pane div.leaflet-marker-pane')
      .find('div.marker-cluster')
      .should(($div) => {
        expect($div.length).to.be.greaterThan(10)
      })

    // csv
    cy.get('select#vector_download_format')
      .select('CSV')
      .should('have.value', 'csv')

    // ahccd-annual
    cy.get('select#var-sel-value-type--time-interval')
      .select('Trend values')
      .should('have.value', 'ahccd-trends')

    // date selections are removed
    cy.get('#date-range-field')
      .should('be.hidden')

    // retrieve download list
    cy.intercept('GET', /.*\/collections\/ahccd-trends\/items.*/)
      .as('countSelectTrend')
    cy.get('#retrieve-download-links').click()
    cy.contains('#num-records-wfs3-download', /Total number of records: \d+/).should('be.visible')
    cy.wait('@countSelectTrend').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.greaterThan(87000)
    })

    // visit download link (limit 1)
    cy.get('#wfs3-link-list').should('be.visible')
    cy.get('#wfs3-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body).to.match(/^x,y,.*station_id__id_station.*province__province.*year.*trend_value__valeur_tendance.*/)
      })
    })
  })

  it('Performs a data download annual values by province', () => {
    cy.visit('/#/adjusted-station-data')
    cy.get('select#cccs_province')
      .select('British Columbia')
      .should('have.value', 'BC')

    cy.get('table#station-select-table')
      .find('tr.selectedStation')
      .should(($tr) => {
        expect($tr.length).to.be.greaterThan(240)
      })

    // geojson
    cy.get('select#vector_download_format')
      .select('GeoJSON')
      .should('have.value', 'geojson')

    // ahccd-annual
    cy.get('select#var-sel-value-type--time-interval')
      .select('Annual values')
      .should('have.value', 'ahccd-annual')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/ahccd-annual\/items\?.*province__province=BC.*resulttype=hits.*f=json.*/)
      .as('countProvinceAnnual')
    cy.get('#retrieve-download-links').click()
    cy.contains('#num-records-wfs3-download', /Total number of records: \d+/).should('be.visible')
    cy.wait('@countProvinceAnnual').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.greaterThan(20700) // 20771
    })

    // visit download link (limit 1)
    cy.get('#wfs3-link-list').should('be.visible')
    cy.get('#wfs3-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.be.greaterThan(20700)
      })
    })
  })

  it('Performs a data download seasonal values by a select few stations', () => {
    cy.visit('/#/adjusted-station-data')

    // Select stations by table
    cy.get('table#station-select-table tr.selectable:contains(1100030):first').click()
    cy.get('table#station-select-table tr.selectable:contains(4020020):first').click()
    cy.get('table#station-select-table tr.selectable:contains(7100075):first').click()
    cy.get('button#show-selected-stations').click()
    cy.get('table#station-select-table')
      .find('tr.selectedStation')
      .should(($tr) => {
        expect($tr.length).to.equal(3)
      })

    // geojson
    cy.get('select#vector_download_format')
      .select('GeoJSON')
      .should('have.value', 'geojson')

    // ahccd-seasonal
    cy.get('select#var-sel-value-type--time-interval')
      .select('Seasonal values')
      .should('have.value', 'ahccd-seasonal')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/ahccd-seasonal\/items.*/)
      .as('countSelectSeasonal')
    cy.get('#retrieve-download-links').click()
    cy.contains('#num-records-wfs3-download', /Total number of records: \d+/).should('be.visible')
    cy.wait('@countSelectSeasonal').then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.equal(708)
    })

    // visit download link (limit 1)
    cy.get('#wfs3-link-list').should('be.visible')
    cy.get('#wfs3-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.be.greaterThan(700)
      })
    })
  })

  it('Performs a data download monthly values by a zoomed BBOX and date range change', () => {
    cy.visit('/#/adjusted-station-data')

    cy.get('#map-loading-screen').should('be.hidden')

    // Zoom in to map
    cy.get('a.leaflet-control-zoom-in').click()
    cy.wait(500) // mimic user pause after a zoom click
    cy.get('a.leaflet-control-zoom-in').click() // zoom twice
    cy.get('table#station-select-table')
      .find('tr.selectableStation')
      .should(($tr) => {
        expect($tr.length).to.be.lessThan(50)
      })

    // date change
    cy.get('input#date-start-date')
      .clear()
      .type('2000-01')

    // geojson
    cy.get('select#vector_download_format')
      .select('GeoJSON')
      .should('have.value', 'geojson')

    // ahccd-monthly
    cy.get('select#var-sel-value-type--time-interval')
      .select('Monthly values')
      .should('have.value', 'ahccd-monthly')

    // retrieve download links
    cy.intercept('GET', /.*\/collections\/ahccd-monthly\/items.*/)
      .as('countSelectMonthly')
    cy.get('#retrieve-download-links').click()
    cy.contains('#num-records-wfs3-download', /Total number of records: \d+/).should('be.visible')
    cy.wait('@countSelectMonthly', {timeout: 20000}).then((xhr) => {
      expect(xhr.request.method).to.equal('GET')
      expect(xhr.response.body).to.have.property('type')
      expect(xhr.response.body.type).to.equal('FeatureCollection')
      expect(xhr.response.body.numberMatched).to.be.lessThan(9300)
      expect(xhr.response.body.numberMatched).to.be.greaterThan(9200)
    })

    // visit download link (limit 1)
    cy.get('#wfs3-link-list').should('be.visible')
    cy.get('#wfs3-link-list a:first').should('have.attr', 'href').then((href) => {
      let hrefLimited = href.replace(/limit=\d+/, 'limit=1')
      cy.request('GET', hrefLimited).then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.numberMatched).to.be.greaterThan(9200)
      })
    })
  })
})
