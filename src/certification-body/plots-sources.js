import { parse } from 'wkt'
import { featureCollection, feature as Feature } from '@turf/helpers'

const excludeFieldsWithoutGeometry = ({ Geography }) => Geography

export function convertGeofoliaFieldsToGeoJSON (data) {
  const fields = data.Fields.filter(excludeFieldsWithoutGeometry)

  return featureCollection(fields.map(Field => {
    const {Id: id, CityNumber: com} = Field

    return Feature(
      parse(Field.Geography),
      {
        com,
        id,
        culture_type: Field.CropName,
        niveau_conversion: '',
        comment: `${Field.Name}
Parcelle ${Field.IsletNum}.${Field.Code}`
      },
      { id }
    )
  }))
}
