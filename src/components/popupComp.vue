<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->

<template>
  <transition name="popupComp-fade" v-if="compoToPass">
    <div class="popupComp-backdrop">
      <div
        class="popupComp"
        role="dialog"
        aria-labelledby="popupCompTitle"
        aria-describedby="popupCompDescription"
      >
        <header class="popupComp-header" id="popupCompTitle">
          <slot name="header"> {{ select_data[getCurrentLanguage] }} </slot>
          <button
            style="float:right"
            type="button"
            class="btn-green"
            @click="close()"
            aria-label="Close modalSettings"
          >
            X
          </button>
        </header>
        <section class="popupComp-body-gridContainer" id="popupCompDescription">
          <slot>
            <div>Symbol =</div>
            <input type="text" id="newID" :value="compoToPass.symbol" />
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
            <div>
              U =
            </div>
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
            <div>
              I =
            </div>
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
            <div>
              I =
            </div>
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
            <div>
              U =
            </div>
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
        </section>
        <!--button as shortcut to delete value of Potential-->
        <section v-if="isKnoten()">
          <button class="btn-width40pct" @click="deletePotentialvalue()">
            delete Potential value
          </button>
        </section>
        <!--possibility to "play" with current and voltage only if component isn't MultiPin-->
        <section v-if="!compoToPass.isMultiPin">
          <section class="oneLine">
            <button class="btn-width40pct" @click="flipdirU()">
              flip {{ voltage_data[getCurrentLanguage] }} arrow
            </button>
            <button class="btn-width40pct" @click="flipdirI()">
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
        <!--this line (span block) will be used if a value is not conform-->
        <span id="alertHint"></span>
        <footer class="popupComp-footer">
          <slot name="footer">
            <button
              type="button"
              class="btn-green"
              @click="close()"
              aria-label="Close popupComp"
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
    compoToPass: Object,
    arrayComponents: Array,
    currentLanguage: String
  },
  data() {
    return {
      valueIsModified: false,

      select_data: {
        en: 'You have selected a component',
        de: 'Sie haben eine Komponente ausgewählt'
      },
      source_data: { en: 'Source', de: 'Quelle' },
      current_data: { en: 'current', de: 'strom' },
      voltage_data: { en: 'voltage', de: 'spannung' },
      checkboxArrow_data: {
        en: 'Check which elements should be displayed:',
        de: 'Anhaken welche Elemente angezeigt werden sollen:'
      },
      close_data: { en: 'Close', de: 'Schliessen' }
    };
  },
  computed: {
    getCurrentLanguage: function() {
      return this.currentLanguage;
    }
  },
  methods: {
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
        }
      } else if (this.compoToPass.directionI === 1) {
        this.compoToPass.directionI = 0;
        if (document.getElementById('displayDirI').checked) {
          this.compoToPass.showIdir0 = true;
          this.compoToPass.showIdir1 = false;
        }
      }
      document.getElementById('alertHint').style.color = 'green';
      document.getElementById('alertHint').innerText = `flip ${
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
        }
      } else if (this.compoToPass.directionU === 1) {
        this.compoToPass.directionU = 0;
        if (document.getElementById('displayDirU').checked) {
          this.compoToPass.showUdir0 = true;
          this.compoToPass.showUdir1 = false;
        }
      }
      document.getElementById('alertHint').style.color = 'green';
      document.getElementById('alertHint').innerText = `flip ${
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
            document.getElementById('alertHint').style.color = 'red';
            document.getElementById('alertHint').innerText =
              "Resistor can't be negative";
            return false;
          }
        }

        if (tempValueR != this.compoToPass.valueR) {
          this.valueIsModified = true;
        }

        document.getElementById('alertHint').style.color = 'red';
        document.getElementById('alertHint').innerText = '';
        this.compoToPass.valueR = tempValueR; //attribution valueR
      }

      //Knoten
      if (this.isKnoten()) {
        var tempValuePotential = document.getElementById('newValuePotential')
          .value;
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
          if (tempValuePotential < 0) {
            document.getElementById('alertHint').style.color = 'red';
            document.getElementById('alertHint').innerText =
              "Potential can't be negative";
            return false;
          }
        }
        if (tempValuePotential != this.compoToPass.valuePotentialSource) {
          this.valueIsModified = true;
        }

        document.getElementById('alertHint').style.color = 'red';
        document.getElementById('alertHint').innerText = '';
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
                document.getElementById('alertHint').style.color = 'red';
                document.getElementById('alertHint').innerText =
                  'symbol ' + tempValueSymbol + ' exists already ';
                document.getElementById(
                  'newID'
                ).value = this.compoToPass.symbol;
                return false;
              }
            }
          }
        }
      } else {
        document.getElementById('alertHint').style.color = 'red';
        document.getElementById('alertHint').innerText = "symbol can't be null";
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
          this.arrayComponents.forEach(comp => {
            comp.resetCalculatedValues();
          });
        }
        this.valueIsModified = false;
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
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.popupComp-backdrop {
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

.popupComp {
  background: #ffffff;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  display: flex;
  flex-direction: column;
}

.popupComp-header,
.popupComp-footer {
  padding: 15px;
  display: flex;
}

.popupComp-header {
  border-bottom: 1px solid #eeeeee;
  color: #4aae9b;
  justify-content: space-between;
}

.popupComp-footer {
  border-top: 1px solid #eeeeee;
  justify-content: flex-end;
}

/* (^) popup CSS -------- (v) my CSS */

.popupComp-body-gridContainer {
  position: relative;
  padding: 20px 10px;
  display: grid;
  grid-gap: 5px;
  grid-template-columns: auto 40vh auto;
}

.btn-green {
  color: white;
  background: #4aae9b;
  border: 1px solid #4aae9b;
  border-radius: 2px;
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
