<template>
  <v-flex class="layers-panel">
    <v-expansion-panel expand :readonly="true" :value="[true]">
      <v-expansion-panel-content hide-actions>
        <template v-slot:header>
          <h2 class="expansion-title font-weight-medium">
            <v-icon class="mr-2">layers</v-icon>Exploitation
          </h2>
        </template>

        <ul class="legend mx-4 mb-4 body-1">
          <li>
            <span class="legend-color layer-operator-bio"></span>
            Parcelles bio
          </li>
          <li>
            <span class="legend-color layer-operator-non-bio"></span>
            Parcelles conventionnelles
          </li>
        </ul>

        <v-divider></v-divider>

        <v-expansion-panel v-model="expansionValue" focusable>
          <v-layout column>
            <v-flex grow>
              <!-- LAYER_MODES === 0 -->
              <v-expansion-panel-content>
                <template v-slot:header>
                  <h3 class="subheading font-weight-medium ">Cultures environnantes</h3>
                </template>

                <ul class="legend mx-4 body-1">
                  <li>
                    <span class="legend-color layer-surroundings-bio"></span>
                    Culture bio
                  </li>
                  <li>
                    <span class="legend-color layer-surroundings-non-bio-lowrisk"></span>
                    Pâtures et estives
                  </li>
                  <li>
                    <span class="legend-color layer-surroundings-non-bio"></span>
                    Culture conventionnelle
                  </li>
                  <li>
                    <span class="legend-color layer-surroundings-non-bio-risky"></span>
                    Culture conventionnelle risque
                  </li>
                </ul>
              </v-expansion-panel-content>
            </v-flex>
            <!-- LAYER_MODES === 1 -->
            <v-flex grow>
              <v-expansion-panel-content>
                <template v-slot:header>
                  <h3 class="subheading font-weight-medium">Historique de conversion</h3>
                </template>
                <ul class="legend mx-4 mb-4 body-1">
                  <li>
                    <span class="legend-color layer-surroundings-bio"></span>
                    Disponible prochainement
                  </li>
                </ul>
              </v-expansion-panel-content>
            </v-flex>
          </v-layout>
        </v-expansion-panel>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-flex>
</template>

<script>
import { mapMutations, mapActions } from "vuex";

const LAYER_MODES = new Map([
  [null, 'Aucun'],
  [0, 'Cultures environnantes'],
  [1, 'Historique de conversion']
])

export default {
  name: "LayersPanel",
  props: {
    operator: Object,
  },
  data() {
    return {
      expansionValue: null,
    };
  },
  methods: {
    ...mapMutations("exploitationView", ["changeViewMode"]),
    ...mapActions("user", ["trackEvent"])
  },
  watch : {
    expansionValue(newVal) {
      this.changeViewMode(newVal)

      const layerMode = LAYER_MODES.get(newVal)
      this.trackEvent(["operator", "layer-mode", layerMode])
    }
  },
  destroyed() {
    this.changeViewMode(null);
  }
};
</script>

<style lang="scss" scoped>
// prevent side effect of default style
h2 {
  margin-top: 0;
}
ul, li {
  margin: 0;
}

.legend-color {
  background: grey;
  border-radius: 2px;
  display: inline-block;
  margin: 0 5px 0 0;
  height: 1em;
  vertical-align: middle;
  width: 1em;

  &.layer-operator-bio {
    background-color: #B9D065;
  }
  &.layer-operator-non-bio {
    background-color: #47718A;
  }
  &.layer-surroundings-bio {
    background-color: #7BD97B;
  }
  &.layer-surroundings-non-bio-lowrisk {
    background-color: #F2C94C;
  }
  &.layer-surroundings-non-bio {
    background-color: #F2994A;
  }
  &.layer-surroundings-non-bio-risky {
    background-color: #EB5757;
  }
}

</style>
