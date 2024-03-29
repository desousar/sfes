<!-- undo redo Memento Pattern src: 
https://codepen.io/zerbene/pen/oNZPWdY
https://medium.com/fbbd/intro-to-writing-undo-redo-systems-in-javascript-af17148a852b
-->

<template>
  <div id="app">
    <!--<img alt="Vue logo" src="./assets/logo.png"> => explain how to import a picture-->
    <!-- v-bind:abc <=> :abc AND v-on:abc <=> @abc -->
    <MenuBar :currentLanguage="currentLanguage" />
    <ToolBar
      :currentLanguage="currentLanguage"
      :selectedTool="tool"
      @tool-state-changed="onToolStateChanged"
      @set-circuit="setCircuit"
      :undoRedoData="undoRedoData"
      @set-position="setPosition"
    />
    <BigBody
      :currentLanguage="currentLanguage"
      :withPredefinedValue="withPredefinedValue"
      :selectedTool="tool"
      @tool-state-changed="onToolStateChanged"
      :theCircuit="theCircuit"
      @set-circuit="setCircuit"
      :undoRedoData="undoRedoData"
      @set-position="setPosition"
      @shift-history="shiftHistory"
      @slice-history="sliceHistory"
      @push-history="pushHistory"
    />

    <!-- Pop Up Windows -->

    <popupAboutUs
      v-show="isPopupAboutUsVisible"
      @close="openClosePopupAboutUs"
      :currentLanguage="currentLanguage"
    />

    <popupSettings
      v-show="isPopupSettingsVisible"
      @close="openClosePopupSettings"
      :currentLanguage="currentLanguage"
      :locales="locales"
      :withPredefinedValue="withPredefinedValue"
    />

    <popupComp
      v-show="isPopupCompVisible"
      @close="openClosePopupComp"
      :theCompoToPass="theCompoToPass"
      :arrayComponents="theCircuit.components"
      :currentLanguage="currentLanguage"
      :isPopupCompVisible="isPopupCompVisible"
    />

    <popupResult
      v-show="isPopupResultVisible"
      @close="openClosePopupResult"
      :arrayComponents="theCircuit.components"
      :currentLanguage="currentLanguage"
      :isPopupResultVisible="isPopupResultVisible"
    />

    <popupEquivalentSrc
      v-show="isPopupEquivalentSrcVisible"
      @close="openClosePopupEquivalentSrc"
      :circuitcomplet="theCircuit"
      :currentLanguage="currentLanguage"
    />

    <popupHelp
      v-show="isPopupHelpVisible"
      @close="openClosePopupHelp"
      :currentLanguage="currentLanguage"
    />
  </div>
</template>

<script>
import MenuBar from './components/MenuBar.vue';
import ToolBar from './components/ToolBar.vue';
import BigBody from './components/BigBody.vue';

import popupAboutUs from './components/popupAboutUs.vue';
import popupSettings from './components/popupSettings.vue';
import popupComp from './components/popupComp.vue';
import popupResult from './components/popupResult.vue';
import popupEquivalentSrc from './components/popupEquivalentSrc.vue';
import popupHelp from './components/popupHelp.vue';

import toolStates from './states.js';
import EventBus from './components/jsFolder/event-bus';

import Circuit from './components/jsFolder/constructorComponent/Circuit.js';

import { resetNbFromComp } from './components/jsFolder/dropComponent';

export default {
  name: 'App',
  components: {
    MenuBar,
    ToolBar,
    BigBody,

    popupAboutUs,
    popupSettings,
    popupComp,
    popupResult,
    popupEquivalentSrc,
    popupHelp
  },
  emits: ['tool-state-changed'],
  mounted: function() {
    EventBus.on('PUSchangeLanguage', newL => {
      this.updateLanguage(newL);
    });
    EventBus.on('MBaboutUs', () => {
      this.openClosePopupAboutUs();
    });
    EventBus.on('MBsettings', () => {
      this.openClosePopupSettings();
    });
    EventBus.on('MBequivalentSource', () => {
      this.openClosePopupEquivalentSrc();
    });
    EventBus.on('MBhelp', () => {
      this.openClosePopupHelp();
    });
    EventBus.on('PUSpredVal', predValue => {
      this.withPredefinedValue = predValue;
    });
    EventBus.on('BBcomp', compToPass => {
      console.log('modif', compToPass.name);
      this.theCompoToPass = compToPass;
      this.openClosePopupComp();
    });
    EventBus.on('BBresult', () => {
      this.openClosePopupResult();
    });
    EventBus.on('BBSave', () => {
      this.save();
    });
  },
  data() {
    return {
      currentLanguage: 'en', //default language
      locales: [
        { id: 'en', name: 'English' },
        { id: 'de', name: 'Deutsch' }
      ],
      tool: toolStates.STATE_IDLE, //default first state
      theCircuit: new Circuit([], []), //init a circuit
      undoRedoData: {
        // state history [older,...,younger]
        history: [new Circuit([], [])], //1st state in history written manual
        position: 0,
        historyMaxLength: 100
      },

      isPopupAboutUsVisible: false,
      isPopupSettingsVisible: false,
      isPopupCompVisible: false,
      isPopupResultVisible: false,
      isPopupEquivalentSrcVisible: false,
      isPopupHelpVisible: false,

      withPredefinedValue: true,
      theCompoToPass: null
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
    setCircuit(newCir) {
      if (newCir) {
        this.theCircuit = newCir;
      } else {
        this.theCircuit = new Circuit([], []);
        //** Restart all nb drop on 0
        resetNbFromComp();
      }
    },
    /**
     * #region Undo Redo function
     */
    save() {
      const deepCopy = this.theCircuit.project();
      this.setValue(deepCopy);
    },
    setValue(value) {
      if (this.undoRedoData.position < this.undoRedoData.history.length - 1) {
        this.sliceHistory(this.undoRedoData.position + 1);
      }
      if (
        this.undoRedoData.position ===
        this.undoRedoData.historyMaxLength - 1
      ) {
        this.shiftHistory();
        this.setPosition(-1);
      }
      this.pushHistory(value);
      this.setPosition(1);
    },
    shiftHistory() {
      this.undoRedoData.history.shift();
    },
    sliceHistory(pos) {
      this.undoRedoData.history = this.undoRedoData.history.slice(0, pos);
    },
    pushHistory(val) {
      this.undoRedoData.history.push(val);
    },
    /**
     * #endregion
     */

    openClosePopupAboutUs: function() {
      this.isPopupAboutUsVisible = !this.isPopupAboutUsVisible;
    },
    openClosePopupSettings() {
      this.isPopupSettingsVisible = !this.isPopupSettingsVisible;
    },
    openClosePopupComp: function() {
      // situation: click on close button from pop up windows
      if (this.isPopupCompVisible) {
        this.save();
      }
      this.isPopupCompVisible = !this.isPopupCompVisible;
    },
    openClosePopupResult() {
      this.isPopupResultVisible = !this.isPopupResultVisible;
    },
    openClosePopupEquivalentSrc: function() {
      this.isPopupEquivalentSrcVisible = !this.isPopupEquivalentSrcVisible;
    },
    openClosePopupHelp: function() {
      this.isPopupHelpVisible = !this.isPopupHelpVisible;
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
