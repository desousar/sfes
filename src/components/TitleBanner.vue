<template>
  <div class="title">
    <p id="titlename">
      <strong>{{ titlename }}</strong>
    </p>
    <p id="titledescription">{{ titledescription[getCurrentLanguage] }}</p>

    <select v-model="curLanguage" id="languages" @click="changeLanguage">
      <option v-for="locale in locales" :key="locale.id" :value="locale.id">
        {{ locale.name }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    //variable, who I obtain from App.vue (one stage up of this stage)
    //I need to give the type, after that I can us it into html part like {{...}}
    titlename: String,
    currentLanguage: String,
    locales: Array,
  },
  data() {
    return {
      curLanguage: this.currentLanguage,
      titledescription: {
        en: "Simulation tool for electronic circuits",
        de: "Simulationstool für elektronische Schaltungen",
      },
    };
  },
  computed: {
    getCurrentLanguage: function () {
      return this.curLanguage;
    },
  },
  methods: {
    changeLanguage: function () {
      this.$emit("changeLanguage", this.getCurrentLanguage); //create en event "$emit(name,valueToPass)" to pass data to App.vue. That's the only way to pass data to parent
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.title {
  display: flex; /* refer https://css-tricks.com/snippets/css/a-guide-to-flexbox/ */
  flex-direction: row;
  align-items: baseline;
  background-color: #e6e6e6;
  padding: 0px 10px;
}
#titlename {
  font-size: 25px;
  display: inline;
  margin-right: 5px;
}
#titledescription {
  flex-grow: 1; /* by default is this value by the other block equals 0 */
  display: inline;
}
#languages {
  display: inline;
  margin-right: 5px;
}
</style>
