<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->
<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" @click="outsideClick">
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
          <slot name="header"> {{ setting_data[getCurrentLanguage] }} </slot>
          <button
            style="float:right"
            type="button"
            class="btn-green"
            aria-label="Close modalSettings"
            @click="close"
            @mousedown.stop=""
          >
            X
          </button>
        </header>
        <section class="modalSettings-body" id="modalSettingsDescription">
          <p>
            {{ language_data[getCurrentLanguage] }}
            <select
              v-model="curLanguage"
              id="languages"
              @click="changeLanguage"
            >
              <option
                v-for="locale in locales"
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
              v-model="withPredVal"
            />
            {{ predVal_data[getCurrentLanguage] }} (R=1000Ω; I=1A; U=10V)
          </p>
        </section>
      </div>
    </div>
  </transition>
</template>

<script>
import EventBus from './jsFolder/event-bus.js';

export default {
  props: {
    currentLanguage: String,
    locales: Array,
    withPredefinedValue: Boolean
  },
  emits: ['click', 'mousedown', 'mouseup', 'mousemove', 'change', 'close'],
  data() {
    return {
      onDraggable: false,
      shiftX: undefined,
      shiftY: undefined,
      curLanguage: this.currentLanguage,
      withPredVal: this.withPredefinedValue,
      setting_data: { en: 'Settings', de: 'Einstellungen' },
      language_data: { en: 'Language selection', de: 'Sprachauswahl' },
      predVal_data: { en: 'Predefined values', de: 'Vordefinierte Werte' }
    };
  },
  computed: {
    getCurrentLanguage: function() {
      return this.curLanguage;
    }
  },
  methods: {
    outsideClick() {
      this.close();
    },
    moveStart(e) {
      this.onDraggable = true;
      this.shiftX = e.offsetX; //where I click inside Component
      this.shiftY = e.offsetY;
    },
    moveMotion(e) {
      if (this.onDraggable) {
        const modalDiv = document.getElementById('modalSettingsId');
        const valueLeft = e.clientX - this.shiftX;
        const valueTop = e.clientY - this.shiftY;
        modalDiv.style.left = valueLeft + 'px';
        modalDiv.style.top = valueTop + 'px';
      }
    },
    moveEnd(e) {
      this.moveMotion(e);
      this.onDraggable = false;
    },
    changeLanguage() {
      EventBus.emit('PUSchangeLanguage', this.getCurrentLanguage);
    },
    predefinedValues() {
      EventBus.emit('PUSpredVal', this.withPredVal);
    },
    close() {
      this.$emit('close');
    }
  }
};
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
