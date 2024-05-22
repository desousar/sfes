<template>
  <div class="globalBar">
    <div
      class="dropdown"
      id="marginL2px"
    >
      <button class="dropbtn">{{ language.file[getCurrentLanguage] }}</button>
      <div class="dropdown-content">
        <button
          class="custom-btn"
          @click="getEmptyCircuit()"
        >
          {{ language.neu[getCurrentLanguage] }}
        </button>
        <label class="custom-labelInput">
          <input
            type="file"
            id="fileInput"
            ref="fileupload"
            @change="openFile"
            @click="onInputClick"
          />
          {{ language.open[getCurrentLanguage] }}
        </label>
        <label class="custom-labelInput">
          <input
            type="button"
            id="fileSave"
            @click="saveFile()"
          />
          {{ language.saveAs[getCurrentLanguage] }}
        </label>
        <button
          class="custom-btn"
          @click="capture()"
        >
          {{ language.exportToPDF_data[getCurrentLanguage] }}
        </button>
      </div>
    </div>
    <div
      class="dropdown"
      id="marginL2px"
    >
      <button class="dropbtn">
        {{ language.view_data[getCurrentLanguage] }}
      </button>
      <div class="dropdown-content">
        <button
          class="custom-btn"
          @click="a4Format()"
        >
          <span
            v-if="state.a4FormatBool_data"
            class="mdi mdi-check-bold"
          ></span>
          {{ language.a4Format_data[getCurrentLanguage] }}
        </button>
        <button
          class="custom-btn"
          @click="gridPoint()"
        >
          <span
            v-if="state.gridPointBool_data"
            class="mdi mdi-check-bold"
          ></span>
          {{ language.gridPoint_data[getCurrentLanguage] }}
        </button>
        <button
          class="custom-btn"
          @click="gridLine()"
        >
          <span
            v-if="state.gridLineBool_data"
            class="mdi mdi-check-bold"
          ></span>
          {{ language.gridLine_data[getCurrentLanguage] }}
        </button>
      </div>
    </div>

    <div
      class="dropdown"
      id="marginL2px"
    >
      <button class="dropbtn">
        {{ language.resolve_data[getCurrentLanguage] }}
      </button>
      <div class="dropdown-content">
        <button
          class="custom-btn"
          @click="solve()"
        >
          {{ language.solve_data[getCurrentLanguage] }}
        </button>
        <button
          class="custom-btn"
          @click="equivalentSource()"
        >
          {{ language.equivalent[getCurrentLanguage] }}
        </button>
      </div>
    </div>

    <div
      class="dropdown"
      id="marginL2px"
    >
      <button
        class="dropbtn"
        @click="settings()"
      >
        {{ language.setting_data[getCurrentLanguage] }}
      </button>
    </div>

    <div
      class="dropdown"
      id="marginL2px"
    >
      <button class="dropbtn">
        {{ language.help_data[getCurrentLanguage] }}
      </button>
      <div class="dropdown-content">
        <button
          class="custom-btn"
          @click="help()"
        >
          {{ language.help_data[getCurrentLanguage] }}
        </button>
        <button
          class="custom-btn"
          @click="aboutUs()"
        >
          {{ language.aboutUs_data[getCurrentLanguage] }}
        </button>
      </div>
    </div>

    <div class="title">
      <img
        class="logo"
        alt="BeNet"
        src="../../assets/logo.svg"
      />
      <div id="descContainer">
        <p id="titledescription">
          {{ language.titledescription1[getCurrentLanguage] }}
        </p>
        <p id="titledescription">
          {{ language.titledescription2[getCurrentLanguage] }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineProps } from 'vue';

import EventBus from '@/components/jsFolder/event-bus.js';

const props = defineProps({
  currentLanguage: String
});

const state = reactive({
  a4FormatBool_data: false,
  gridPointBool_data: false,
  gridLineBool_data: false
});
const language = reactive({
  file: { en: 'File', de: 'Datei' },
  neu: { en: 'New', de: 'Neu' },
  open: { en: 'Open', de: 'Öffnen' },
  saveAs: { en: 'Save As', de: 'Speichern als' },
  edit: { en: 'Edit', de: 'Bearbeiten' },
  copy: { en: 'Copy', de: 'Kopieren' },
  cut: { en: 'Cut', de: 'Schneiden' },
  paste: { en: 'Paste', de: 'Einfügen' },
  exportToPDF_data: { en: 'Export to PDF', de: 'Export to PDF' },
  view_data: { en: 'View', de: 'Ansicht' },
  a4Format_data: {
    en: 'Show Page Limit (A4)',
    de: 'Seitengrenze anzeigen (A4)'
  },
  gridPoint_data: {
    en: 'Show Grid Point',
    de: 'Rasterpunkte anzeigen'
  },
  gridLine_data: {
    en: 'Show Grid Line',
    de: 'Rasterlinien anzeigen'
  },
  resolve_data: { en: 'Resolve', de: 'Lösen' },
  solve_data: { en: 'Solve circuit', de: 'Schaltung berechnen' },
  equivalent: { en: 'Equivalent source', de: 'Ersatzquelle' },
  setting_data: { en: 'Settings', de: 'Einstellungen' },
  help_data: { en: 'Help', de: 'Hilfe' },
  aboutUs_data: { en: 'About us', de: 'Über uns' },
  titledescription1: {
    en: 'Simulation tool for',
    de: 'Simulationstool für'
  },
  titledescription2: {
    en: 'electronic circuits',
    de: 'elektronische Schaltungen'
  }
});

const getCurrentLanguage = computed(() => {
  return props.currentLanguage;
});

function capture() {
  EventBus.emit('MBcapture');
}
function a4Format() {
  state.a4FormatBool_data = !state.a4FormatBool_data;
  EventBus.emit('MBa4Format', state.a4FormatBool_data);
}
function gridPoint() {
  state.gridPointBool_data = !state.gridPointBool_data;
  EventBus.emit('MBsetGridPoint', state.gridPointBool_data);
  if (state.gridLineBool_data) {
    state.gridLineBool_data = !state.gridLineBool_data;
    EventBus.emit('MBsetGridLine', state.gridLineBool_data);
  }
}
function gridLine() {
  state.gridLineBool_data = !state.gridLineBool_data;
  EventBus.emit('MBsetGridLine', state.gridLineBool_data);
  if (state.gridPointBool_data) {
    state.gridPointBool_data = !state.gridPointBool_data;
    EventBus.emit('MBsetGridPoint', state.gridPointBool_data);
  }
}
function solve() {
  EventBus.emit('MBsolve');
}

function openFile() {
  if (
    confirm(
      'The current file will be deleted when you create a new one. Are you sure ?'
    )
  ) {
    console.log('openFile');
    EventBus.emit('MBopenFile');
  }
}

const fileupload = ref(null);
function onInputClick() {
  console.log('reset fileupload value');
  fileupload.value = null;
}

function saveFile() {
  EventBus.emit('MBsaveFile');
}
function equivalentSource() {
  EventBus.emit('MBequivalentSource');
}
function getEmptyCircuit() {
  EventBus.emit('MBgetEmptyCircuit');
}
function settings() {
  EventBus.emit('MBsettings');
}
function help() {
  EventBus.emit('MBhelp');
}
function aboutUs() {
  EventBus.emit('MBaboutUs');
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.globalBar {
  height: 40.8px;
  display: flex;
  flex-direction: row;
}

#marginL2px {
  margin-left: 2px;
}

.dropbtn {
  color: black;
  padding: 12px 12px;
  font-size: 14px;
  border: none;
  white-space: nowrap;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 180px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 12px;
  text-decoration: none;
  display: block;
}

.dropdown-content a:hover {
  background-color: #ddd;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.dropdown:hover .dropbtn {
  background-color: #ddd;
}

/*v open button*/
input[type='file'] {
  display: none;
}
.custom-labelInput {
  color: black;
  padding: 12px 12px;
  font-size: 14px;
  text-decoration: none;
  display: block;
}
.custom-labelInput:hover {
  background-color: #ddd;
}
input[type='button'] {
  display: none;
}
/*^ open button*/

.custom-btn {
  color: black;
  padding: 12px 12px;
  display: block;
  border: none;
  font-size: 14px;
  width: 100%;
  text-align: left;
  font-family: 'Times New Roman', Helvetica, Arial, serif;
}
.custom-btn:hover {
  background-color: #ddd;
}

#languages {
  margin: 0px 5px;
}

/* TitleBanner */
.title {
  padding: 0px 10px;
  margin-left: auto;
  margin-right: 5px;
  white-space: nowrap;
  display: flex;
  align-items: flex-end;
}
.logo {
  height: 39px;
  width: auto;
  margin: auto 5px auto 0;
}
#titledescription {
  margin: 0;
}
#descContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 5px;
}
</style>
