<!-- undo redo Memento Pattern src: 
https://codepen.io/zerbene/pen/oNZPWdY
https://medium.com/fbbd/intro-to-writing-undo-redo-systems-in-javascript-af17148a852b
-->

<template>
  <div id="app">
    <MenuBar :currentLanguage="state.currentLanguage" />
    <ToolBar
      :currentLanguage="state.currentLanguage"
      :selectedTool="state.tool"
      @tool-state-changed="onToolStateChanged"
      @set-circuit="setCircuit"
      :undoRedoData="state.undoRedoData"
      @set-position="setPosition"
    />
    <BigBody
      :currentLanguage="state.currentLanguage"
      :withPredefinedValue="state.withPredefinedValue"
      :selectedTool="state.tool"
      @tool-state-changed="onToolStateChanged"
      :theCircuit="state.theCircuit"
      @set-circuit="setCircuit"
      :undoRedoData="state.undoRedoData"
      @set-position="setPosition"
      @shift-history="shiftHistory"
      @slice-history="sliceHistory"
      @push-history="pushHistory"
    />

    <!-- Pop Up Windows -->

    <popupAboutUs
      v-show="state.isPopupAboutUsVisible"
      @close="openClosePopupAboutUs"
      :currentLanguage="state.currentLanguage"
    />

    <popupSettings
      v-show="state.isPopupSettingsVisible"
      @close="openClosePopupSettings"
      :currentLanguage="state.currentLanguage"
      :locales="state.locales"
      :withPredefinedValue="state.withPredefinedValue"
    />

    <popupComp
      v-show="state.isPopupCompVisible"
      @close="openClosePopupComp"
      :theCompoToPass="state.theCompoToPass"
      :arrayComponents="state.theCircuit.components"
      :currentLanguage="state.currentLanguage"
      :isPopupCompVisible="state.isPopupCompVisible"
    />

    <popupResult
      v-show="state.isPopupResultVisible"
      @close="openClosePopupResult"
      :arrayComponents="state.theCircuit.components"
      :currentLanguage="state.currentLanguage"
      :isPopupResultVisible="state.isPopupResultVisible"
    />

    <popupEquivalentSrc
      v-show="state.isPopupEquivalentSrcVisible"
      @close="openClosePopupEquivalentSrc"
      :circuitcomplet="state.theCircuit"
      :currentLanguage="state.currentLanguage"
    />

    <popupHelp
      v-show="state.isPopupHelpVisible"
      @close="openClosePopupHelp"
      :currentLanguage="state.currentLanguage"
    />
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';

import MenuBar from '@/components/MenuBar.vue';
import ToolBar from '@/components/ToolBar.vue';
import BigBody from '@/components/BigBody.vue';

import popupAboutUs from '@/components/popupAboutUs.vue';
import popupSettings from '@/components/popupSettings.vue';
import popupComp from '@/components/popupComp.vue';
import popupResult from '@/components/popupResult.vue';
import popupEquivalentSrc from '@/components/popupEquivalentSrc.vue';
import popupHelp from '@/components/popupHelp.vue';

import toolStates from '@/states.js';
import EventBus from '@/components/jsFolder/event-bus';

import Circuit from '@/components/CircuitClass/Circuit.js';

import { resetNbFromComp } from '@/components/CircuitClass/handleComponent/CreateComponent.js';

onMounted(() => {
  EventBus.on('PUSchangeLanguage', (newL) => {
    updateLanguage(newL);
  });
  EventBus.on('MBaboutUs', () => {
    openClosePopupAboutUs();
  });
  EventBus.on('MBsettings', () => {
    openClosePopupSettings();
  });
  EventBus.on('MBequivalentSource', () => {
    openClosePopupEquivalentSrc();
  });
  EventBus.on('MBhelp', () => {
    openClosePopupHelp();
  });
  EventBus.on('PUSpredVal', (predValue) => {
    state.withPredefinedValue = predValue;
  });
  EventBus.on('BBcomp', (compToPass) => {
    console.log('modif', compToPass.name);
    state.theCompoToPass = compToPass;
    openClosePopupComp();
  });
  EventBus.on('BBresult', () => {
    openClosePopupResult();
  });
  EventBus.on('BBSave', () => {
    save();
  });
});

const state = reactive({
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
});

function updateLanguage(updatedLanguage) {
  state.currentLanguage = updatedLanguage;
}

function onToolStateChanged(nextState) {
  state.tool = nextState;
}
function setPosition(val) {
  state.undoRedoData.position += val;
}
function setCircuit(newCir) {
  if (newCir) {
    state.theCircuit = newCir;
  } else {
    state.theCircuit = new Circuit([], []);
    //** Restart all nb drop on 0
    resetNbFromComp();
  }
}
/**
 * #region Undo Redo function
 */
function save() {
  const deepCopy = state.theCircuit.project();
  setValue(deepCopy);
}
function setValue(value) {
  if (state.undoRedoData.position < state.undoRedoData.history.length - 1) {
    sliceHistory(state.undoRedoData.position + 1);
  }
  if (state.undoRedoData.position === state.undoRedoData.historyMaxLength - 1) {
    shiftHistory();
    setPosition(-1);
  }
  pushHistory(value);
  setPosition(1);
}
function shiftHistory() {
  state.undoRedoData.history.shift();
}
function sliceHistory(pos) {
  state.undoRedoData.history = state.undoRedoData.history.slice(0, pos);
}
function pushHistory(val) {
  state.undoRedoData.history.push(val);
}
/**
 * #endregion
 */

function openClosePopupAboutUs() {
  state.isPopupAboutUsVisible = !state.isPopupAboutUsVisible;
}
function openClosePopupSettings() {
  state.isPopupSettingsVisible = !state.isPopupSettingsVisible;
}
function openClosePopupComp() {
  // situation: click on close button from pop up windows
  if (state.isPopupCompVisible) {
    save();
  }
  state.isPopupCompVisible = !state.isPopupCompVisible;
}
function openClosePopupResult() {
  state.isPopupResultVisible = !state.isPopupResultVisible;
}
function openClosePopupEquivalentSrc() {
  state.isPopupEquivalentSrcVisible = !state.isPopupEquivalentSrcVisible;
}
function openClosePopupHelp() {
  state.isPopupHelpVisible = !state.isPopupHelpVisible;
}
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
