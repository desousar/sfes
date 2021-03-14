<template>
  <div id="app">
    <!--<img alt="Vue logo" src="./assets/logo.png"> => explain how to import a picture-->
    <!-- v-bind:abc <=> :abc AND v-on:abc <=> @abc -->
    <TitleBanner
      titlename="BeNetz"
      :currentLanguage="currentLanguage"
      :locales="locales"
      @changeLanguage="updateLanguage($event)"
    />
    <MenuBar :currentLanguage="currentLanguage" />
    <ToolBar
      :currentLanguage="currentLanguage"
      :selectedTool="tool"
      @tool-state-changed="onToolStateChanged"
    />
    <BigBody
      :currentLanguage="currentLanguage"
      :selectedTool="tool"
      @tool-state-changed="onToolStateChanged"
      :circuit="circuit"
    />
  </div>
</template>

<script>
import TitleBanner from "./components/TitleBanner.vue";
import MenuBar from "./components/MenuBar.vue";
import ToolBar from "./components/ToolBar.vue";
import BigBody from "./components/BigBody.vue";

import toolStates from "./states.js";

import Circuit from "./components/jsFolder/constructorComponent/Circuit.js";

export default {
  name: "App",
  components: {
    TitleBanner,
    MenuBar,
    ToolBar,
    BigBody,
  },
  data() {
    return {
      currentLanguage: "en", //default language
      locales: [
        { id: "en", name: "English" },
        { id: "de", name: "Deutsch" },
      ],
      tool: toolStates.STATE_IDLE, //default first state
      circuit: new Circuit([], []), //init a circuit
    };
  },
  methods: {
    updateLanguage: function (updatedLanguage) {
      this.currentLanguage = updatedLanguage;
    },

    onToolStateChanged(nextState) {
      this.tool = nextState;
    },
  },
};
</script>

<style>
body,
html {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
}
#app {
  font-family: "Times New Roman", Helvetica, Arial, serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  width: 100vw;
}
</style>
