<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->
<template>
  <transition name="modalAbout-fade">
    <div class="modalAbout-backdrop">
      <div
        class="modalAbout"
        role="dialog"
        aria-labelledby="modalAboutTitle"
        aria-describedby="modalAboutDescription"
      >
        <header class="modalAbout-header" id="modalAboutTitle">
          <slot name="header"> {{ aboutUs[getCurrentLanguage] }} </slot>
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
        <footer class="modalAbout-footer">
          <slot name="footer">
            <button
              type="button"
              class="btn-green"
              @click="close"
              aria-label="Close modalAbout"
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
export default {
  props: {
    currentLanguage: String,
  },
  data() {
    return {
      aboutUs: { en: "About us", de: "Über uns" },
      content_data1: {
        en: "Hello, my name is Benoît DS and this is my thesis project.",
        de: "Hallo, mein Name ist Benoît DS und dies ist mein Thesis-Projekt.",
      },
      content_data2: {
        en: "I started developing this web application in 2020.",
        de:
          "Ich habe im Jahr 2020 mit der Entwicklung dieser Webanwendung begonnen.",
      },
      content_data3: {
        en: "This application is open source under the GPLv3 license.",
        de: "Diese Webanwendung ist Open Source unter der GPLv3-Lizenz.",
      },
      content_data4: {
        en:
          "You can access its source code from the following GitHub directory: ",
        de:
          "Sie können auf den Quellcode über das folgende GitHub-Verzeichnis zugreifen: ",
      },
      content_data5: {
        en:
          "This web application is an educational application mainly addressed to students.",
        de:
          "Diese Webanwendung ist eine Bildungsanwendung, die sich hauptsächlich an Studenten richtet.",
      },
      content_data6: {
        en:
          "It allows, from an electronic circuit based on direct current, to calculate any current and voltage flowing through a component but also to calculate the equivalent sources of a circuit.",
        de:
          "Es erlaubt, aus einer elektronischen Schaltung, die auf Gleichstrom basiert, jeden Strom und jede Spannung zu berechnen, die durch ein Bauteil / Komponente fließen, aber auch die Ersatzquellen einer Schaltung zu berechnen.",
      },
      close_data: { en: "Close", de: "Schliessen" },
    };
  },
  computed: {
    getCurrentLanguage: function () {
      return this.currentLanguage;
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style>
.modalAbout-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modalAbout {
  background: #ffffff;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}

.modalAbout-header,
.modalAbout-footer {
  padding: 15px;
  display: flex;
}

.modalAbout-header {
  border-bottom: 1px solid #eeeeee;
  color: #4aae9b;
  justify-content: space-between;
}

.modalAbout-footer {
  border-top: 1px solid #eeeeee;
  justify-content: flex-end;
}

.modalAbout-body {
  position: relative;
  padding: 25px 15px;
}

.btn-green {
  color: white;
  background: #4aae9b;
  border: 1px solid #4aae9b;
  border-radius: 2px;
}
</style>