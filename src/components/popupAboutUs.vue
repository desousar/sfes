<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->
<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" @click="outsideClick">
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
          <slot name="header"> {{ aboutUs[getCurrentLanguage] }} </slot>
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
        <section class="modalAbout-body" id="modalAboutDescription">
          {{ content_data1[getCurrentLanguage] }}<br />
          {{ content_data2[getCurrentLanguage] }}<br />
          {{ content_data3[getCurrentLanguage] }}<br />
          {{ content_data4[getCurrentLanguage] }}
          <a href="https://github.com/desousar/sfes"
            >https://github.com/desousar/sfes</a
          ><br />
          {{ content_data5[getCurrentLanguage] }}<br />
          {{ content_data6[getCurrentLanguage] }}
        </section>
        Version 1.0.3
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    currentLanguage: String
  },
  data() {
    return {
      onDraggable: false,
      shiftX: undefined,
      shiftY: undefined,
      aboutUs: { en: 'About us', de: 'Über uns' },
      content_data1: {
        en: 'Hello, my name is Benoît DS and this is my thesis project.',
        de: 'Hallo, mein Name ist Benoît DS und dies ist mein Thesis-Projekt.'
      },
      content_data2: {
        en: 'I started developing this web application in 2020.',
        de:
          'Ich habe im Jahr 2020 mit der Entwicklung dieser Webanwendung begonnen.'
      },
      content_data3: {
        en: 'This application is open source under the GPLv3 license.',
        de: 'Diese Webanwendung ist Open Source unter der GPLv3-Lizenz.'
      },
      content_data4: {
        en:
          'You can access its source code from the following GitHub directory: ',
        de:
          'Sie können auf den Quellcode über das folgende GitHub-Verzeichnis zugreifen: '
      },
      content_data5: {
        en:
          'This web application is an educational application mainly addressed to students.',
        de:
          'Diese Webanwendung ist eine Bildungsanwendung, die sich hauptsächlich an Studenten richtet.'
      },
      content_data6: {
        en:
          'It allows, from an electronic circuit based on direct current, to calculate any current and voltage flowing through a component but also to calculate the equivalent sources of a circuit.',
        de:
          'Es erlaubt, aus einer elektronischen Schaltung, die auf Gleichstrom basiert, jeden Strom und jede Spannung zu berechnen, die durch ein Bauteil / Komponente fließen, aber auch die Ersatzquellen einer Schaltung zu berechnen.'
      }
    };
  },
  computed: {
    getCurrentLanguage: function() {
      return this.currentLanguage;
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
        const modalDiv = document.getElementById('modalAboutId');
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
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style>
@import './cssFolder/popUp.css';

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
