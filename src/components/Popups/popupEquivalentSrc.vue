<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->

<template>
  <transition name="modal-fade">
    <div
      class="modal-backdrop"
      @click="close()"
    >
      <div
        class="modalEquSrc"
        id="modalEquSrcId"
        role="dialog"
        aria-labelledby="modalEquSrcTitle"
        aria-describedby="modalEquSrcDescription"
        @mousemove="moveMotion($event)"
        @mouseup="moveEnd($event)"
        @click.stop
      >
        <header
          class="modalEquSrc-header"
          id="modalEquSrcTitle"
          @mousedown="moveStart($event)"
        >
          <slot name="header"> {{ language.equSrc[getCurrentLanguage] }} </slot>
          <button
            style="float: right"
            type="button"
            class="btn-green"
            @click="close"
            aria-label="Close modalSettings"
            @mousedown.stop
          >
            X
          </button>
        </header>
        <section
          class="modalEquSrc-body"
          id="modalEquSrcDescription"
        >
          <section name="body">
            {{ language.instruction[getCurrentLanguage] }}
          </section>

          <section id="body-select">
            <select
              v-model="state.firstKlemme"
              id="id-select-klemme"
              @click="selectKlemme1"
            >
              <option
                v-for="klemme in getKlemmeArray()"
                :key="klemme.uniqueID"
                :value="klemme"
              >
                {{ klemme.symbol }}
              </option>
            </select>
            <span class="mdi mdi-arrow-right"></span>
            <select
              v-model="state.secondKlemme"
              id="id-select-klemme"
              @click="selectKlemme2"
            >
              <option
                v-for="klemme in getKlemmeArray()"
                :key="klemme.uniqueID"
                :value="klemme"
              >
                {{ klemme.symbol }}
              </option>
            </select>
            <button
              type="button"
              id="solveBtn"
              @click="calculate()"
            >
              {{ language.solve[getCurrentLanguage] }}
            </button>
          </section>
        </section>

        <section style="flex-grow: 1">
          <p id="alertHint">
            {{ state.warning_data }}
          </p>
          <p id="resultBlock">
            <span v-html="state.result_data"></span>
          </p>
        </section>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, computed, defineProps, defineEmits } from 'vue';

import {
  isAmpermeter,
  isVoltmeter,
  isKlemme
} from '@/components/instanceofFunction.js';

import CircuitSolver from '@/components/jsFolder/constructorComponent/CircuitSolver.js';

import InconsistentMatrixError from '@/CustomError/inconsistentMatrixError.js';
import ConsistentMatrixInfiniteError from '@/CustomError/consistentMatrixInfiniteError.js';

const props = defineProps({
  circuitcomplet: Object,
  currentLanguage: String
});

const emit = defineEmits(['close']);

const state = reactive({
  onDraggable: false,
  shiftX: undefined,
  shiftY: undefined,
  warning_data: '',
  result_data: '',

  firstKlemme: undefined,
  secondKlemme: undefined,
  solveSimple: undefined,
  solveIqe: undefined,
  solveUqe: undefined
});
const language = reactive({
  equSrc: { en: 'Equivalent Sources', de: 'Ersatzquellen' },
  instruction: {
    en: 'In order to calculate the equivalent sources, please select 2 different terminals (Klemmen)',
    de: 'Um die Ersatzquellen zu berechnen, wählen Sie bitte 2 verschiedene Klemmen'
  },
  solve: { en: 'Solve', de: 'Berechnen' }
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
    const modalDiv = document.getElementById('modalEquSrcId');
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
function getKlemmeArray() {
  return props.circuitcomplet.components.filter((comp) => isKlemme(comp));
}
function selectKlemme1() {
  if (state.firstKlemme !== undefined) {
    console.log('first OK', state.firstKlemme.symbol);
    state.warning_data = '';
    assert2DifferentsKlemmen();
  }
}
function selectKlemme2() {
  if (state.secondKlemme !== undefined) {
    console.log('second OK', state.secondKlemme.symbol);
    state.warning_data = '';
    assert2DifferentsKlemmen();
  }
}
function assert2DifferentsKlemmen() {
  document.getElementById('solveBtn').disabled = true;
  if (
    state.firstKlemme === undefined ||
    state.secondKlemme === undefined ||
    state.firstKlemme.uniqueID === state.secondKlemme.uniqueID
  ) {
    return (state.warning_data =
      'Warning: the 2 selected terminals must be different');
  }
  if (
    props.circuitcomplet.components.length <= 0 ||
    props.circuitcomplet.wires.length <= 0
  ) {
    return (state.warning_data = 'Warning: you must have a circuit');
  }

  document.getElementById('solveBtn').disabled = false;
  state.warning_data = '';
}
function calculate() {
  state.solveSimple = undefined;
  state.solveIqe = undefined;
  state.solveUqe = undefined;

  let solver = new CircuitSolver(props.circuitcomplet);
  try {
    solver.solve(props.circuitcomplet);
  } catch (e) {
    console.log('Error is found on simpleSolve');
    state.solveSimple = e;
    console.log(
      'CHECK solve InconsistentMatrixError',
      state.solveSimple instanceof InconsistentMatrixError
    );
    console.log(
      'CHECK solve ConsistentMatrixInfiniteError',
      state.solveSimple instanceof ConsistentMatrixInfiniteError
    );
  }
  console.log('#############SolverI now#############');
  let solverI = new CircuitSolver(props.circuitcomplet);
  try {
    state.solveIqe = solverI.solveIqe(state.firstKlemme, state.secondKlemme);
  } catch (e) {
    state.solveIqe = e;
    console.log(
      'CHECK solveIqe InconsistentMatrixError',
      state.solveIqe instanceof InconsistentMatrixError
    );
    console.log(
      'CHECK solveIqe ConsistentMatrixInfiniteError',
      state.solveIqe instanceof ConsistentMatrixInfiniteError
    );
  }
  console.log('#############SolverU now#############');
  let solverU = new CircuitSolver(props.circuitcomplet);
  try {
    state.solveUqe = solverU.solveUqe(state.firstKlemme, state.secondKlemme);
  } catch (e) {
    state.solveUqe = e;
    console.log(
      'CHECK solveUqe InconsistentMatrixError',
      state.solveUqe instanceof InconsistentMatrixError
    );
    console.log(
      'CHECK solveUqe ConsistentMatrixInfiniteError',
      state.solveUqe instanceof ConsistentMatrixInfiniteError
    );
  }

  if (state.solveSimple instanceof ConsistentMatrixInfiniteError) {
    return (state.warning_data =
      'Warning: Consistent Matrix with Infinite Soution');
  }

  if (state.solveSimple instanceof InconsistentMatrixError) {
    if (
      state.solveIqe instanceof InconsistentMatrixError &&
      state.solveUqe instanceof InconsistentMatrixError
    ) {
      return (state.warning_data =
        'Warning: matrix inconsistent (z.B. zwei Spannungsquellen parallel mit unterschiedlichem Wert)');
    } else if (
      isAmpermeter(state.solveIqe) &&
      state.solveUqe instanceof InconsistentMatrixError
    ) {
      return (state.result_data = `ideale Stromquelle <br>
              Iqe = ${state.solveIqe.valueI} A <br>
              Uqe = unendlich <br>
              Rqe = unendlich <br>
              Pav = unendlich
            `);
    }
  }

  if (state.solveSimple instanceof Error) {
    return (state.warning_data = 'Warning: an error occured');
  }

  if (
    state.solveIqe instanceof InconsistentMatrixError &&
    isVoltmeter(state.solveUqe)
  ) {
    return (state.result_data = `ideale Spannungsquelle <br>
              Iqe = unendlich <br>
              Uqe = ${state.solveUqe.valueU} V <br>
              Rqe = 0 &#8486 <br>
              Pav = unendlich
            `);
  }

  if (isAmpermeter(state.solveIqe) && isVoltmeter(state.solveUqe)) {
    //Check if valueU !== 0 && valueI !== 0 => Schritt Gaulocher
    //WARNING valueU when null = 0.000000
    //follow example/structure CircuitSolver().solveUqe()
    let valueRqe = state.solveUqe.valueU / state.solveIqe.valueI;
    const valuePav =
      (state.solveUqe.valueU * state.solveUqe.valueU) / (4 * valueRqe);
    return (state.result_data = `
              Iqe = ${state.solveIqe.valueI} A <br>
              Uqe = ${state.solveUqe.valueU} V <br>
              Rqe = ${valueRqe} &#8486 <br>
              Pav = ${valuePav} W
            `);
  }
  return (state.warning_data = 'Warning: there is an error in your circuit');
}

function close() {
  state.firstKlemme = undefined;
  state.secondKlemme = undefined;
  state.solveSimple = undefined;
  state.solveIqe = undefined;
  state.solveUqe = undefined;
  state.result_data = '';
  state.warning_data = '';
  emit('close');
}
</script>

<style>
@import './../cssFolder/popUp.css';

.modalEquSrc {
  position: fixed;
  top: 0;
  left: 0;
  background: #ffffff;
  box-shadow: 2px 2px 20px 1px;
  overflow-x: auto;
  resize: both;
  display: flex;
  flex-direction: column;
  height: 296px;
  width: 612px;
}

.modalEquSrc-header {
  padding: 15px;
  display: flex;
}

.modalEquSrc-header {
  border-bottom: 1px solid #eeeeee;
  color: #4aae9b;
  justify-content: space-between;
  cursor: default;
}

.modalEquSrc-body {
  position: relative;
  padding: 20px 10px;
  flex-grow: 1;
}

/*my css*/
#body-select {
  margin: 15px;
}
#id-select-klemme {
  margin: 0px 10px;
}
#alertHint {
  color: red;
  margin-left: 15px;
  margin-top: 0px;
  margin-bottom: 10px;
}
#resultBlock {
  margin-left: 15px;
  margin-top: 0px;
  margin-bottom: 10px;
}
</style>
