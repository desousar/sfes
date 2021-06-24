<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->
<template>
  <transition name="modal-fade">
    <div
      class="modalRes"
      id="modalResId"
      role="dialog"
      aria-labelledby="modalResTitle"
      aria-describedby="modalResDescription"
      @mousemove.prevent="moveMotion($event)"
      @mouseup="moveEnd($event)"
    >
      <header
        class="modalRes-header"
        id="modalResTitle"
        @mousedown="moveStart($event)"
      >
        <slot name="header">
          Result <br />
          {{ success_data[getCurrentLanguage] }}
          <button @click="exportResult()">export result</button>
          <button
            style="float:right"
            type="button"
            class="btn-green"
            @click="close()"
            aria-label="Close modalSettings"
            @mousedown.stop=""
          >
            X
          </button>
        </slot>
      </header>
      <section class="modalRes-body" id="modalResDescription">
        <slot name="body">
          <div id="dvTable"></div>
          <!-- <table>
              <tr v-for=""></tr>
            </table> -->
        </slot>
      </section>
      <footer class="modalRes-footer">
        <slot name="footer">
          <button
            type="button"
            class="btn-green"
            @click="close()"
            aria-label="Close modalRes"
          >
            {{ close_data[getCurrentLanguage] }}
          </button>
        </slot>
      </footer>
    </div>
  </transition>
</template>

<script>
import '@mdi/font/css/materialdesignicons.css';

export default {
  props: {
    arrayComponents: Array,
    currentLanguage: String,
    isPopupResultVisible: Boolean
  },
  data() {
    return {
      onDraggable: false,
      shiftX: undefined,
      shiftY: undefined,
      isResultVisible: false,

      success_data: {
        en: 'calculation was successful',
        de: 'die Berechnung war erfolgreich'
      },
      close_data: { en: 'Close', de: 'Schliessen' }
    };
  },
  watch: {
    isPopupResultVisible: function(newVal) {
      if (newVal) {
        this.printResult();
      }
    }
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
        const modalDiv = document.getElementById('modalResId');
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
    exportResult() {
      console.log('export');
      let data = '';
      this.arrayComponents.forEach(comp => {
        /*each component has its own function to display a row in the table*/
        data += comp.getExportString();
        data += '\n';
      });
      // Convert the text to BLOB.
      const textToBLOB = new Blob([data], {
        type: 'text/plain;charset=utf-8'
      });
      const sFileName = 'SfeS-result.txt'; // The file to save the data.
      let newLink = document.createElement('a');
      newLink.download = sFileName;

      if (window.webkitURL != null) {
        newLink.href = window.webkitURL.createObjectURL(textToBLOB);
      } else {
        newLink.href = window.URL.createObjectURL(textToBLOB);
      }
      newLink.style.display = 'none';
      document.body.appendChild(newLink);
      newLink.click();
      document.body.removeChild(newLink);
    },
    printResult() {
      var table = document.createElement('table');
      table.className = 'table';

      this.arrayComponents.forEach(comp => {
        if (!comp.isMultiPin) {
          /*each component has its own function to display a row in the table*/
          comp.getPopupResultRow(table);
        }
      });
      document.getElementById('dvTable').appendChild(table);
    },

    close() {
      document.getElementById('dvTable').innerHTML = '';
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

.modalRes {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  box-shadow: 2px 2px 20px 1px;
  height: 90vh;
  min-width: 40vw;
  max-width: 40vw;
  overflow-x: auto;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modalRes-header,
.modalRes-footer {
  padding: 15px;
  display: flex;
}

.modalRes-header {
  border-bottom: 1px solid #eeeeee;
  color: #4aae9b;
  justify-content: space-between;
}

.modalRes-footer {
  border-top: 1px solid #eeeeee;
  justify-content: flex-end;
}

.modalRes-body {
  position: relative;
  padding: 20px 10px;
}

.btn-green {
  color: white;
  background: #4aae9b;
  border: 1px solid #4aae9b;
  border-radius: 2px;
}

/*-----------------*/
/*TABLE*/
table {
  overflow: auto;
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td,
th {
  border: 1px solid black;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>
