<template>
  <div class="toolBar">
    <div class="third">
      <div
        class="content_img"
        v-bind:class="{
          greenClass: selectedTool === toolState.TOOL_DELETE
        }"
      >
        <button @click="deleteItem">
          <span class="mdi mdi-delete mdi-48px"></span>
        </button>
        <div>{{ deleteIcon[getCurrentLanguage] }}</div>
      </div>
      <div
        class="content_img"
        v-bind:class="{
          greenClass: selectedTool === toolState.TOOL_ROTATE
        }"
      >
        <button @click="rotateItem">
          <span class="mdi mdi-rotate-right mdi-48px"></span>
        </button>
        <div>{{ rotate[getCurrentLanguage] }}</div>
      </div>
      <div
        class="content_img"
        v-bind:class="{
          greenClass: selectedTool === toolState.TOOL_MOVE
        }"
      >
        <button @click="movementItem">
          <span class="mdi mdi-cursor-move mdi-48px"></span>
        </button>
        <div>{{ movement[getCurrentLanguage] }}</div>
      </div>
      <div
        class="content_img"
        v-bind:class="{
          greenClass: selectedTool === toolState.TOOL_SELECT
        }"
      >
        <button @click="selectItem">
          <span class="mdi mdi-select mdi-48px"></span>
        </button>
        <div>{{ select[getCurrentLanguage] }}</div>
      </div>
      <div
        class="content_img"
        v-bind:class="{
          greenClass: selectedTool === toolState.STATE_IDLE
        }"
      >
        <button @click="mouseItem">
          <span class="mdi mdi-cursor-default-outline mdi-48px"></span>
        </button>
        <div>{{ mouse[getCurrentLanguage] }}</div>
      </div>
    </div>
    <div class="third">
      <div class="content_img">
        <button @click="undo" :disabled="!canUndo">
          <span class="mdi mdi-undo mdi-24px"></span>
        </button>
        <div>{{ undo_data[getCurrentLanguage] }}</div>
      </div>
      <div class="content_img">
        <button @click="redo" :disabled="!canRedo">
          <span class="mdi mdi-redo mdi-24px"></span>
        </button>
        <div>{{ redo_data[getCurrentLanguage] }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import toolStates from '../states.js';

export default {
  //name: 'TitleBanner',
  props: {
    //variable, who I obtain from App.vue (one stage up of this stage)
    //I need to give the type, after that I can us it into html part like {{...}}
    currentLanguage: String,
    selectedTool: Number,
    undoRedoData: Object
  },
  emits: ['click', 'tool-state-changed', 'set-position', 'set-circuit'],
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
      mouse: { en: 'Edit', de: 'Bearbeiten' },
      undo_data: { en: 'Undo', de: 'Undo' },
      redo_data: { en: 'Redo', de: 'Redo' },

      toolState: toolStates
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
      deepcopy.components.forEach(element => {
        element.recalculatePins();
      });
      this.$emit('set-circuit', deepcopy);
    },
    redo() {
      if (this.undoRedoData.position < this.undoRedoData.history.length - 1) {
        this.$emit('set-position', 1);
      }
      let deepcopy = this.undoRedoData.history[
        this.undoRedoData.position
      ].project();
      deepcopy.components.forEach(element => {
        element.recalculatePins();
      });
      this.$emit('set-circuit', deepcopy);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
.content_img:hover div {
  visibility: visible;
  opacity: 0.7;
}

.content_img button:hover {
  cursor: pointer;
}
.content_img button {
  border: none;
  height: 100%;
  margin: 0px 7px 0px 0px;
  background-color: white;
  width: 50px;
  padding: 0px;
}
.greenClass button {
  background-color: green;
}
</style>
