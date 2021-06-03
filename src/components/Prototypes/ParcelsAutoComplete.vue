<template>
  <v-form v-model="valid">
    <v-btn fixed outline bottom right fab @click="prefillData"><v-icon>auto_fix_high</v-icon></v-btn>

    <article class="my-5">
      <h1 class="display-1">Notification de votre parcellaire en Agriculture Biologique</h1>
      <p class="chip my-3">
        <v-avatar><v-icon>info_outline</v-icon></v-avatar>
        Cette section est actuellement en phase de test.
      </p>
      <p>
        Le renseignement du parcellaire sert de <strong>lien entre vous et votre organisme de certification</strong>.<br>
        Nous travaillons à ce que ces informations soient réutilisables tout au long de votre processus de certification.
      </p>

      <ul>
        <li><strong>Comment ces données seront utilisées ?</strong></li>
        <li><v-icon small>privacy_tip</v-icon> votre certification en Agriculture Biologique</li>
        <li><v-icon small>privacy_tip</v-icon> instruction des aides PAC</li>
        <li><v-icon small>privacy_tip</v-icon> statistiques annuelles de la bio (données anonymisées)</li>
        <li><v-icon small>privacy_tip</v-icon> stratégies territoriales de biodiversité (données anonymisées)</li>
      </ul>
    </article>

    <article>
      <h2 class="headline">
        Choix du mode de saisie
      </h2>

      <ul class="px-0">
        <li>
          <label class="radio-label">
            <input type="radio" v-model="inputMode" value="import" />

            <h3>Importer depuis un logiciel de gestion agricole</h3>

            <p class="help">Avec MesParcelles, Isagri&nbsp;Geofolia et Smag&nbsp;Farmer.</p>
          </label>
        </li>
        <li>
          <label class="radio-label">
            <input type="radio" v-model="inputMode" value="telepac" />

            <h3>Importer mon dossier PAC</h3>

            <p class="help">Via mon identifiant PACAGE, ou un fichier informatique.</p>
          </label>
        </li>
        <li>
          <label class="radio-label disabled">
            <input type="radio" v-model="inputMode" value="douanes" :disabled="true" />

            <h3>Importer mon Casier Viticole Informatisé</h3>

            <p class="help">Tel que géré sur ProDouanes.</p>
          </label>
        </li>
        <li>
          <label class="radio-label">
            <input type="radio" v-model="inputMode" value="manuel" />

            <h3>Saisie manuelle</h3>

            <p class="help">Avec un formulaire simplifié, aidé d'une carte interactive.</p>
          </label>
        </li>
      </ul>
    </article>

    <section v-if="inputMode === 'import'" class="my-5" id="import">
      <h2 class="headline">
        Importer depuis un logiciel de gestion agricole
      </h2>

      <ul class="pa-0">
        <li>
          <v-btn outline round disabled>
            <v-icon small class="mr-2">lock</v-icon>
            connexion à mon compte MesParcelles
          </v-btn>
        </li>

        <li>
          <v-btn outline round disabled>
            <v-icon small class="mr-2">lock</v-icon>
            connexion à mon compte Geofolia
          </v-btn>
        </li>

        <li>
          <v-btn outline round disabled>
            <v-icon small class="mr-2">cloud_upload</v-icon>
            import Geofolia (logiciel fonctionnant hors-ligne)
          </v-btn>
        </li>

        <li>
          <v-btn outline round disabled>
            <v-icon small class="mr-2">cloud_upload</v-icon>
            import Smag Farmer
          </v-btn>
        </li>
      </ul>
    </section>

    <section v-if="inputMode === 'telepac'" id="telepac" class="my-5">
      <h2 class="headline">
        Import de mon dossier TéléPAC
      </h2>

      <ul class="pa-0 inline-choices">


        <li>
          <label class="label" for="telepac_upload_zip_field">Fichier parcelles (ZIP)</label>
          <v-btn outline round color="success" :disabled="isLoading" @click="telepacZipPrompt" small>
            <input type="file" id="telepac_upload_zip_field" ref="telepac_upload_zip_field" @input="uploadTelepacZIP" accept=".zip,application/zip" hidden>
            <v-progress-circular v-if="isLoading" size="18" width="2" class="mr-2" indeterminate />
            <v-icon v-else class="mr-2">cloud_upload</v-icon>
              {{ operator.pacage ? 'choisir un nouveau fichier' : 'choisir le fichier' }}
          </v-btn>
        </li>

        <li>
          <label class="label" for="telepac_upload_xml_field">Dossier complet (XML)</label>
          <v-btn outline round color="success" :disabled="isLoading" @click="telepacXmlPrompt" small>
            <input type="file" id="telepac_upload_xml_field" ref="telepac_upload_xml_field" @input="uploadTelepacXML" accept=".xml,text/xml" hidden>
            <v-progress-circular v-if="isLoading" size="18" width="2" class="mr-2" indeterminate />
            <v-icon v-else class="mr-2">cloud_upload</v-icon>
              {{ operator.pacage ? 'choisir un nouveau fichier' : 'choisir le fichier' }}
          </v-btn>
        </li>
        <li>

          <label class="label" for="numero_pacage">Numéro PACAGE</label>
          <div>
            <input type="text" class="input" placeholder="000000000" id="numero_pacage" v-model="userInputPacage" pattern="0?\d{8}" autocomplete="disabled" maxlength="9" />

            <v-btn outline @click="validateUserInputPacage" :disabled="isLoading || userInputPacage.length !== 9">
              <v-progress-circular v-if="isLoading" size="18" width="2" class="mr-2" indeterminate />
              Importer ce parcellaire
            </v-btn>
          </div>
        </li>
      </ul>
    </section>

    <section id="manuel" class="my-5">
      <h2 class="headline" v-if="inputMode === 'manuel'">
        Saisie du parcellaire
      </h2>
      <h2 class="headline" v-else>
        Confirmation du parcellaire
      </h2>

      <div v-if="operator.pacage" class="my-3">
        <v-chip class="pacage">
          <b class="mr-2">Campagne PAC</b>
          {{operator.campagne}}
        </v-chip>
        <v-chip class="pacage">
          <b class="mr-2">N°&nbsp;PACAGE</b>
          {{operator.pacage}}
        </v-chip>
      </div>

      <div v-if="inputMode === 'manuel' || hasAtLeastOneGeometry">
        <div class="my-4">
          <v-btn color="info" @click="addPlot() || fetchCadastreSheets()">
            <v-icon class="mr-2">add_circle_outline</v-icon>
            Ajouter une parcelle
          </v-btn>

          <v-btn disabled outline color="info">
            <v-icon class="mr-2">add_circle_outline</v-icon>
            Ajouter une zone de rucher
          </v-btn>
        </div>

        <div :class="{ grid: true, 'no-cadastre': operator.pacage }">
          <span class="header">Commune</span>
          <span v-if="!operator.pacage" class="header">Références<br>cadastrales</span>
          <span class="header">Type de culture</span>
          <span class="header">Statut de conversion</span>
          <span class="header">Date d'engagement<br>de&nbsp;la&nbsp;parcelle</span>
          <span class="header">Commentaire</span>
          <span class="header"></span>

          <plot-row v-for="(feature, index) in plots.features" :feature="feature" :pacage="operator.pacage" :is-last-line="index === plots.features.length - 1" class="row" :key="feature.id" @delete="deleteFeatureId" />
        </div>

        <div class="my-4">
          <v-btn color="info" @click="addPlot() || fetchCadastreSheets()">
            <v-icon class="mr-2">add_circle_outline</v-icon>
            Ajouter une parcelle
          </v-btn>

          <v-btn disabled outline color="info">
            <v-icon class="mr-2">add_circle_outline</v-icon>
            Ajouter une zone de rucher
          </v-btn>

          <br>

          <v-btn color="success" class="mt-3" @click.stop="fetchCadastreSheets" :loading="isLoading">
            <v-icon class="mr-2">map</v-icon>
            {{isMapVisible ? 'actualiser la carte' : 'afficher sur une carte'}}
          </v-btn>
        </div>
      </div>

      <p v-else>
        <v-progress-circular indeterminate size=24 color="rgba(0,0,0,.54)" />

        En attente des informations des parcelles.
      </p>

      <!-- <section v-if="isMapVisible">
        <h2 class="headline my-3">Parcellaire tabulaire </h2>

        <table class="summary">
          <thead>
            <tr>
              <td>Parcelle</td>
              <td>Production végétale</td>
              <td>Date engagement</td>
              <td v-if="!operator.pacage">Réf cadastrale</td>
              <td>Classement</td>
              <td>Surface graphique</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="({ properties, id }) in structuredPlots.features" :key="id">
              <td>{{ id }}</td>
              <td>{{ properties.culture_type.join(', ') }}</td>
              <td>{{ properties.engagement_date }}</td>
              <td v-if="!operator.pacage">{{ properties.cadastre_references.join(', ') }}</td>
              <td>{{ properties.niveau_conversion }}</td>
              <td>{{ properties.surface ? `${properties.surface}ha` : '?'}}</td>
            </tr>
          </tbody>
        </table>
      </section> -->

      <section class="my-5">
        <h2 class="headline my-3">Prévisualisation de votre parcellaire</h2>

        <div class="map" v-if="hasAtLeastOneGeometry">
          <MglMap
          :mapStyle="mapStyle"
          :bounds.sync="mapBounds"
          @load="onMapLoaded"
          ref="mapboxDiv"
          >
          <MglGeojsonLayer
            sourceId="plots"
            :layer="layerStyle('operator-parcels')"
            layerId="operator-parcels"/>
          <MglVectorLayer
              before="place-continent"
              sourceId="cadastre"
              :layer="layerStyle('selectable-cadastral-parcels')"
              layerId="parcelles"/>
          </MglMap>
        </div>
        <p v-else>
          <v-progress-circular indeterminate size=24 color="rgba(0,0,0,.54)" />

          En attente de saisie des informations géographiques des parcelles.
        </p>
      </section>

      <section class="my-5">
        <h2 class="headline my-3">Exporter le parcellaire</h2>

        <v-btn color="success" :disabled="true">
          Export Télépac
        </v-btn>

        <v-btn color="success" :disabled="true">
          Export GeoJSON/QGIS
        </v-btn>

        <v-btn color="success" :disabled="!hasAtLeastOneRecord" @click="startEcocertExport">
          <v-icon class="mr-2">cloud_download</v-icon>
          Export Ecocert
        </v-btn>
        <v-btn color="success" :disabled="!hasAtLeastOneRecord" @click="startXLSXExport">
          <v-icon class="mr-2">cloud_download</v-icon>
          Export Excel
        </v-btn>
      </section>
    </section>
  </v-form>
</template>

<script>
import {get, post} from 'axios'
import {geometry as area} from '@mapbox/geojson-area'
import { all as mergeAll } from "deepmerge";
import geometryBbox  from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import uniqueId from 'lodash/uniqueId'
import { featureCollection, feature as Feature } from "@turf/helpers";
import PlotRow from './PlotRow'
import { convertXmlDossierToGeoJSON } from '@/modules/codes-cultures/xml-dossier.js'
import { parseReferences } from '@/cadastre.js'
import { toCertificationBodySheet, ecocertExcelTemplate, basicExcelTemplate } from '@/certification-body/control-sheet.js'
import samplePlots from '@/certification-body/sample-plots.json'
import {mapState, mapActions} from 'vuex';
import {authenticateWithCredentials} from '@/api/user.js'

const {VUE_APP_API_ENDPOINT} = process.env;

import {
  baseStyle,
  cadastreStyle,
  cartobioStyle
} from "@/assets/styles/index.js";

import {
  MglMap,
  MglGeojsonLayer,
  MglVectorLayer
} from "vue-mapbox";

const IN_HECTARES = 10000

function emptyPolygon () {
  return {
    type: "Polygon",
    coordinates: []
  }
}

function prepareFeature ({ feature }) {
  const { com, cadastre_suffixes = '' } = feature.properties
  const { id, geometry } = feature

  let surface = 0

  // 26108000AN0100
  const cadastre_references = parseReferences(cadastre_suffixes, { com })

  if (geometry.coordinates.length) {
    surface = parseFloat(area(geometry) / IN_HECTARES).toFixed(2)
  }

  const properties = {
    ...feature.properties,
    cadastre_references,
    surface
  }

  return Feature(geometry, properties, { id })
}

export default {
  components: {
    MglMap,
    MglGeojsonLayer,
    MglVectorLayer,
    PlotRow,
  },

  data () {
    return {
      inputMode: null,

      valid: false,
      isLoading: false,
      isMapVisible: false,

      operator: {
        id: 7818,
        customerId: 215844,
        name: 'BOUSIGNAC Eric',
        inputDate: new Date(),
        certifiedBy: 'jviles',
        pacage: null,
        campagne: null,
      },

      userInputPacage: '',
      plots: featureCollection([]),

      mapStyle: mergeAll([
        baseStyle,
        cadastreStyle,
        cartobioStyle
      ])
    };
  },

  computed: {
    hasAtLeastOneGeometry () {
      return this.structuredPlots.features.some(feature => feature.geometry.coordinates.length > 0)
    },

    hasAtLeastOneRecord () {
      return this.structuredPlots.features.length > 0
    },

    mapBounds () {
      const geometry = this.hasAtLeastOneGeometry ? geometryBbox(this.plots) : [-9.86, 41.15, 10.38, 51.56]
      return bboxPolygon(geometry).bbox
    },

    structuredPlots () {
      return featureCollection(
        this.plots.features.map(feature => prepareFeature({ feature }))
      )
    },
    ...mapActions('user', ['setProfile']),
    ...mapState('user', ['apiToken']),
    ...mapState(['userProfile']),
  },

  created () {  
    if (!this.apiToken) {
      
    const {login, password} = {login : "cartobio-proto@yopmail.com", password: "Cartobio12345"};
     
     authenticateWithCredentials({login, password})
        .then(({  token, decodedToken, cartobioToken }) => {
          this.$ls.set("token", token, decodedToken.exp);
          this.$ls.set("cartobioToken", cartobioToken, decodedToken.exp);

          // for some weird reasons cartobioToken transforms from token to this component object between here and the setProfile method ... 
          // return this.setProfile(cartobioToken);
          // for prototype/demo purpose, reloading the page actually log in for the test account, since the token is in localstorage.
          this.$router.go(0);
        })
    }
  },

  methods: {
    prefillData () {
      this.isLoading = true

      this.$nextTick(() => {
        this.inputMode = 'telepac'
        this.isLoading = false

        this.operator.pacage = '2020'
        this.operator.pacage = '082020054'
        this.plots = samplePlots
      })
    },

    addPlot () {
      const lastLine = this.plots.features[ this.plots.length - 1 ] ?? {}
      const { com, engagement_date, niveau_conversion } = lastLine

      this.plots.features.push(Feature(emptyPolygon(), {
        com,
        engagement_date,
        niveau_conversion,
        culture_type: []
      }, { id: uniqueId('999.') }))
    },

    deleteFeatureId (id) {
      const index = this.plots.features.findIndex(({ id: featureId }) => featureId === id)

      this.$delete(this.plots.features, index)
    },

    fetchCadastreSheets () {
      this.isLoading = true

      const sheets = this.structuredPlots.features.reduce((acc, feature) => {
        const { com } = feature.properties
        const { id: featureId } = feature

        feature.properties.cadastre_references.forEach(reference => {
          acc.push({ com, reference, featureId })
        })

        return acc
      }, [])

      const calls = sheets.reduce((map, { featureId, com, reference }) => {
        if (Array.isArray(map[ com ]) === false) {
          map[ com ] = []
        }

        map[ com ].push({ reference, featureId })

        return map
      }, {})

      const callsP = Object.entries(calls).map(([com, references]) => {
        return get(`https://cadastre.data.gouv.fr/bundler/cadastre-etalab/communes/${com}/geojson/parcelles`)
          .then(response => response.data.features.filter(feature => references.map(({ reference }) => reference).includes(feature.id)))
          .then(features => features.forEach(cadastreFeature => {
            // we retrieve the feature id associated to this cadastral reference
            const { featureId } = references.find(({ reference }) => cadastreFeature.id === reference)

            // we
            const index = this.plots.features.findIndex(({ id }) => id === featureId)
            const parcelle = this.plots.features[index]

            // we add the geometry as a Polygon
            if (parcelle.geometry.coordinates.length === 0) {
              parcelle.geometry = { ...cadastreFeature.geometry }
            }
            // we morph a Polygon with geometry into a MultiPolygon (stack of polygons)
            else if (parcelle.geometry.coordinates.length === 1) {
              parcelle.geometry.type = 'MultiPolygon'
              parcelle.geometry.coordinates = [
                parcelle.geometry.coordinates,
                cadastreFeature.geometry.coordinates
              ]
            }
            // we add another Polygon coordinates to a MultiPolygon
            else {
              parcelle.geometry.coordinates.push([ ...cadastreFeature.geometry.coordinates ])
            }

            this.$set(this.plots.features, index, parcelle)
          }))
      })

      Promise.all(callsP).finally(() => {
        this.isLoading = false
        this.isMapVisible = true
      })
    },

    /**
     * @param  {String} styleId [description]
     * @return {Object<Mapbox.Layer>}
     */
    layerStyle(styleId) {
      return cartobioStyle.layers.find(({ id }) => id === styleId);
    },

    onMapLoaded({ map }) {
      this.map = map;

      this.updateMap()
    },

    updateMap () {
      this.map.getSource("plots").setData(this.plots)
      this.map.fitBounds(this.mapBounds, { padding: 50, maxZoom: 13 })
      this.map.resize();
    },

    telepacZipPrompt () {
      this.$refs.telepac_upload_zip_field.click()
    },

    telepacXmlPrompt () {
      this.$refs.telepac_upload_xml_field.click()
    },

    async uploadTelepacZIP () {
      const [archive] = await this.$refs.telepac_upload_zip_field.files
      this.isLoading = true

      const form = new FormData()
      form.append('archive', archive)

      /** @type {{ data: TelepacFeatureCollection }} */
      const { data: geojson } = await post(`${VUE_APP_API_ENDPOINT}/v1/convert/shapefile/geojson`, form)

      const { PACAGE, CAMPAGNE } = geojson.features[0]?.properties
      this.operator.pacage = PACAGE
      this.operator.campagne = CAMPAGNE

      this.$nextTick(() => {
        this.isLoading = false

        this.plots = featureCollection(geojson.features.map(({ geometry, properties: prop, id }) => Feature(geometry, {
          com: prop.COMMUNE,
          culture_type: [prop.TYPE],
          niveau_conversion: prop.AGRIBIO === 1 ? 'BIO' : '',
          pacage: prop.PACAGE,
          engagement_date: null,
          comment: [
            `Parcelle ${prop.NUMERO_I}.${prop.NUMERO_P}`,
            prop.MARAICH ? 'Conduite en maraîchage.' : '',
            prop.AGROFOREST ? 'Conduite en agroforesterie.' : ''
          ].filter(d => d).join('\n')
        }, { id: id ?? `${prop.NUMERO_I}.${prop.NUMERO_P}` })))
      })
    },

    async uploadTelepacXML () {
      const text = await this.$refs.telepac_upload_xml_field.files[0].text()
      this.isLoading = true

      setTimeout(async () => {
        const { pacage, campagne, featureCollection } = convertXmlDossierToGeoJSON(text)
        this.operator.pacage = pacage
        this.operator.campagne = campagne

        await this.$nextTick(() => {
          this.plots = featureCollection
          this.isLoading = false
        })
      }, 100)
    },

    validateUserInputPacage() {
        let pacage = this.userInputPacage;
        const params = {
          numeroPacage: pacage,
          years: [2019],
        };

        this.isLoading = true
        this.$store
          .dispatch("operators/FETCH_WFS_LAYERS", params)
          .then((data) => {
            const [ [year, features] ] = data

            this.operator.pacage = pacage;
            this.operator.campagne = year;

            this.isLoading = false;
            this.plots = this.formatFeatures(features);
          })
          .finally(() => this.isLoading = false)
    },

    startEcocertExport () {
      const { structuredPlots: featureCollection, operator } = this
      const template = ecocertExcelTemplate
      const format = 'xlsm'

      const download = toCertificationBodySheet({ featureCollection, operator, template, format })

      download(`cartobio-ecocert-${operator.customerId}.${format}`)
    },

    startXLSXExport () {
      const { structuredPlots: featureCollection, operator } = this
      const template = basicExcelTemplate;
      const format = 'xlsx'

      const download = toCertificationBodySheet({ featureCollection, operator, template, format })

      download(`cartobio-${operator.id}.${format}`);
      this.sendEmail();
    },

    formatFeatures (featureCollection) {
      featureCollection.features.forEach((feat) => {
        let prop = feat.properties;
        feat.properties = {
          com : "",
          id: prop.id,
          pacage: prop.pacage,
          culture_type: [prop.codecultu],
          niveau_conversion: prop.bio ? "BIO" : "",
          comment: [
            `Parcelle ${prop.numilot}.${prop.numparcel}`,
            prop.agroforest ? "Conduite en agroforesterie." : "",
            prop.maraichage ? "Conduite en maraîchage." : "",
          ].filter(d => d).join('\n')
        };
        feat.id = `${prop.numilot}.${prop.numparcel}`;
      })
      return featureCollection;
    },

    sendEmail () {
      const {id} = this.operator
      const {apiToken} = this
      const {email:userEmail, id:userId, nom:userName, ocId} = this.userProfile

      this.freeText = "Données exportées via le prototype";
      
      // const {email:userEmail, id:userId, nom:userName, ocId} = this.userProfile
      const options = {
        headers: {
          Authorization: `Bearer ${apiToken}`
        }
      }

      post(`${VUE_APP_API_ENDPOINT}/v1/parcels/operator/${id}`, {
        uploads: this.uploads(),
        text: this.freeText,
        sender: {
          userId,
          userEmail,
          userName,
          ocId
        }
      }, options).then(() => {
        this.freeText = ''
        this.isSaved = true
      }, console.error).finally(() => {
      })
    },
    
    uploads () {
      const text = JSON.stringify(this.featureCollection, null, 2)
      const blob = new Blob([ text ], { type: 'application/json' })

      return [
        {
            content: btoa(text),
            size: blob.size,
            type: blob.type,
            filename: 'feature.geojson',
            disposition: 'attachment'
          }
      ]
    }
  }
};
</script>

<style lang="scss" scoped>
  .d-flex {
    justify-content: space-between;
  }

  .d-flex > * {
    gap: .5em;
  }

  summary,
  label,
  .label {
    cursor: pointer;
  }

  table {
    border-collapse: collapse;
    margin-left: 10px;

    thead {
      background: #dfdfdf;
      font-weight: bold;
      vertical-align: bottom;
    }

    tbody {
      font-family: monospace;
    }

    td {
      border: 1px solid #ccc;
      padding: 0.5rem;
    }
  }

  .inline-choices > li {
    display: grid;
    grid-template-columns: 20% 1fr;
    grid-template-rows: 2;
    justify-content: center;
    margin-bottom: 1em;

    label {
      grid-row: 1 / 3;
      align-self: center;
    }
  }

  .input[maxlength="9"] {
    font-family: monospace;
    letter-spacing: .5rem;
    max-width: 200px;
  }

  .label {
    font-weight: bold;
  }

  .radio-label {
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
    display: grid;
    grid-template-columns: 20px 1fr;
    grid-template-rows: 2;
    justify-content: center;
    column-gap: 1em;
    padding: 1em;

    &:not(.disabled):hover,
    &:not(.disabled):focus {
      background-color: #ffc;
      border-color: #333;
    }

    &.disabled {
      color: #bbb;
      cursor: default;
    }

    input[type="radio"] {
      grid-row: 1 / 3;
    }

    .help {
      margin: 0;
    }
  }

  h2 {
    margin-top : 0;
  }
  .map {
    position: relative;
    width: 100%;
    height: 500px;
  }

  .grid {
    display: grid;
    grid-row-gap: 1em;
    grid-column-gap: 0;
    grid-template-columns: repeat(7, auto);
    margin: 1em 0;

    &.no-cadastre {
      grid-template-columns: repeat(6, auto);
    }

    span.header {
      font-weight: bold;
      align-self: end;
    }

    /deep/ > * {
      padding: 0 .5rem;
    }
  }

  .chip {
    background: #ffc;
    border: 1px solid currentColor;
    border-radius: 2em;
    display: inline-block;
    padding-left: 1em;
    padding-right: 1em;

    .v-avatar {
      margin-left: -1em;
    }

    &:first-child {
      margin-left: 0;
    }
  }

  .input {
    border: 1px solid #333;
    border-radius: 3px;
    padding: .5em;
    max-width: 100%;

    &:invalid {
      box-shadow: red 0 0 3px;
      border-color: darkred;
    }
  }

</style>
