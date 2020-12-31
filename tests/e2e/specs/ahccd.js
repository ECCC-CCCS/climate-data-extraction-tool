// https://docs.cypress.io/api/introduction/api.html

describe('CCCS Query UI E2E Test', () => {
  it('Visits AHCCD page and gets expected response of AHCCD stations', () => {
    cy.server({ delay: 1500 })
      .route('GET', Cypress.env('VUE_APP_OPENAPI_SERVER') + '/collections/ahccd-stations/items?f=json&limit=10000&properties=province__province,station_name__nom_station,station_id__id_station').as('ahccdStations')
    cy.visit('/#/adjusted-station-data')
    cy.wait('@ahccdStations').should((req) => {
      expect(req.method).to.equal('GET')
      expect(req, 'has duration in ms').to.have.property('duration').and.be.a('number')
    })
    cy.get('@ahccdStations').its('response').then((res) => {
      expect(res.body).to.have.property('type')
      expect(res.body.type).to.equal('FeatureCollection')
      expect(res.body.features.length).to.be.greaterThan(1000)
    })

    // Stations are loaded on the map as clusters
    cy.get('div.leaflet-container div.leaflet-map-pane div.leaflet-marker-pane')
      .find('div.marker-cluster')
      .should(($div) => {
        expect($div.length).to.be.greaterThan(10)
      })
  })

  it('Visits AHCCD page and performs a data download by province', () => {
    cy.visit('/#/adjusted-station-data')
    cy.get('select#cccs_province')
      .select('British Columbia')
      .should('have.value', 'BC')

    cy.get('table#station-select-table')
      .find('tr.selectedStation')
      .should(($tr) => {
        expect($tr.length).to.be.greaterThan(240)
      })
  })
})
