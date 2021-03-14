<template>
  <div class="menuBar">
    <div class="dropdown" id="file">
      <button class="dropbtn">{{ file[getCurrentLanguage] }}</button>
      <div class="dropdown-content">
        <button class="custom-btn" @click="getEmptyCircuit()">
          {{ neu[getCurrentLanguage] }}
        </button>
        <label class="custom-labelInput">
          <input type="file" id="fileInput" @change="openFile()" />
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
    <!--
    <div class="dropdown" id="file">
      <button class="dropbtn">{{ edit[getCurrentLanguage] }}</button>
      <div class="dropdown-content">
        <a href="#">{{ copy[getCurrentLanguage] }}</a>
        <a href="#">{{ cut[getCurrentLanguage] }}</a>
        <a href="#">{{ paste[getCurrentLanguage] }}</a>
      </div>
    </div>
    -->
    <div class="dropdown" id="file">
      <button class="dropbtn">{{ view_data[getCurrentLanguage] }}</button>
      <div class="dropdown-content">
        <button class="custom-btn" @click="a4Format()">
          <span v-if="a4FormatBool_data" class="mdi mdi-check-bold"></span>
          {{ a4Format_data[getCurrentLanguage] }}
        </button>
      </div>
    </div>
    <div class="dropdown" id="file">
      <button class="dropbtn" @click="solve()">
        {{ solve_data[getCurrentLanguage] }}
      </button>
    </div>
    <div class="dropdown" id="file">
      <button class="dropbtn" @click="equivalentSource()">
        {{ equivalent[getCurrentLanguage] }}
      </button>
    </div>

    <div class="dropdown" id="file">
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
  </div>
</template>

<script>
import EventBus from "./jsFolder/event-bus.js";

export default {
  props: {
    //variable, who I obtain from App.vue (one stage up of this stage)
    //I need to give the type, after that I can us it into html part like {{...}}
    currentLanguage: String,
  },
  data() {
    return {
      file: { en: "File", de: "Datei" },
      neu: { en: "New", de: "Neu" },
      open: { en: "Open", de: "Öffnen" },
      saveAs: { en: "Save As", de: "Speichern als" },
      edit: { en: "Edit", de: "Bearbeiten" },
      copy: { en: "Copy", de: "Kopieren" },
      cut: { en: "Cut", de: "Schneiden" },
      paste: { en: "Paste", de: "Einfügen" },
      exportToPDF_data: { en: "Export to PDF", de: "Export to PDF" },
      view_data: { en: "View", de: "Ansicht" },
      a4Format_data: {
        en: "Show Page Limit (A4)",
        de: "Seitengrenze anzeigen (A4)",
      },
      solve_data: { en: "Solve", de: "Berechnen" },
      equivalent: { en: "Equivalent source", de: "Ersatzquelle" },
      help_data: { en: "Help", de: "Hilfe" },
      aboutUs_data: { en: "About us", de: "Über uns" },

      a4FormatBool_data: false,
    };
  },
  computed: {
    getCurrentLanguage: function () {
      return this.currentLanguage;
    },
  },
  methods: {
    capture: function () {
      EventBus.$emit("MBcapture");
    },
    a4Format: function () {
      this.a4FormatBool_data = !this.a4FormatBool_data;
      EventBus.$emit("MBa4Format", this.a4FormatBool_data);
    },
    solve: function () {
      EventBus.$emit("MBsolve");
    },

    openFile: function () {
      EventBus.$emit("MBopenFile");
    },
    saveFile: function () {
      EventBus.$emit("MBsaveFile");
    },
    equivalentSource: function () {
      EventBus.$emit("MBequivalentSource");
    },
    getEmptyCircuit: function () {
      EventBus.$emit("MBgetEmptyCircuit");
    },
    help: function () {
      EventBus.$emit("MBhelp");
    },
    aboutUs: function () {
      EventBus.$emit("MBaboutUs");
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#file {
  margin-right: 2px;
}
#aboutUs {
  float: right;
}

.dropbtn {
  color: black;
  padding: 16px 24px;
  font-size: 16px;
  border: none;
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
  padding: 12px 16px;
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
input[type="file"] {
  display: none;
}
.custom-labelInput {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}
.custom-labelInput:hover {
  background-color: #ddd;
}
input[type="button"] {
  display: none;
}
/*^ open button*/

.custom-btn {
  color: black;
  padding: 12px 16px;
  display: block;
  border: none;
  font-size: 16px;
  width: 100%;
  text-align: left;
  font-family: "Times New Roman", Helvetica, Arial, serif;
}
.custom-btn:hover {
  background-color: #ddd;
}
</style>