<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->
<template>
  <transition name="modal-fade">
    <div
      class="modalHelp"
      id="modalHelpId"
      role="dialog"
      aria-labelledby="modalHelpTitle"
      aria-describedby="modalHelpDescription"
      @mousemove.prevent="moveMotion($event)"
      @mouseup="moveEnd($event)"
    >
      <header
        class="modalHelp-header"
        id="modalHelpTitle"
        @mousedown="moveStart($event)"
      >
        <slot name="header"> {{ help_data[getCurrentLanguage] }} </slot>
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
      <hr />
      <section class="modalHelp-body" id="modalHelpDescription">
        <h3>What is "matrix inconsistent" ?</h3>
        <p>
          This error can have several causes, among the most common are:
        </p>

        <ul>
          <li>2 voltage sources in parallel with different values</li>
          <li>2 current sources in series with different values</li>
          <li>
            from a current point of view, there is an Unterbruch in the circuit
          </li>
          <li>
            from a voltage point of view, there is a short circuit in the
            circuit
          </li>
        </ul>

        <h3>How to create a component ?</h3>
        <p>
          Choose a component from the component palette, click on it and while
          keeping the mouse click pressed, move the mouse to the desired
          location in the area to the right of the component palette and release
          the mouse click.
        </p>

        <h3>How to connect 2 components / create a Wire ?</h3>
        <p>
          Click on the first component in the component palette (a horizontal
          line). The background becomes green, either active, then click on the
          first pin, then hold the mouse click and release the click over the
          other pin. The wire is created directly. If the wire component has a
          white background, then it is not possible to create a wire.
        </p>

        <h3>How to delete, rotate, move, select / activate an interaction ?</h3>
        <p>
          Interactions are symbolized by images.
        </p>

        <ul>
          <li>The trash can symbolizes the deletion</li>
          <li>The round arrow symbolizes the rotation</li>
          <li>The directional arrow symbolizes the displacement</li>
          <li>The mouse with a square symbolizes the selection</li>
        </ul>
        Otherwise just move the mouse over the images, the name of the
        interaction will be visible.

        <h3>How to disable an interaction ?</h3>
        <p>
          Just click on the mouse (image on the right of the 4 interactions). If
          you select another interaction, the previous interaction is disabled.
          When a component is created the current active interaction is
          disabled.
        </p>

        <h3>
          How to calculate the current and voltage of the components in my
          circuit ?
        </h3>
        <p>
          Create your circuit, then click on the "solve" button.
        </p>

        <h3>How to calculate the equivalent sources of my circuit ?</h3>
        <p>
          First of all it is necessary to have at least 2 terminals in the
          circuit (these are the nodes that are white in their center).<br />
          If this is the case, you can click on the "Source equivalent" button.
          A pop-up window will open.<br />
          You have to choose from which terminal to which terminal the
          equivalent sources should be calculated. To get the results, just
          click on the "solve" button.<br />
          The results will be displayed only in the pop-up window.
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
      help_data: { en: 'Help', de: 'Hilfe' },
      close_data: { en: 'Close', de: 'Schliessen' }
    };
  },
  computed: {
    getCurrentLanguage: function() {
      return this.currentLanguage;
    }
  },
  methods: {
    moveStart(e) {
      this.onDraggable = true;
      this.shiftX = e.offsetX; //where I click inside Component
      this.shiftY = e.offsetY;
    },
    moveMotion(e) {
      if (this.onDraggable) {
        const modalDiv = document.getElementById('modalHelpId');
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
.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}
.modalHelp {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
  height: 90vh;
  max-width: 60vw;
}

header {
  position: sticky;
  top: 0px;
  background-color: white;
  z-index: 5;
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
