<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->

<template>
  <transition
    name="modal-fade"
    v-if="state.compoToPass"
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
          <slot name="header">
            {{ language.select_data[getCurrentLanguage] }}
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
          class="popupComp-body-gridContainer"
          id="popupCompDescription"
        >
          <slot>
            <div>Symbol =</div>
            <input
              type="text"
              id="newID"
              :value="state.compoToPass.symbol"
            />
            <div></div>
          </slot>

          <slot v-if="isResistor(state.compoToPass)">
            <div>R =</div>
            <input
              type="number"
              id="newValueR"
              :value="
                state.compoToPass.valueR === undefined
                  ? undefined
                  : state.compoToPass.valueR
              "
              placeholder="undefined"
            />
            <div>&#8486;</div>
          </slot>

          <slot v-if="isKnoten(state.compoToPass)">
            <div>
              Potential {{ language.source_data[getCurrentLanguage] }}
              =
            </div>
            <input
              type="number"
              id="newValuePotential"
              :value="
                state.compoToPass.valuePotentialSource === undefined
                  ? undefined
                  : state.compoToPass.valuePotentialSource
              "
              placeholder="undefined"
            />
            <div>V</div>
          </slot>

          <!--disabled input-->
          <slot
            v-if="isKnoten(state.compoToPass) || isKlemme(state.compoToPass)"
          >
            <div>Potential =</div>
            <input
              disabled
              type="number"
              id="newValuePhiDisabled"
              :value="
                state.compoToPass.valuePhi === undefined
                  ? undefined
                  : state.compoToPass.valuePhi
              "
              placeholder="not yet available"
            />
            <div>V</div>
          </slot>

          <slot v-if="isVoltageSource(state.compoToPass)">
            <div>U =</div>
            <input
              type="number"
              id="newValueU"
              :value="
                state.compoToPass.valueU === undefined
                  ? undefined
                  : state.compoToPass.valueU
              "
              placeholder="undefined"
            />
            <div>V</div>
          </slot>

          <!--disabled input-->
          <slot
            v-if="
              isResistor(state.compoToPass) ||
              isKnotenWithPotential(state.compoToPass) ||
              isVoltageSource(state.compoToPass) ||
              isAmpermeter(state.compoToPass)
            "
          >
            <div>I =</div>
            <input
              disabled
              type="number"
              id="newValueIDisabled"
              :value="
                state.compoToPass.valueI === undefined
                  ? undefined
                  : state.compoToPass.valueI
              "
              placeholder="not yet available"
            />
            <div>A</div>
          </slot>

          <slot v-if="isCurrentSource(state.compoToPass)">
            <div>I =</div>
            <input
              type="number"
              id="newValueI"
              :value="
                state.compoToPass.valueI === undefined
                  ? undefined
                  : state.compoToPass.valueI
              "
              placeholder="undefined"
            />
            <div>A</div>
          </slot>

          <!--disabled input-->
          <slot
            v-if="
              isResistor(state.compoToPass) ||
              isCurrentSource(state.compoToPass) ||
              isVoltmeter(state.compoToPass)
            "
          >
            <div>U =</div>
            <input
              disabled
              type="number"
              id="newValueUDisabled"
              :value="
                state.compoToPass.valueU === undefined
                  ? undefined
                  : state.compoToPass.valueU
              "
              placeholder="not yet available"
            />
            <div>V</div>
          </slot>

          <!--disabled input-->
          <slot v-if="isResistor(state.compoToPass)">
            <div>P =</div>
            <input
              disabled
              type="number"
              id="newValuePDisabled"
              :value="
                state.compoToPass.valueP === undefined
                  ? undefined
                  : state.compoToPass.valueP
              "
              placeholder="not yet available"
            />
            <div>W</div>
          </slot>
          <slot v-if="isResistor(state.compoToPass)">
            <div></div>
            <div>({{ language.verLeistung[getCurrentLanguage] }})</div>
          </slot>

          <!--disabled input-->
          <slot
            v-if="
              isCurrentSource(state.compoToPass) ||
              isVoltageSource(state.compoToPass)
            "
          >
            <div>P =</div>
            <input
              disabled
              type="number"
              id="newValuePDisabled"
              :value="
                state.compoToPass.valueP === undefined
                  ? undefined
                  : state.compoToPass.valueP
              "
              placeholder="not yet available"
            />
            <div>W</div>
          </slot>
          <slot
            v-if="
              isCurrentSource(state.compoToPass) ||
              isVoltageSource(state.compoToPass)
            "
          >
            <div></div>
            <div>({{ language.erzLeistung[getCurrentLanguage] }})</div>
          </slot>
        </section>
        <!--button as shortcut to delete value of Potential-->
        <section v-if="isKnoten(state.compoToPass)">
          <button
            class="btn-width40pct"
            @click="deletePotentialvalue()"
          >
            delete Potential value
          </button>
        </section>
        <!--possibility to "play" with current and voltage only if component isn't MultiPin-->
        <section v-if="!state.compoToPass.isMultiPin">
          <section class="oneLine">
            <button
              class="btn-width40pct"
              @click="flipdirU()"
            >
              flip {{ language.voltage_data[getCurrentLanguage] }} arrow
            </button>
            <button
              class="btn-width40pct"
              @click="flipdirI()"
            >
              flip {{ language.current_data[getCurrentLanguage] }} arrow
            </button>
          </section>
          <section class="checkboxArrow">
            <div>{{ language.checkboxArrow_data[getCurrentLanguage] }}</div>
            <div>
              <input
                type="checkbox"
                id="displayDirU"
                @click="DirUisChecked()"
                :checked="controlDirU()"
              />
              <label
                >display
                {{ language.voltage_data[getCurrentLanguage] }} arrow</label
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
                >display
                {{ language.current_data[getCurrentLanguage] }} arrow</label
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
          :style="'color:' + state.alertHint.color"
          >{{ state.alertHint.message }}</span
        >
      </div>
    </div>
  </transition>
</template>

<script setup>
import {
  reactive,
  toRefs,
  computed,
  watch,
  defineProps,
  defineEmits
} from 'vue';

import {
  isResistor,
  isCurrentSource,
  isVoltageSource,
  isAmpermeter,
  isVoltmeter,
  isKnoten,
  isKnotenWithPotential,
  isKlemme
} from '@/components/instanceofFunction.js';

const props = defineProps({
  theCompoToPass: Object,
  arrayComponents: Array,
  currentLanguage: String,
  isPopupCompVisible: Boolean
});

const { isPopupCompVisible } = toRefs(props);
watch(isPopupCompVisible, (newVal) => {
  if (newVal) {
    state.compoToPass = props.theCompoToPass;
    //graphical aspect
    attributionTemp();
  }
});

const emit = defineEmits(['close']);

const state = reactive({
  compoToPass: null,
  onDraggable: false,
  shiftX: undefined,
  shiftY: undefined,
  valueIsModified: false,
  alertHint: { color: null, message: null }
});
const language = reactive({
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
});

const getCurrentLanguage = computed(() => {
  return props.currentLanguage;
});

function attributionTemp() {
  if (!state.compoToPass.showIdir0 && !state.compoToPass.showIdir1) {
    state.compoToPass.directionI === 0
      ? (state.compoToPass.showIdir0Temp = true)
      : (state.compoToPass.showIdir1Temp = true);
  }
  if (!state.compoToPass.showUdir0 && !state.compoToPass.showUdir1) {
    state.compoToPass.directionU === 0
      ? (state.compoToPass.showUdir0Temp = true)
      : (state.compoToPass.showUdir1Temp = true);
  }
}

function moveStart(e) {
  state.onDraggable = true;
  state.shiftX = e.offsetX; //where I click inside Component
  state.shiftY = e.offsetY;
}
function moveMotion(e) {
  if (state.onDraggable) {
    const modalDiv = document.getElementById('popupCompId');
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

/**
 * function for symbol
 */
function showSymbolisChecked() {
  /**
   * allows to save the data, freshly inserted in the inputBlocks,
   * in the component in order not to lose them when a checkbox or button is checked.
   */
  assertAttribution();
  state.compoToPass.showSymbol = !state.compoToPass.showSymbol;
}
function controlshowSymbol() {
  return state.compoToPass.showSymbol;
}

/**
 * function for current
 */
function flipdirI() {
  /**
   * allows to save the data, freshly inserted in the inputBlocks,
   * in the component in order not to lose them when a checkbox or button is checked.
   */
  assertAttribution();

  //input field modification
  if (state.compoToPass.valueI) {
    state.compoToPass.valueI = state.compoToPass.valueI * -1;
  }

  //graphical aspect
  if (state.compoToPass.directionI === 0) {
    state.compoToPass.directionI = 1;
    if (document.getElementById('displayDirI').checked) {
      state.compoToPass.showIdir0 = false;
      state.compoToPass.showIdir1 = true;
    } else {
      state.compoToPass.showIdir0Temp = false;
      state.compoToPass.showIdir1Temp = true;
    }
  } else if (state.compoToPass.directionI === 1) {
    state.compoToPass.directionI = 0;
    if (document.getElementById('displayDirI').checked) {
      state.compoToPass.showIdir0 = true;
      state.compoToPass.showIdir1 = false;
    } else {
      state.compoToPass.showIdir0Temp = true;
      state.compoToPass.showIdir1Temp = false;
    }
  }
  state.alertHint.color = 'green';
  state.alertHint.message = `flip ${
    language.current_data[getCurrentLanguage.value]
  } direction done`;
}
function DirIisChecked() {
  /**
   * allows to save the data, freshly inserted in the inputBlocks,
   * in the component in order not to lose them when a checkbox or button is checked.
   */
  assertAttribution();
  if (state.compoToPass.directionI === 0) {
    state.compoToPass.showIdir0 = !state.compoToPass.showIdir0;
  } else if (state.compoToPass.directionI === 1) {
    state.compoToPass.showIdir1 = !state.compoToPass.showIdir1;
  }
  if (controlDirI()) {
    state.compoToPass.showIdir0Temp = false;
    state.compoToPass.showIdir1Temp = false;
  } else {
    attributionTemp();
  }
}
function controlDirI() {
  return state.compoToPass.showIdir0 || state.compoToPass.showIdir1;
}

/**
 * function for voltage
 */
function flipdirU() {
  /**
   * allows to save the data, freshly inserted in the inputBlocks,
   * in the component in order not to lose them when a checkbox or button is checked.
   */
  assertAttribution();

  //input field modification
  if (state.compoToPass.valueU) {
    state.compoToPass.valueU = state.compoToPass.valueU * -1;
  }

  //graphical aspect
  if (state.compoToPass.directionU === 0) {
    state.compoToPass.directionU = 1;
    if (document.getElementById('displayDirU').checked) {
      state.compoToPass.showUdir0 = false;
      state.compoToPass.showUdir1 = true;
    } else {
      state.compoToPass.showUdir0Temp = false;
      state.compoToPass.showUdir1Temp = true;
    }
  } else if (state.compoToPass.directionU === 1) {
    state.compoToPass.directionU = 0;
    if (document.getElementById('displayDirU').checked) {
      state.compoToPass.showUdir0 = true;
      state.compoToPass.showUdir1 = false;
    } else {
      state.compoToPass.showUdir0Temp = true;
      state.compoToPass.showUdir1Temp = false;
    }
  }
  state.alertHint.color = 'green';
  state.alertHint.message = `flip ${
    language.voltage_data[getCurrentLanguage.value]
  } direction done`;
}
function DirUisChecked() {
  /**
   * allows to save the data, freshly inserted in the inputBlocks,
   * in the component in order not to lose them when a checkbox or button is checked.
   */
  assertAttribution();
  if (state.compoToPass.directionU === 0) {
    state.compoToPass.showUdir0 = !state.compoToPass.showUdir0;
  } else if (state.compoToPass.directionU === 1) {
    state.compoToPass.showUdir1 = !state.compoToPass.showUdir1;
  }
  if (controlDirU()) {
    state.compoToPass.showUdir0Temp = false;
    state.compoToPass.showUdir1Temp = false;
  } else {
    attributionTemp();
  }
}
function controlDirU() {
  return state.compoToPass.showUdir0 || state.compoToPass.showUdir1;
}

/**
 * function for Potential on Knoten
 */
function deletePotentialvalue() {
  document.getElementById('newValuePotential').value = '';
}

function assertAttribution() {
  /**
   * check for each component due to the specification
   */
  //Resistor
  if (isResistor(state.compoToPass)) {
    var tempValueR = document.getElementById('newValueR').value;

    if (tempValueR.length === 0) {
      tempValueR = undefined;
    } else {
      tempValueR = parseFloat(tempValueR);
      if (tempValueR < 0) {
        state.alertHint.color = 'red';
        state.alertHint.message = "Resistor can't be negative";
        return false;
      }
    }

    if (tempValueR != state.compoToPass.valueR) {
      state.valueIsModified = true;
    }

    state.alertHint.color = 'red';
    state.alertHint.message = '';
    state.compoToPass.valueR = tempValueR; //attribution valueR
  }

  //Knoten
  if (isKnoten(state.compoToPass)) {
    var tempValuePotential = document.getElementById('newValuePotential').value;
    if (tempValuePotential.length === 0) {
      tempValuePotential = undefined;
      state.compoToPass.showPotential = false;
      state.compoToPass.showGround = false;
    } else {
      tempValuePotential = parseFloat(tempValuePotential);
      if (tempValuePotential === 0) {
        state.compoToPass.showGround = true;
        state.compoToPass.showPotential = false;
      } else {
        state.compoToPass.showPotential = true;
        state.compoToPass.showGround = false;
      }
    }
    if (tempValuePotential != state.compoToPass.valuePotentialSource) {
      state.valueIsModified = true;
    }

    state.alertHint.color = 'red';
    state.alertHint.message = '';
    state.compoToPass.valuePotentialSource = tempValuePotential; //attribution valuePotentialSource
  }

  //CurrentSource
  if (isCurrentSource(state.compoToPass)) {
    let tempValueI = document.getElementById('newValueI').value;
    if (tempValueI.length === 0) {
      tempValueI = undefined;
    } else {
      tempValueI = parseFloat(tempValueI);
    }
    if (tempValueI != state.compoToPass.valueI) {
      state.valueIsModified = true;
    }
    state.compoToPass.valueI = tempValueI; //attribution valueI
  }

  //VoltageSource
  if (isVoltageSource(state.compoToPass)) {
    let tempValueU = document.getElementById('newValueU').value;
    if (tempValueU.length === 0) {
      tempValueU = undefined;
    } else {
      tempValueU = parseFloat(tempValueU);
    }
    if (tempValueU != state.compoToPass.valueU) {
      state.valueIsModified = true;
    }
    state.compoToPass.valueU = tempValueU; //attribution valueU
  }
  /**
   * check symbol before attribution
   */
  let tempValueSymbol = document
    .getElementById('newID')
    .value.replace(/\s/g, '');
  if (tempValueSymbol.length !== 0) {
    if (state.compoToPass.symbol != tempValueSymbol) {
      for (let index = 0; index < props.arrayComponents.length; index++) {
        if (state.compoToPass == props.arrayComponents[index]) {
          if (checkSymbolisUnique() == true) {
            state.compoToPass.symbol = tempValueSymbol;
          } else {
            state.alertHint.color = 'red';
            state.alertHint.message =
              'symbol ' + tempValueSymbol + ' exists already ';
            document.getElementById('newID').value = state.compoToPass.symbol;
            return false;
          }
        }
      }
    }
  } else {
    state.alertHint.color = 'red';
    state.alertHint.message = "symbol can't be null";
    document.getElementById('newID').value = state.compoToPass.symbol;
    return false;
  }
  return true;
}
/**
 * function when Pop-Up is closed for attribution
 */
function close() {
  /**
   * control if attribution of value to component is conform
   */
  if (assertAttribution()) {
    if (state.valueIsModified) {
      props.arrayComponents.forEach((comp) => {
        comp.resetCalculatedValues();
      });
    }
    state.valueIsModified = false;
    state.compoToPass.showIdir0Temp = false;
    state.compoToPass.showIdir1Temp = false;
    state.compoToPass.showUdir0Temp = false;
    state.compoToPass.showUdir1Temp = false;
    emit('close');
  }
}
/**
 * function that's called in close()
 * verify that symbol is unique
 */
function checkSymbolisUnique() {
  for (let index = 0; index < props.arrayComponents.length; index++) {
    if (
      document.getElementById('newID').value.replace(/\s/g, '') ==
      props.arrayComponents[index].symbol
    ) {
      return false;
    }
  }
  return true;
}
</script>

<style>
@import './../cssFolder/popUp.css';

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
