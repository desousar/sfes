<template>
  <div class="globalBar">
    <div class="dropdown" id="marginL2px">
      <button class="dropbtn">{{ file[getCurrentLanguage] }}</button>
      <div class="dropdown-content">
        <button class="custom-btn" @click="getEmptyCircuit()">
          {{ neu[getCurrentLanguage] }}
        </button>
        <label class="custom-labelInput">
          <input
            type="file"
            id="fileInput"
            ref="fileupload"
            @change="openFile"
            @click="onInputClick"
          />
          {{ open[getCurrentLanguage] }}
        </label>
        <label class="custom-labelInput">
          <input type="button" id="fileSave" @click="saveFile()" />
          {{ saveAs[getCurrentLanguage] }}
        </label>
        <button class="custom-btn" @click="capture()">
          {{ exportToPDF_data[getCurrentLanguage] }}
        </button>
      </div>
    </div>
    <div class="dropdown" id="marginL2px">
      <button class="dropbtn">{{ view_data[getCurrentLanguage] }}</button>
      <div class="dropdown-content">
        <button class="custom-btn" @click="a4Format()">
          <span v-if="a4FormatBool_data" class="mdi mdi-check-bold"></span>
          {{ a4Format_data[getCurrentLanguage] }}
        </button>
        <button class="custom-btn" @click="gridPoint()">
          <span v-if="gridPointBool_data" class="mdi mdi-check-bold"></span>
          {{ gridPoint_data[getCurrentLanguage] }}
        </button>
        <button class="custom-btn" @click="gridLine()">
          <span v-if="gridLineBool_data" class="mdi mdi-check-bold"></span>
          {{ gridLine_data[getCurrentLanguage] }}
        </button>
      </div>
    </div>

    <div class="dropdown" id="marginL2px">
      <button class="dropbtn">{{ resolve_data[getCurrentLanguage] }}</button>
      <div class="dropdown-content">
        <button class="custom-btn" @click="solve()">
          {{ solve_data[getCurrentLanguage] }}
        </button>
        <button class="custom-btn" @click="equivalentSource()">
          {{ equivalent[getCurrentLanguage] }}
        </button>
      </div>
    </div>

    <div class="dropdown" id="marginL2px">
      <button class="dropbtn" @click="settings()">
        {{ setting_data[getCurrentLanguage] }}
      </button>
    </div>

    <div class="dropdown" id="marginL2px">
      <button class="dropbtn">{{ help_data[getCurrentLanguage] }}</button>
      <div class="dropdown-content">
        <button class="custom-btn" @click="help()">
          {{ help_data[getCurrentLanguage] }}
        </button>
        <button class="custom-btn" @click="aboutUs()">
          {{ aboutUs_data[getCurrentLanguage] }}
        </button>
      </div>
    </div>

    <div class="title">
      <img class="logo" alt="BeNetz" src="../assets/logo.svg" />
      <p id="titledescription">{{ titledescription[getCurrentLanguage] }}</p>
    </div>
  </div>
</template>

<script>
import EventBus from './jsFolder/event-bus.js';

export default {
  props: {
    //variable, who I obtain from App.vue (one stage up of this stage)
    //I need to give the type, after that I can us it into html part like {{...}}
    currentLanguage: String
  },
  data() {
    return {
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
      titledescription: {
        en: 'Simulation tool for electronic circuits',
        de: 'Simulationstool für elektronische Schaltungen'
      },

      a4FormatBool_data: false,
      gridPointBool_data: false,
      gridLineBool_data: false
    };
  },
  computed: {
    getCurrentLanguage() {
      return this.currentLanguage;
    }
  },
  methods: {
    capture() {
      EventBus.$emit('MBcapture');
    },
    a4Format() {
      this.a4FormatBool_data = !this.a4FormatBool_data;
      EventBus.$emit('MBa4Format', this.a4FormatBool_data);
    },
    gridPoint() {
      this.gridPointBool_data = !this.gridPointBool_data;
      EventBus.$emit('MBsetGridPoint', this.gridPointBool_data);
      if (this.gridLineBool_data) {
        this.gridLineBool_data = !this.gridLineBool_data;
        EventBus.$emit('MBsetGridLine', this.gridLineBool_data);
      }
    },
    gridLine() {
      this.gridLineBool_data = !this.gridLineBool_data;
      EventBus.$emit('MBsetGridLine', this.gridLineBool_data);
      if (this.gridPointBool_data) {
        this.gridPointBool_data = !this.gridPointBool_data;
        EventBus.$emit('MBsetGridPoint', this.gridPointBool_data);
      }
    },
    solve() {
      EventBus.$emit('MBsolve');
    },

    openFile() {
      console.log('openFile');
      EventBus.$emit('MBopenFile');
    },
    onInputClick() {
      console.log('reset fileupload value');
      this.$refs.fileupload.value = null;
    },

    saveFile() {
      EventBus.$emit('MBsaveFile');
    },
    equivalentSource() {
      EventBus.$emit('MBequivalentSource');
    },
    getEmptyCircuit() {
      EventBus.$emit('MBgetEmptyCircuit');
    },
    settings() {
      EventBus.$emit('MBsettings');
    },
    help() {
      EventBus.$emit('MBhelp');
    },
    aboutUs() {
      EventBus.$emit('MBaboutUs');
    }
  }
};
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
  margin: 0 auto;
}
</style>
