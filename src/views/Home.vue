<template>
  <v-layout column align-center justify-center class="white--text">
    <v-avatar :size="100">
      <img :src="require('../assets/logo-cartobio.png')">
    </v-avatar>
    <h1 class="parallax-title">{{msg}}</h1>
  </v-layout>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Home",
  components: {},
  props: {
    msg: String
  }
};
</script>

<style lang="scss" scoped>
.parallax-title {
  font-size: 36px;
}
</style>