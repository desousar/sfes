<template>
  <div class="toolBar">
    <div class="third">
      <div
        class="content_img"
        v-bind:class="{
          greenClass: props.selectedTool === state.toolState.TOOL_DELETE
        }"
      >
        <button @click="deleteItem">
          <span class="mdi mdi-delete mdi-48px"></span>
        </button>
        <div>{{ language.deleteIcon[getCurrentLanguage] }}</div>
      </div>
      <div
        class="content_img"
        v-bind:class="{
          greenClass: props.selectedTool === state.toolState.TOOL_ROTATE
        }"
      >
        <button @click="rotateItem">
          <span class="mdi mdi-rotate-right mdi-48px"></span>
        </button>
        <div>{{ language.rotate[getCurrentLanguage] }}</div>
      </div>
      <div
        class="content_img"
        v-bind:class="{
          greenClass: props.selectedTool === state.toolState.TOOL_MOVE
        }"
      >
        <button @click="movementItem">
          <span class="mdi mdi-cursor-move mdi-48px"></span>
        </button>
        <div>{{ language.movement[getCurrentLanguage] }}</div>
      </div>
      <div
        class="content_img"
        v-bind:class="{
          greenClass: props.selectedTool === state.toolState.TOOL_SELECT
        }"
      >
        <button @click="selectItem">
          <span class="mdi mdi-select mdi-48px"></span>
        </button>
        <div>{{ language.select[getCurrentLanguage] }}</div>
      </div>
      <div
        class="content_img"
        v-bind:class="{
          greenClass: props.selectedTool === state.toolState.STATE_IDLE
        }"
      >
        <button @click="mouseItem">
          <span class="mdi mdi-cursor-default-outline mdi-48px"></span>
        </button>
        <div>{{ language.mouse[getCurrentLanguage] }}</div>
      </div>
    </div>
    <div class="third">
      <div class="content_img">
        <button
          @click="undo"
          :disabled="!canUndo"
        >
          <span class="mdi mdi-undo mdi-24px"></span>
        </button>
        <div>{{ language.undo_data[getCurrentLanguage] }}</div>
      </div>
      <div class="content_img">
        <button
          @click="redo"
          :disabled="!canRedo"
        >
          <span class="mdi mdi-redo mdi-24px"></span>
        </button>
        <div>{{ language.redo_data[getCurrentLanguage] }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, defineProps, defineEmits } from 'vue';

import toolStates from '@/states.js';

const props = defineProps({
  currentLanguage: String,
  selectedTool: Number,
  undoRedoData: Object
});

const emit = defineEmits(['tool-state-changed', 'set-position', 'set-circuit']);

const state = reactive({
  toolState: toolStates
});
const language = reactive({
  deleteIcon: { en: 'Delete', de: 'Löschen' },
  rotate: { en: 'Rotate', de: 'Drehen' },
  movement: { en: 'Move', de: 'Bewegen' },
  select: { en: 'Select', de: 'Wählen' },
  mouse: { en: 'Edit', de: 'Bearbeiten' },
  undo_data: { en: 'Undo', de: 'Undo' },
  redo_data: { en: 'Redo', de: 'Redo' }
});

const getCurrentLanguage = computed(() => {
  return props.currentLanguage;
});
const canUndo = computed(() => {
  return props.undoRedoData.position > 0;
});
const canRedo = computed(() => {
  return (
    props.undoRedoData.history.length - 1 - props.undoRedoData.position > 0
  );
});

function deleteItem() {
  emit('tool-state-changed', state.toolState.TOOL_DELETE);
}
function rotateItem() {
  emit('tool-state-changed', state.toolState.TOOL_ROTATE);
}
function movementItem() {
  emit('tool-state-changed', state.toolState.TOOL_MOVE);
}
function selectItem() {
  emit('tool-state-changed', state.toolState.TOOL_SELECT);
}
function mouseItem() {
  emit('tool-state-changed', state.toolState.STATE_IDLE);
}
// Undo and Redo
function undo() {
  if (props.undoRedoData.position > 0) {
    emit('set-position', -1);
  }
  let deepcopy =
    props.undoRedoData.history[props.undoRedoData.position].project();
  deepcopy.components.forEach((element) => {
    element.recalculatePins();
  });
  emit('set-circuit', deepcopy);
}
function redo() {
  if (props.undoRedoData.position < props.undoRedoData.history.length - 1) {
    emit('set-position', 1);
  }
  let deepcopy =
    props.undoRedoData.history[props.undoRedoData.position].project();
  deepcopy.components.forEach((element) => {
    element.recalculatePins();
  });
  emit('set-circuit', deepcopy);
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.toolBar {
  display: flex;
  background-color: #f2f2f2;
  height: 50px;
  margin-bottom: 20px;
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
