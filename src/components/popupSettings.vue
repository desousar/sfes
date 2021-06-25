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
        @mousemove.prevent="moveMotion($event)"
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
            @click="close"
            aria-label="Close modalSettings"
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
        <footer class="modalSettings-footer">
          <slot name="footer">
            <button
              type="button"
              class="btn-green"
              @click="close"
              aria-label="Close modalSettings"
            >
              {{ close_data[getCurrentLanguage] }}
            </button>
          </slot>
        </footer>
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
  data() {
    return {
      onDraggable: false,
      shiftX: undefined,
      shiftY: undefined,
      curLanguage: this.currentLanguage,
      withPredVal: this.withPredefinedValue,
      setting_data: { en: 'Settings', de: 'Einstellungen' },
      language_data: { en: 'Language selection', de: 'Sprachauswahl' },
      predVal_data: { en: 'Predefined values', de: 'Vordefinierte Werte' },
      close_data: { en: 'Close', de: 'Schliessen' }
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
      EventBus.$emit('PUSchangeLanguage', this.getCurrentLanguage);
    },
    predefinedValues() {
      EventBus.$emit('PUSpredVal', this.withPredVal);
    },
    close() {
      this.openYou = true;
      this.$emit('close');
    }
  }
};
</script>

<style>
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}

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

.modalSettings-header,
.modalSettings-footer {
  padding: 15px;
  display: flex;
}

.modalSettings-header {
  border-bottom: 1px solid #eeeeee;
  color: #4aae9b;
  justify-content: space-between;
  cursor: default;
}

.modalSettings-footer {
  border-top: 1px solid #eeeeee;
  justify-content: flex-end;
}

.modalSettings-body {
  position: relative;
  padding: 10px 10px;
  flex-grow: 1;
}

.btn-green {
  color: white;
  background: #4aae9b;
  border: 1px solid #4aae9b;
  border-radius: 2px;
}
</style>
