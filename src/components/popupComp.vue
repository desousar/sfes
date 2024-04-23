<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->

<template>
  <transition
    name="modal-fade"
    v-if="compoToPass"
  >
    <div
      class="modal-backdrop"
      @click="close()"
    >
      <div
        class="popupComp"
        id="popupCompId"
        role="dialog"
        aria-labelledby="popupCompTitle"
        aria-describedby="popupCompDescription"
        @mousemove="moveMotion($event)"
        @mouseup="moveEnd($event)"
        @click.stop=""
      >
        <header
          class="popupComp-header"
          id="popupCompTitle"
          @mousedown="moveStart($event)"
        >
          <slot name="header"> {{ select_data[getCurrentLanguage] }} </slot>
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
          class="popupComp-body-gridContainer"
          id="popupCompDescription"
        >
          <slot>
            <div>Symbol =</div>
            <input
              type="text"
              id="newID"
              :value="compoToPass.symbol"
            />
            <div></div>
          </slot>

          <slot v-if="isResistor()">
            <div>R =</div>
            <input
              type="number"
              id="newValueR"
              :value="
                compoToPass.valueR === undefined
                  ? undefined
                  : compoToPass.valueR
              "
              placeholder="undefined"
            />
            <div>&#8486;</div>
          </slot>

          <slot v-if="isKnoten()">
            <div>
              Potential {{ source_data[getCurrentLanguage] }}
              =
            </div>
            <input
              type="number"
              id="newValuePotential"
              :value="
                compoToPass.valuePotentialSource === undefined
                  ? undefined
                  : compoToPass.valuePotentialSource
              "
              placeholder="undefined"
            />
            <div>V</div>
          </slot>

          <!--disabled input-->
          <slot v-if="isKnoten() || isKlemme()">
            <div>Potential =</div>
            <input
              disabled
              type="number"
              id="newValuePhiDisabled"
              :value="
                compoToPass.valuePhi === undefined
                  ? undefined
                  : compoToPass.valuePhi
              "
              placeholder="not yet available"
            />
            <div>V</div>
          </slot>

          <slot v-if="isVoltageSource()">
            <div>U =</div>
            <input
              type="number"
              id="newValueU"
              :value="
                compoToPass.valueU === undefined
                  ? undefined
                  : compoToPass.valueU
              "
              placeholder="undefined"
            />
            <div>V</div>
          </slot>

          <!--disabled input-->
          <slot
            v-if="
              isResistor() ||
              isKnotenWithPotentialSrc() ||
              isVoltageSource() ||
              isAmpermeter()
            "
          >
            <div>I =</div>
            <input
              disabled
              type="number"
              id="newValueIDisabled"
              :value="
                compoToPass.valueI === undefined
                  ? undefined
                  : compoToPass.valueI
              "
              placeholder="not yet available"
            />
            <div>A</div>
          </slot>

          <slot v-if="isCurrentSource()">
            <div>I =</div>
            <input
              type="number"
              id="newValueI"
              :value="
                compoToPass.valueI === undefined
                  ? undefined
                  : compoToPass.valueI
              "
              placeholder="undefined"
            />
            <div>A</div>
          </slot>

          <!--disabled input-->
          <slot v-if="isResistor() || isCurrentSource() || isVoltmeter()">
            <div>U =</div>
            <input
              disabled
              type="number"
              id="newValueUDisabled"
              :value="
                compoToPass.valueU === undefined
                  ? undefined
                  : compoToPass.valueU
              "
              placeholder="not yet available"
            />
            <div>V</div>
          </slot>

          <!--disabled input-->
          <slot v-if="isResistor()">
            <div>P =</div>
            <input
              disabled
              type="number"
              id="newValuePDisabled"
              :value="
                compoToPass.valueP === undefined
                  ? undefined
                  : compoToPass.valueP
              "
              placeholder="not yet available"
            />
            <div>W</div>
          </slot>
          <slot v-if="isResistor()">
            <div></div>
            <div>({{ verLeistung[getCurrentLanguage] }})</div>
          </slot>

          <!--disabled input-->
          <slot v-if="isCurrentSource() || isVoltageSource()">
            <div>P =</div>
            <input
              disabled
              type="number"
              id="newValuePDisabled"
              :value="
                compoToPass.valueP === undefined
                  ? undefined
                  : compoToPass.valueP
              "
              placeholder="not yet available"
            />
            <div>W</div>
          </slot>
          <slot v-if="isCurrentSource() || isVoltageSource()">
            <div></div>
            <div>({{ erzLeistung[getCurrentLanguage] }})</div>
          </slot>
        </section>
        <!--button as shortcut to delete value of Potential-->
        <section v-if="isKnoten()">
          <button
            class="btn-width40pct"
            @click="deletePotentialvalue()"
          >
            delete Potential value
          </button>
        </section>
        <!--possibility to "play" with current and voltage only if component isn't MultiPin-->
        <section v-if="!compoToPass.isMultiPin">
          <section class="oneLine">
            <button
              class="btn-width40pct"
              @click="flipdirU()"
            >
              flip {{ voltage_data[getCurrentLanguage] }} arrow
            </button>
            <button
              class="btn-width40pct"
              @click="flipdirI()"
            >
              flip {{ current_data[getCurrentLanguage] }} arrow
            </button>
          </section>
          <section class="checkboxArrow">
            <div>{{ checkboxArrow_data[getCurrentLanguage] }}</div>
            <div>
              <input
                type="checkbox"
                id="displayDirU"
                @click="DirUisChecked()"
                :checked="controlDirU()"
              />
              <label
                >display {{ voltage_data[getCurrentLanguage] }} arrow</label
              >
            </div>
            <div>
              <input
                type="checkbox"
                id="displayDirI"
                @click="DirIisChecked()"
                :checked="controlDirI()"
              />
              <label
                >display {{ current_data[getCurrentLanguage] }} arrow</label
              >
            </div>
          </section>
        </section>
        <!--checkbox for each components to display their symbol-->
        <section>
          <section class="checkboxArrow">
            <div>
              <input
                type="checkbox"
                id="displayDirU"
                @click="showSymbolisChecked()"
                :checked="controlshowSymbol()"
              />
              <label>display symbol</label>
            </div>
          </section>
        </section>
        <span style="flex-grow: 1"></span>
        <!--this line (span block) will be used if a value is not conform-->
        <span
          id="alertHint"
          :style="'color:' + alertHint.color"
          >{{ alertHint.message }}</span
        >
      </div>
    </div>
  </transition>
</template>

<script>
import {
  isResistor,
  isCurrentSource,
  isVoltageSource,
  isAmpermeter,
  isVoltmeter,
  isKnoten,
  isKlemme
} from './instanceofFunction.js';

export default {
  props: {
    theCompoToPass: Object,
    arrayComponents: Array,
    currentLanguage: String,
    isPopupCompVisible: Boolean
  },
  emits: ['click', 'mouseup', 'mousedown', 'mousemove', 'close'],
  data() {
    return {
      compoToPass: null,
      onDraggable: false,
      shiftX: undefined,
      shiftY: undefined,
      valueIsModified: false,
      alertHint: { color: null, message: null },

      select_data: {
        en: 'You have selected a component',
        de: 'Sie haben eine Komponente ausgewählt'
      },
      source_data: { en: 'Source', de: 'Quelle' },
      erzLeistung: { en: 'generated power', de: 'erzeugte Leistung' },
      verLeistung: { en: 'consumed power', de: 'verbrauchte Leistung' },
      current_data: { en: 'current', de: 'strom' },
      voltage_data: { en: 'voltage', de: 'spannung' },
      checkboxArrow_data: {
        en: 'Check which elements should be displayed:',
        de: 'Anhaken welche Elemente angezeigt werden sollen:'
      }
    };
  },
  watch: {
    isPopupCompVisible: function (newVal) {
      if (newVal) {
        this.compoToPass = this.theCompoToPass;
        //graphical aspect
        this.attributionTemp();
      }
    }
  },
  computed: {
    getCurrentLanguage: function () {
      return this.currentLanguage;
    }
  },
  methods: {
    attributionTemp() {
      console.log(this.compoToPass);
      if (!this.compoToPass.showIdir0 && !this.compoToPass.showIdir1) {
        this.compoToPass.directionI === 0
          ? (this.compoToPass.showIdir0Temp = true)
          : (this.compoToPass.showIdir1Temp = true);
      }
      if (!this.compoToPass.showUdir0 && !this.compoToPass.showUdir1) {
        this.compoToPass.directionU === 0
          ? (this.compoToPass.showUdir0Temp = true)
          : (this.compoToPass.showUdir1Temp = true);
      }
    },
    moveStart(e) {
      this.onDraggable = true;
      this.shiftX = e.offsetX; //where I click inside Component
      this.shiftY = e.offsetY;
    },
    moveMotion(e) {
      if (this.onDraggable) {
        const modalDiv = document.getElementById('popupCompId');
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
    isResistor() {
      return isResistor(this.compoToPass);
    },
    isCurrentSource() {
      return isCurrentSource(this.compoToPass);
    },
    isVoltageSource() {
      return isVoltageSource(this.compoToPass);
    },
    isAmpermeter() {
      return isAmpermeter(this.compoToPass);
    },
    isVoltmeter() {
      return isVoltmeter(this.compoToPass);
    },
    isKnoten() {
      return isKnoten(this.compoToPass);
    },
    isKnotenWithPotentialSrc() {
      return (
        isKnoten(this.compoToPass) &&
        this.compoToPass.valuePotentialSource !== undefined
      );
    },
    isKlemme() {
      return isKlemme(this.compoToPass);
    },

    /**
     * function for symbol
     */
    showSymbolisChecked() {
      /**
       * allows to save the data, freshly inserted in the inputBlocks,
       * in the component in order not to lose them when a checkbox or button is checked.
       */
      this.assertAttribution();
      this.compoToPass.showSymbol = !this.compoToPass.showSymbol;
    },
    controlshowSymbol() {
      return this.compoToPass.showSymbol;
    },

    /**
     * function for current
     */
    flipdirI() {
      /**
       * allows to save the data, freshly inserted in the inputBlocks,
       * in the component in order not to lose them when a checkbox or button is checked.
       */
      this.assertAttribution();

      //input field modification
      if (this.compoToPass.valueI) {
        this.compoToPass.valueI = this.compoToPass.valueI * -1;
      }

      //graphical aspect
      if (this.compoToPass.directionI === 0) {
        this.compoToPass.directionI = 1;
        if (document.getElementById('displayDirI').checked) {
          this.compoToPass.showIdir0 = false;
          this.compoToPass.showIdir1 = true;
        } else {
          this.compoToPass.showIdir0Temp = false;
          this.compoToPass.showIdir1Temp = true;
        }
      } else if (this.compoToPass.directionI === 1) {
        this.compoToPass.directionI = 0;
        if (document.getElementById('displayDirI').checked) {
          this.compoToPass.showIdir0 = true;
          this.compoToPass.showIdir1 = false;
        } else {
          this.compoToPass.showIdir0Temp = true;
          this.compoToPass.showIdir1Temp = false;
        }
      }
      this.alertHint.color = 'green';
      this.alertHint.message = `flip ${
        this.current_data[this.getCurrentLanguage]
      } direction done`;
    },
    DirIisChecked() {
      /**
       * allows to save the data, freshly inserted in the inputBlocks,
       * in the component in order not to lose them when a checkbox or button is checked.
       */
      this.assertAttribution();
      if (this.compoToPass.directionI === 0) {
        this.compoToPass.showIdir0 = !this.compoToPass.showIdir0;
      } else if (this.compoToPass.directionI === 1) {
        this.compoToPass.showIdir1 = !this.compoToPass.showIdir1;
      }
      if (this.controlDirI()) {
        this.compoToPass.showIdir0Temp = false;
        this.compoToPass.showIdir1Temp = false;
      } else {
        this.attributionTemp();
      }
    },
    controlDirI() {
      return this.compoToPass.showIdir0 || this.compoToPass.showIdir1;
    },

    /**
     * function for voltage
     */
    flipdirU() {
      /**
       * allows to save the data, freshly inserted in the inputBlocks,
       * in the component in order not to lose them when a checkbox or button is checked.
       */
      this.assertAttribution();

      //input field modification
      if (this.compoToPass.valueU) {
        this.compoToPass.valueU = this.compoToPass.valueU * -1;
      }

      //graphical aspect
      if (this.compoToPass.directionU === 0) {
        this.compoToPass.directionU = 1;
        if (document.getElementById('displayDirU').checked) {
          this.compoToPass.showUdir0 = false;
          this.compoToPass.showUdir1 = true;
        } else {
          this.compoToPass.showUdir0Temp = false;
          this.compoToPass.showUdir1Temp = true;
        }
      } else if (this.compoToPass.directionU === 1) {
        this.compoToPass.directionU = 0;
        if (document.getElementById('displayDirU').checked) {
          this.compoToPass.showUdir0 = true;
          this.compoToPass.showUdir1 = false;
        } else {
          this.compoToPass.showUdir0Temp = true;
          this.compoToPass.showUdir1Temp = false;
        }
      }
      this.alertHint.color = 'green';
      this.alertHint.message = `flip ${
        this.voltage_data[this.getCurrentLanguage]
      } direction done`;
    },
    DirUisChecked() {
      /**
       * allows to save the data, freshly inserted in the inputBlocks,
       * in the component in order not to lose them when a checkbox or button is checked.
       */
      this.assertAttribution();
      if (this.compoToPass.directionU === 0) {
        this.compoToPass.showUdir0 = !this.compoToPass.showUdir0;
      } else if (this.compoToPass.directionU === 1) {
        this.compoToPass.showUdir1 = !this.compoToPass.showUdir1;
      }
      if (this.controlDirU()) {
        this.compoToPass.showUdir0Temp = false;
        this.compoToPass.showUdir1Temp = false;
      } else {
        this.attributionTemp();
      }
    },
    controlDirU() {
      return this.compoToPass.showUdir0 || this.compoToPass.showUdir1;
    },

    /**
     * function for Potential on Knoten
     */
    deletePotentialvalue() {
      document.getElementById('newValuePotential').value = '';
    },

    assertAttribution() {
      /**
       * check for each component due to the specification
       */
      //Resistor
      if (this.isResistor()) {
        var tempValueR = document.getElementById('newValueR').value;

        if (tempValueR.length === 0) {
          tempValueR = undefined;
        } else {
          tempValueR = parseFloat(tempValueR);
          if (tempValueR < 0) {
            this.alertHint.color = 'red';
            this.alertHint.message = "Resistor can't be negative";
            return false;
          }
        }

        if (tempValueR != this.compoToPass.valueR) {
          this.valueIsModified = true;
        }

        this.alertHint.color = 'red';
        this.alertHint.message = '';
        this.compoToPass.valueR = tempValueR; //attribution valueR
      }

      //Knoten
      if (this.isKnoten()) {
        var tempValuePotential =
          document.getElementById('newValuePotential').value;
        if (tempValuePotential.length === 0) {
          tempValuePotential = undefined;
          this.compoToPass.showPotential = false;
          this.compoToPass.showGround = false;
        } else {
          tempValuePotential = parseFloat(tempValuePotential);
          if (tempValuePotential === 0) {
            this.compoToPass.showGround = true;
            this.compoToPass.showPotential = false;
          } else {
            this.compoToPass.showPotential = true;
            this.compoToPass.showGround = false;
          }
        }
        if (tempValuePotential != this.compoToPass.valuePotentialSource) {
          this.valueIsModified = true;
        }

        this.alertHint.color = 'red';
        this.alertHint.message = '';
        this.compoToPass.valuePotentialSource = tempValuePotential; //attribution valuePotentialSource
      }

      //CurrentSource
      if (this.isCurrentSource()) {
        let tempValueI = document.getElementById('newValueI').value;
        if (tempValueI.length === 0) {
          tempValueI = undefined;
        } else {
          tempValueI = parseFloat(tempValueI);
        }
        if (tempValueI != this.compoToPass.valueI) {
          this.valueIsModified = true;
        }
        this.compoToPass.valueI = tempValueI; //attribution valueI
      }

      //VoltageSource
      if (this.isVoltageSource()) {
        let tempValueU = document.getElementById('newValueU').value;
        if (tempValueU.length === 0) {
          tempValueU = undefined;
        } else {
          tempValueU = parseFloat(tempValueU);
        }
        if (tempValueU != this.compoToPass.valueU) {
          this.valueIsModified = true;
        }
        this.compoToPass.valueU = tempValueU; //attribution valueU
      }
      /**
       * check symbol before attribution
       */
      let tempValueSymbol = document
        .getElementById('newID')
        .value.replace(/\s/g, '');
      if (tempValueSymbol.length !== 0) {
        if (this.compoToPass.symbol != tempValueSymbol) {
          for (let index = 0; index < this.arrayComponents.length; index++) {
            if (this.compoToPass == this.arrayComponents[index]) {
              if (this.checkSymbolisUnique() == true) {
                this.compoToPass.symbol = tempValueSymbol;
              } else {
                this.alertHint.color = 'red';
                this.alertHint.message =
                  'symbol ' + tempValueSymbol + ' exists already ';
                document.getElementById('newID').value =
                  this.compoToPass.symbol;
                return false;
              }
            }
          }
        }
      } else {
        this.alertHint.color = 'red';
        this.alertHint.message = "symbol can't be null";
        document.getElementById('newID').value = this.compoToPass.symbol;
        return false;
      }
      return true;
    },
    /**
     * function when Pop-Up is closed for attribution
     */
    close() {
      /**
       * control if attribution of value to component is conform
       */
      if (this.assertAttribution()) {
        if (this.valueIsModified) {
          this.arrayComponents.forEach((comp) => {
            comp.resetCalculatedValues();
          });
        }
        this.valueIsModified = false;
        this.compoToPass.showIdir0Temp = false;
        this.compoToPass.showIdir1Temp = false;
        this.compoToPass.showUdir0Temp = false;
        this.compoToPass.showUdir1Temp = false;
        this.$emit('close');
      }
    },
    /**
     * function that's called in close()
     * verify that symbol is unique
     */
    checkSymbolisUnique() {
      for (let index = 0; index < this.arrayComponents.length; index++) {
        if (
          document.getElementById('newID').value.replace(/\s/g, '') ==
          this.arrayComponents[index].symbol
        ) {
          return false;
        }
      }
      return true;
    }
  }
};
</script>

<style>
@import './cssFolder/popUp.css';

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.popupComp {
  position: fixed;
  top: 0;
  left: 0;
  background: #ffffff;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  resize: both;
  display: flex;
  flex-direction: column;
  height: 430px;
  width: 710px;
}

.popupComp-header {
  padding: 15px;
  display: flex;
}

.popupComp-header {
  border-bottom: 1px solid #eeeeee;
  color: #4aae9b;
  justify-content: space-between;
  cursor: default;
}

/* (^) popup CSS -------- (v) my CSS */

.popupComp-body-gridContainer {
  position: relative;
  padding: 20px 10px;
  display: grid;
  grid-gap: 5px;
  grid-template-columns: auto 40vh auto;
}

.oneLine {
  display: flex;
  justify-content: space-around;
}

.btn-width40pct {
  width: 40%;
}

.checkboxArrow {
  margin: 10px;
}

#alertHint {
  margin-left: 15px;
}
</style>
