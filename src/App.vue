<!-- undo redo Memento Pattern src: 
https://codepen.io/zerbene/pen/oNZPWdY
https://medium.com/fbbd/intro-to-writing-undo-redo-systems-in-javascript-af17148a852b
-->

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
      :circuit="circuit"
      :undoRedoData="undoRedoData"
      @set-position="setPosition"
      @set-circuit="setCircuit"
    />
    <BigBody
      :currentLanguage="currentLanguage"
      :selectedTool="tool"
      @tool-state-changed="onToolStateChanged"
      :circuit="circuit"
      :undoRedoData="undoRedoData"
      @set-position="setPosition"
      @shift-history="shiftHistory"
      @push-history="pushHistory"
    />
  </div>
</template>

<script>
import TitleBanner from './components/TitleBanner.vue';
import MenuBar from './components/MenuBar.vue';
import ToolBar from './components/ToolBar.vue';
import BigBody from './components/BigBody.vue';

import toolStates from './states.js';

import Circuit from './components/jsFolder/constructorComponent/Circuit.js';

export default {
  name: 'App',
  components: {
    TitleBanner,
    MenuBar,
    ToolBar,
    BigBody
  },
  data() {
    return {
      currentLanguage: 'en', //default language
      locales: [
        { id: 'en', name: 'English' },
        { id: 'de', name: 'Deutsch' }
      ],
      tool: toolStates.STATE_IDLE, //default first state
      circuit: new Circuit([], []), //init a circuit
      undoRedoData: {
        // state history [older,...,younger]
        history: [new Circuit([], [])], //1st state in history written manual
        position: 0,
        historyMaxLength: 10
      }
    };
  },
  methods: {
    updateLanguage: function(updatedLanguage) {
      this.currentLanguage = updatedLanguage;
    },

    onToolStateChanged(nextState) {
      this.tool = nextState;
    },
    setPosition(val) {
      this.undoRedoData.position += val;
    },
    setCircuit(deepCopy) {
      this.circuit = deepCopy;
    },
    shiftHistory() {
      this.undoRedoData.history.shift();
    },
    pushHistory(val) {
      this.undoRedoData.history.push(val);
    }
  }
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
  font-family: 'Times New Roman', Helvetica, Arial, serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  width: 100vw;
}
</style>
