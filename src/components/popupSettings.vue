<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->
<template>
  <transition name="modal-fade">
    <div
      class="modal-backdrop"
      @click="close()"
    >
      <div
        class="modalSettings"
        id="modalSettingsId"
        role="dialog"
        aria-labelledby="modalSettingsTitle"
        aria-describedby="modalSettingsDescription"
        @mousemove="moveMotion($event)"
        @mouseup="moveEnd($event)"
        @click.stop=""
      >
        <header
          class="modalSettings-header"
          id="modalSettingsTitle"
          @mousedown="moveStart($event)"
        >
          <slot name="header">
            {{ language.setting_data[getCurrentLanguage] }}
          </slot>
          <button
            style="float: right"
            type="button"
            class="btn-green"
            aria-label="Close modalSettings"
            @click="close()"
            @mousedown.stop=""
          >
            X
          </button>
        </header>
        <section
          class="modalSettings-body"
          id="modalSettingsDescription"
        >
          <p>
            {{ language.language_data[getCurrentLanguage] }}
            <select
              v-model="state.curLanguage"
              id="languages"
              @click="changeLanguage"
            >
              <option
                v-for="locale in props.locales"
                :key="locale.id"
                :value="locale.id"
              >
                {{ locale.name }}
              </option>
            </select>
          </p>
          <p>
            <input
              type="checkbox"
              id="defValue"
              @change="predefinedValues"
              v-model="state.withPredVal"
            />
            {{ language.predVal_data[getCurrentLanguage] }} (R=1000Ω; I=1A;
            U=10V)
          </p>
        </section>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, computed, defineProps, defineEmits } from 'vue';

import EventBus from './jsFolder/event-bus.js';

const props = defineProps({
  currentLanguage: String,
  locales: Array,
  withPredefinedValue: Boolean
});

const emit = defineEmits(['close']);

const state = reactive({
  onDraggable: false,
  shiftX: undefined,
  shiftY: undefined,
  curLanguage: props.currentLanguage,
  withPredVal: props.withPredefinedValue
});
const language = reactive({
  setting_data: { en: 'Settings', de: 'Einstellungen' },
  language_data: { en: 'Language selection', de: 'Sprachauswahl' },
  predVal_data: { en: 'Predefined values', de: 'Vordefinierte Werte' }
});

const getCurrentLanguage = computed(() => {
  return state.curLanguage;
});

function moveStart(e) {
  state.onDraggable = true;
  state.shiftX = e.offsetX; //where I click inside Component
  state.shiftY = e.offsetY;
}
function moveMotion(e) {
  if (state.onDraggable) {
    const modalDiv = document.getElementById('modalSettingsId');
    const valueLeft = e.clientX - state.shiftX;
    const valueTop = e.clientY - state.shiftY;
    modalDiv.style.left = valueLeft + 'px';
    modalDiv.style.top = valueTop + 'px';
  }
}
function moveEnd(e) {
  moveMotion(e);
  state.onDraggable = false;
}

function changeLanguage() {
  EventBus.emit('PUSchangeLanguage', getCurrentLanguage.value);
}
function predefinedValues() {
  EventBus.emit('PUSpredVal', state.withPredVal);
}

function close() {
  emit('close');
}
</script>

<style>
@import './cssFolder/popUp.css';

.modalSettings {
  position: fixed;
  top: 0;
  left: 0;
  background: #ffffff;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  resize: both;
  display: flex;
  flex-direction: column;
  height: 210px;
  width: 382px;
}

.modalSettings-header {
  padding: 15px;
  display: flex;
}

.modalSettings-header {
  border-bottom: 1px solid #eeeeee;
  color: #4aae9b;
  justify-content: space-between;
  cursor: default;
}

.modalSettings-body {
  position: relative;
  padding: 10px 10px;
  flex-grow: 1;
}
</style>
