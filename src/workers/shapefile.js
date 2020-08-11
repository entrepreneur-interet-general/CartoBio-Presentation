// const { parentPort, workerData, millesime } = require('worker_threads');
// const {sourceFile, filteringFeatures} = workerData
const gdal = require('gdal-next')
const { fromCode } = require('../modules/codes-cultures/pac.js')
const { geometry: area } = require('@mapbox/geojson-area')
const IN_HECTARES = 10000

function extractFeatures({sourceFile, filteringFeatures, millesime: MILLESIME}) {
  const filteringFeaturesPolygon = new gdal.MultiPolygon()

  filteringFeatures.forEach(feature => {
    const geometry = gdal.Geometry.fromGeoJson(feature);

    // we loop over MULTIPOLYGON children (POLYGONs), or a POLYGON directly
    // eslint-disable-next-line no-unexpected-multiline
    (geometry.name === 'MULTIPOLYGON' ? geometry.children : [geometry]).forEach(g => {
      filteringFeaturesPolygon.children.add(g);
    })
  });

  const filterGeometry = filteringFeaturesPolygon.unionCascaded()

  const features = []
  const ds = gdal.open(sourceFile, 'r')
  const layer = ds.layers.get(0)

  layer.features.forEach(feature => {
    const geometry = feature.getGeometry()

    const intersects = filterGeometry.intersects(geometry)

    if (intersects) {
      const {BIO, CODE_CULTU} = feature.fields.toObject()
      const {label: LABEL_CULTU, groupLabel: GROUPE_CULTU} = fromCode(CODE_CULTU)
      const geometry = feature.getGeometry().toObject()
      const SURFACE = (area(geometry) / IN_HECTARES).toFixed(2)

      features.push({
        type: 'Feature',
        geometry,
        properties: {
          BIO,
          CODE_CULTU,
          LABEL_CULTU,
          GROUPE_CULTU,
          SURFACE,
          MILLESIME
        }
      })
      // parentPort.postMessage({
      //   type: 'Feature',
      //   properties: {
      //     BIO: feature.fields.get('BIO')
      //   },
      //   geometry: feature.getGeometry().toObject()
      // })
    }
  })

  return features
}

module.exports = function ({sourceFile, filteringFeatures}, done) {
  try {
    done(null, extractFeatures({sourceFile, filteringFeatures}))
  }
  catch (error) {
    done(error)
  }
}


// parentPort.close()
