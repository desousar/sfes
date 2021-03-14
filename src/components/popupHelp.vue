<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->
<template>
  <transition name="modalHelp-fade">
    <div class="modalHelp-backdrop">
      <div
        class="modalHelp"
        role="dialog"
        aria-labelledby="modalHelpTitle"
        aria-describedby="modalHelpDescription"
      >
        <header class="modalHelp-header" id="modalHelpTitle">
          <slot name="header"> {{ help_data[getCurrentLanguage] }} </slot>
        </header>
        <section class="modalHelp-body" id="modalHelpDescription">
          <h3>What is "matrix inconsistent" ?</h3>
          <p>
            This error can have several causes, among the most common are:
            <ul>
                <li>2 voltage sources in parallel with different values</li>
                <li>2 current sources in series with different values</li>
                <li>from a current point of view, there is an Unterbruch in the circuit</li>
                <li>from a voltage point of view, there is a short circuit in the circuit</li>
            </ul>
          </p>

          <h3>How to create a component ?</h3>
          <p>
            Choose a component from the component palette, click on it and while
            keeping the mouse click pressed, move the mouse to the desired
            location in the area to the right of the component palette and
            release the mouse click.
          </p>

          <h3>How to connect 2 components / create a Wire ?</h3>
          <p>
            Click on the first component in the component palette (a horizontal
            line). The background becomes green, either active, then click on
            one pin, then on another. The wire is created directly. If the wire
            component has a white background, then it is not possible to create
            a wire.
          </p>

          <h3>How to delete, rotate, move, select / activate an interaction ?</h3>
          <p>
            Interactions are symbolized by images.
            <ul>
                <li>The trash can symbolizes the deletion</li>
                <li>The round arrow symbolizes the rotation</li>
                <li>The directional arrow symbolizes the displacement</li>
                <li>The mouse with a square symbolizes the selection</li>
            </ul>
            Otherwise just move the mouse over the images, the name of the
            interaction will be visible.
          </p>

          <h3>How to disable an interaction ?</h3>
          <p>
            Just click on the mouse (image on the right of the 4 interactions).
            If you select another interaction, the previous interaction is
            disabled. When a component is created the current active interaction
            is disabled.
          </p>

          <h3>How to calculate the current and voltage of the components in my circuit ?</h3>
          <p>
            Create your circuit, then click on the "solve" button.
          </p>

          <h3>How to calculate the equivalent sources of my circuit ?</h3>
          <p>
            First of all it is necessary to have at least 2 terminals in the circuit 
            (these are the nodes that are white in their center).<br>
            If this is the case, you can click on the "Source equivalent" button. 
            A pop-up window will open.<br> You have to choose from which terminal to which 
            terminal the equivalent sources should be calculated. To get the results, 
            just click on the "solve" button.<br> The results will be displayed only in the pop-up window.
          </p>
          
        </section>
        <footer class="modalHelp-footer">
          <slot name="footer">
            <button
              type="button"
              class="btn-green"
              @click="close"
              aria-label="Close modalHelp"
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
      help_data: { en: "Help", de: "Hilfe" },
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
.modalHelp-backdrop {
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

.modalHelp {
  background: #ffffff;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  height: 90vh;
  max-width: 60vw;
}

.modalHelp-header,
.modalHelp-footer {
  padding: 15px;
  display: flex;
}

.modalHelp-header {
  border-bottom: 1px solid #eeeeee;
  color: #4aae9b;
  justify-content: space-between;
}

.modalHelp-footer {
  border-top: 1px solid #eeeeee;
  justify-content: flex-end;
}

.modalHelp-body {
  position: relative;
  padding: 0px 10px;
}

.btn-green {
  color: white;
  background: #4aae9b;
  border: 1px solid #4aae9b;
  border-radius: 2px;
}
</style>