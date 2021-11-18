const datasetCols = {
  datasetToStnColName: { // Unique primary ID of MSC climate stations
    ahccd: 'station_id__id_station',
    hydrometric: 'STATION_NUMBER',
    normals: 'CLIMATE_IDENTIFIER',
    daily: 'CLIMATE_IDENTIFIER',
    monthly: 'CLIMATE_IDENTIFIER',
    ltce: 'VIRTUAL_CLIMATE_ID'
  },
  datasetToNameColName: {
    ahccd: 'station_name__nom_station',
    hydrometric: 'STATION_NAME',
    normals: 'STATION_NAME',
    daily: 'STATION_NAME',
    monthly: 'STATION_NAME',
    ltce: 'VIRTUAL_STATION_NAME_E' // Switches on locale change
  },
  datasetToDateColName: {
    hydrometric: 'DATE', // MAX_DATE for hydrometric-annual-statistics
    normals: 'MONTH',
    daily: 'LOCAL_DATE',
    monthly: 'LOCAL_DATE',
    ltce: 'END_DATE'
  },
  datasetToProvColName: {
    ahccd: 'province__province',
    hydrometric: 'PROV_TERR_STATE_LOC',
    normals: 'PROVINCE_CODE',
    daily: 'PROVINCE_CODE',
    monthly: 'PROVINCE_CODE',
    ltce: 'PROVINCE_CODE'
  },
  layerToColSortOrder: { // default download sort order
    'climate-normals': ['CLIMATE_IDENTIFIER', 'NORMAL_ID', 'MONTH'],
    'hydrometric-daily-mean': ['IDENTIFIER'],
    'hydrometric-monthly-mean': ['IDENTIFIER'],
    'hydrometric-annual-peaks': ['IDENTIFIER'],
    'hydrometric-annual-statistics': ['IDENTIFIER'],
    'ahccd-monthly': ['identifier__identifiant'],
    'ahccd-annual': ['identifier__identifiant'],
    'ahccd-seasonal': ['identifier__identifiant'],
    'ahccd-trends': ['identifier__identifiant'],
    'ltce-temperature': ['VIRTUAL_CLIMATE_ID', 'LOCAL_MONTH', 'LOCAL_DAY'],
    'ltce-precipitation': ['VIRTUAL_CLIMATE_ID', 'LOCAL_MONTH', 'LOCAL_DAY'],
    'ltce-snowfall': ['VIRTUAL_CLIMATE_ID', 'LOCAL_MONTH', 'LOCAL_DAY']
  }
}

export default datasetCols
