<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->
<template>
  <transition name="modal-fade">
    <div
      class="modal-backdrop"
      @click="close()"
    >
      <div
        class="modalAbout"
        id="modalAboutId"
        role="dialog"
        aria-labelledby="modalAboutTitle"
        aria-describedby="modalAboutDescription"
        @mousemove="moveMotion($event)"
        @mouseup="moveEnd($event)"
        @click.stop=""
      >
        <header
          class="modalAbout-header"
          id="modalAboutTitle"
          @mousedown="moveStart($event)"
        >
          <slot name="header">
            {{ language.aboutUs[getCurrentLanguage] }}
          </slot>
          <button
            style="float: right"
            type="button"
            class="btn-green"
            @click="close()"
            aria-label="Close modalSettings"
            @mousedown.stop=""
          >
            X
          </button>
        </header>
        <section
          class="modalAbout-body"
          id="modalAboutDescription"
        >
          {{ language.content_data1[getCurrentLanguage] }}<br />
          {{ language.content_data2[getCurrentLanguage] }}<br />
          {{ language.content_data3[getCurrentLanguage] }}<br />
          {{ language.content_data4[getCurrentLanguage] }}
          <a href="https://github.com/desousar/sfes"
            >https://github.com/desousar/sfes</a
          ><br />
          {{ language.content_data5[getCurrentLanguage] }}<br />
          {{ language.content_data6[getCurrentLanguage] }}
        </section>
        Version {{ state.appVersion }}
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, computed, defineProps, defineEmits } from 'vue';

import { version } from '@/../package.json';

const props = defineProps({
  currentLanguage: String
});

const emit = defineEmits(['close']);

const state = reactive({
  appVersion: version,
  onDraggable: false,
  shiftX: undefined,
  shiftY: undefined
});

const language = reactive({
  aboutUs: { en: 'About us', de: 'Über uns' },
  content_data1: {
    en: 'Hello, my name is Benoît DS and this is my thesis project.',
    de: 'Hallo, mein Name ist Benoît DS und dies ist mein Thesis-Projekt.'
  },
  content_data2: {
    en: 'I started developing this web application in 2020.',
    de: 'Ich habe im Jahr 2020 mit der Entwicklung dieser Webanwendung begonnen.'
  },
  content_data3: {
    en: 'This application is open source under the GPLv3 license.',
    de: 'Diese Webanwendung ist Open Source unter der GPLv3-Lizenz.'
  },
  content_data4: {
    en: 'You can access its source code from the following GitHub directory: ',
    de: 'Sie können auf den Quellcode über das folgende GitHub-Verzeichnis zugreifen: '
  },
  content_data5: {
    en: 'This web application is an educational application mainly addressed to students.',
    de: 'Diese Webanwendung ist eine Bildungsanwendung, die sich hauptsächlich an Studenten richtet.'
  },
  content_data6: {
    en: 'It allows, from an electronic circuit based on direct current, to calculate any current and voltage flowing through a component but also to calculate the equivalent sources of a circuit.',
    de: 'Es erlaubt, aus einer elektronischen Schaltung, die auf Gleichstrom basiert, jeden Strom und jede Spannung zu berechnen, die durch ein Bauteil / Komponente fließen, aber auch die Ersatzquellen einer Schaltung zu berechnen.'
  }
});

const getCurrentLanguage = computed(() => {
  return props.currentLanguage;
});

function moveStart(e) {
  state.onDraggable = true;
  state.shiftX = e.offsetX; //where I click inside Component
  state.shiftY = e.offsetY;
}
function moveMotion(e) {
  if (state.onDraggable) {
    const modalDiv = document.getElementById('modalAboutId');
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
function close() {
  emit('close');
}
</script>

<style>
@import './../cssFolder/popUp.css';

.modalAbout {
  position: fixed;
  top: 0;
  left: 0;
  background: #ffffff;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  resize: both;
  display: flex;
  flex-direction: column;
  height: 282px;
  width: 697px;
}

.modalAbout-header {
  padding: 15px;
  display: flex;
}

.modalAbout-header {
  border-bottom: 1px solid #eeeeee;
  color: #4aae9b;
  justify-content: space-between;
  cursor: default;
}

.modalAbout-body {
  position: relative;
  padding: 25px 15px;
  flex-grow: 1;
}
</style>
