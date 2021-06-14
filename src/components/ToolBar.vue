<template>
  <div class="toolBar">
    <!--<div class="first">
      <div class="content_img">
        <img alt="New" src="@/assets/toolBar/new.svg" draggable="false" />
        <div>{{ neu[getCurrentLanguage] }}</div>
      </div>
      <div class="content_img">
        <img alt="Open" src="@/assets/toolBar/open.svg" draggable="false" />
        <div>{{ open[getCurrentLanguage] }}</div>
      </div>
      <div class="content_img">
        <img alt="Save As" src="@/assets/toolBar/save.svg" draggable="false" />
        <div>{{ saveAs[getCurrentLanguage] }}</div>
      </div>
    </div>-->

    <!--<div class="second">
      <div class="content_img">
        <img alt="Cut" src="@/assets/toolBar/cut.svg" draggable="false" />
        <div>{{ cut[getCurrentLanguage] }}</div>
      </div>
      <div class="content_img">
        <img alt="Copy" src="@/assets/toolBar/copy.svg" draggable="false" />
        <div>{{ copy[getCurrentLanguage] }}</div>
      </div>
      <div class="content_img">
        <img alt="Paste" src="@/assets/toolBar/paste.svg" draggable="false" />
        <div>{{ paste[getCurrentLanguage] }}</div>
      </div>
    </div>-->

    <div class="third">
      <div
        class="content_img"
        v-bind:class="{
          greenClass: selectedTool === toolState.TOOL_DELETE
        }"
      >
        <img
          alt="Delete"
          src="@/assets/toolBar/delete.svg"
          draggable="false"
          @click="deleteItem"
        />
        <div>{{ deleteIcon[getCurrentLanguage] }}</div>
      </div>
      <div
        class="content_img"
        v-bind:class="{
          greenClass: selectedTool === toolState.TOOL_ROTATE
        }"
      >
        <img
          alt="Rotate"
          src="@/assets/toolBar/rotate.svg"
          draggable="false"
          @click="rotateItem"
        />
        <div>{{ rotate[getCurrentLanguage] }}</div>
      </div>
      <div
        class="content_img"
        v-bind:class="{
          greenClass: selectedTool === toolState.TOOL_MOVE
        }"
      >
        <img
          alt="Movement"
          src="@/assets/toolBar/moveIcon.svg"
          draggable="false"
          @click="movementItem"
        />
        <div>{{ movement[getCurrentLanguage] }}</div>
      </div>
      <div
        class="content_img"
        v-bind:class="{
          greenClass: selectedTool === toolState.TOOL_SELECT
        }"
      >
        <img
          alt="Select"
          src="@/assets/toolBar/select.svg"
          draggable="false"
          @click="selectItem"
        />
        <div>{{ select[getCurrentLanguage] }}</div>
      </div>
      <div class="content_img">
        <img
          alt="Mouse"
          src="@/assets/toolBar/mouse.svg"
          draggable="false"
          @click="mouseItem"
        />
        <div>{{ mouse[getCurrentLanguage] }}</div>
      </div>
    </div>
    <div class="third">
      <button @click="undo" :disabled="!canUndo" style="margin-right:10px">
        Undo
      </button>
      <button @click="redo" :disabled="!canRedo">Redo</button>
    </div>
    <div class="third">
      {{ presVal[getCurrentLanguage] }}
      <input
        type="checkbox"
        id="defValue"
        @change="predefinedValues"
        v-model="withPredValue"
      />
      (R=1000Ω; I=1A; U=10V)
    </div>
  </div>
</template>

<script>
import toolStates from '../states.js';
import EventBus from './jsFolder/event-bus.js';

export default {
  //name: 'TitleBanner',
  props: {
    //variable, who I obtain from App.vue (one stage up of this stage)
    //I need to give the type, after that I can us it into html part like {{...}}
    currentLanguage: String,
    selectedTool: Number,
    circuit: Object,
    undoRedoData: Object
  },
  data() {
    return {
      neu: { en: 'New', de: 'Neu' },
      open: { en: 'Open', de: 'Öffnen' },
      saveAs: { en: 'Save As', de: 'Speichern als' },
      copy: { en: 'Copy', de: 'Kopieren' },
      cut: { en: 'Cut', de: 'Schneiden' },
      paste: { en: 'Paste', de: 'Einfügen' },
      deleteIcon: { en: 'Delete', de: 'Löschen' },
      rotate: { en: 'Rotate', de: 'Drehen' },
      movement: { en: 'Move', de: 'Bewegen' },
      select: { en: 'Select', de: 'Wählen' },
      mouse: { en: 'Reset', de: 'Reset' },
      presVal: { en: 'predefined values', de: 'vordefinierte Werte' },

      toolState: toolStates,
      withPredValue: false
    };
  },
  computed: {
    getCurrentLanguage: function() {
      return this.currentLanguage;
    },
    canUndo: function() {
      return this.undoRedoData.position > 0;
    },
    canRedo: function() {
      return (
        this.undoRedoData.history.length - 1 - this.undoRedoData.position > 0
      );
    }
  },
  methods: {
    deleteItem: function() {
      this.$emit('tool-state-changed', this.toolState.TOOL_DELETE);
    },
    rotateItem: function() {
      this.$emit('tool-state-changed', this.toolState.TOOL_ROTATE);
    },
    movementItem: function() {
      this.$emit('tool-state-changed', this.toolState.TOOL_MOVE);
    },
    selectItem: function() {
      this.$emit('tool-state-changed', this.toolState.TOOL_SELECT);
    },
    mouseItem: function() {
      this.$emit('tool-state-changed', this.toolState.STATE_IDLE);
    },
    // Undo and Redo
    undo() {
      if (this.undoRedoData.position > 0) {
        this.$emit('set-position', -1);
      }
      let deepcopy = this.undoRedoData.history[
        this.undoRedoData.position
      ].project();
      this.$emit('set-circuit', deepcopy);
    },
    redo() {
      if (this.undoRedoData.position < this.undoRedoData.history.length - 1) {
        this.$emit('set-position', 1);
      }
      let deepcopy = this.undoRedoData.history[
        this.undoRedoData.position
      ].project();
      this.$emit('set-circuit', deepcopy);
    },
    predefinedValues() {
      console.log('OK', this.withPredValue);
      EventBus.$emit('TBpredVal', this.withPredValue);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
img {
  width: auto;
  height: 50px;
  margin: 0px 7px 0px 0px;
  background-color: white;
}
.greenClass img {
  background-color: green;
}

.toolBar {
  display: flex;
  background-color: #f2f2f2;
  height: 50px;
  margin-bottom: 20px;
}
.first {
  display: flex;
}
.second {
  margin-left: 40px;
  display: flex;
}
.third {
  margin-left: 40px;
  display: flex;
}

/* Print the text below the image when you move the mouse over the image */
/* Child Text Container */
.content_img div {
  position: inherit;
  background: black;
  color: white;
  font-family: sans-serif;
  opacity: 0;
  visibility: hidden;
  -webkit-transition: visibility 0s, opacity 0.5s linear;
  transition: visibility 0s, opacity 0.5s linear;
}
/* Hover on Parent Container */
.content_img:hover {
  cursor: pointer;
}
.content_img:hover div {
  visibility: visible;
  opacity: 0.7;
}
.content_img img {
  width: 50px;
}
</style>
