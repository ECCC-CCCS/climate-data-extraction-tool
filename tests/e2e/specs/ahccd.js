// https://docs.cypress.io/api/introduction/api.html

describe('CCCS Query UI E2E Test', () => {
  it('Gets expected response of AHCCD stations and loaded into leaflet map', () => {
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
  })

  it('Performs a data download by province', () => {
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
    cy.get('#wfs3-link-list').should('be.visible')
    cy.get('#wfs3-link-list a').should('be.visible')
  })

  it('Performs a data download by a select few stations', () => {
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

    // cy.get('#wfs3-link-list').should('be.visible')
  })
})
