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
          <slot name="header"> {{ equSrc[getCurrentLanguage] }} </slot>
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
            {{ instruction[getCurrentLanguage] }}
          </section>

          <section id="body-select">
            <select
              v-model="firstKlemme"
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
              v-model="secondKlemme"
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
              {{ solve[getCurrentLanguage] }}
            </button>
          </section>
        </section>

        <section style="flex-grow: 1">
          <p id="alertHint">
            {{ warning_data }}
          </p>
          <p id="resultBlock">
            <span v-html="result_data"></span>
          </p>
        </section>
      </div>
    </div>
  </transition>
</template>

<script>
import { isKlemme } from './instanceofFunction.js';
import CircuitSolver from './jsFolder/constructorComponent/CircuitSolver.js';

import InconsistentMatrixError from '../CustomError/inconsistentMatrixError.js';
import ConsistentMatrixInfiniteError from '../CustomError/consistentMatrixInfiniteError.js';
import Ampermeter from './jsFolder/constructorComponent/jsComponents/Ampermeter.js';
import Voltmeter from './jsFolder/constructorComponent/jsComponents/Voltmeter.js';

export default {
  props: {
    circuitcomplet: Object,
    currentLanguage: String
  },
  emits: ['click', 'mousedown', 'mouseup', 'mousemove', 'close'],
  data() {
    return {
      onDraggable: false,
      shiftX: undefined,
      shiftY: undefined,
      warning_data: '',
      result_data: '',

      firstKlemme: undefined,
      secondKlemme: undefined,
      solveSimple: undefined,
      solveIqe: undefined,
      solveUqe: undefined,

      equSrc: { en: 'Equivalent Sources', de: 'Ersatzquellen' },
      instruction: {
        en: 'In order to calculate the equivalent sources, please select 2 different terminals (Klemmen)',
        de: 'Um die Ersatzquellen zu berechnen, wählen Sie bitte 2 verschiedene Klemmen'
      },
      solve: { en: 'Solve', de: 'Berechnen' }
    };
  },
  computed: {
    getCurrentLanguage: function () {
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
        const modalDiv = document.getElementById('modalEquSrcId');
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
    getKlemmeArray() {
      let klemmeArray = this.circuitcomplet.components.filter((comp) =>
        isKlemme(comp)
      );
      return klemmeArray;
    },
    selectKlemme1() {
      if (this.firstKlemme !== undefined) {
        console.log('first OK', this.firstKlemme.symbol);
        this.warning_data = '';
        this.assert2DifferentsKlemmen();
      }
    },
    selectKlemme2() {
      if (this.secondKlemme !== undefined) {
        console.log('second OK', this.secondKlemme.symbol);
        this.warning_data = '';
        this.assert2DifferentsKlemmen();
      }
    },
    assert2DifferentsKlemmen() {
      document.getElementById('solveBtn').disabled = true;
      if (
        this.firstKlemme === undefined ||
        this.secondKlemme === undefined ||
        this.firstKlemme.uniqueID === this.secondKlemme.uniqueID
      ) {
        return (this.warning_data =
          'Warning: the 2 selected terminals must be different');
      }
      if (
        this.circuitcomplet.components.length <= 0 ||
        this.circuitcomplet.wires.length <= 0
      ) {
        return (this.warning_data = 'Warning: you must have a circuit');
      }

      document.getElementById('solveBtn').disabled = false;
      this.warning_data = '';
    },
    calculate() {
      this.solveSimple = undefined;
      this.solveIqe = undefined;
      this.solveUqe = undefined;

      let solver = new CircuitSolver();
      try {
        solver.solve(this.circuitcomplet);
      } catch (e) {
        console.log('Error is found on simpleSolve');
        this.solveSimple = e;
        console.log(
          'CHECK solve InconsistentMatrixError',
          this.solveSimple instanceof InconsistentMatrixError
        );
        console.log(
          'CHECK solve ConsistentMatrixInfiniteError',
          this.solveSimple instanceof ConsistentMatrixInfiniteError
        );
      }
      console.log('#############SolverI now#############');
      let solverI = new CircuitSolver();
      try {
        this.solveIqe = solverI.solveIqe(
          this.circuitcomplet,
          this.firstKlemme,
          this.secondKlemme
        );
      } catch (e) {
        this.solveIqe = e;
        console.log(
          'CHECK solveIqe InconsistentMatrixError',
          this.solveIqe instanceof InconsistentMatrixError
        );
        console.log(
          'CHECK solveIqe ConsistentMatrixInfiniteError',
          this.solveIqe instanceof ConsistentMatrixInfiniteError
        );
      }
      console.log('#############SolverU now#############');
      let solverU = new CircuitSolver();
      try {
        this.solveUqe = solverU.solveUqe(
          this.circuitcomplet,
          this.firstKlemme,
          this.secondKlemme
        );
      } catch (e) {
        this.solveUqe = e;
        console.log(
          'CHECK solveUqe InconsistentMatrixError',
          this.solveUqe instanceof InconsistentMatrixError
        );
        console.log(
          'CHECK solveUqe ConsistentMatrixInfiniteError',
          this.solveUqe instanceof ConsistentMatrixInfiniteError
        );
      }

      if (this.solveSimple instanceof ConsistentMatrixInfiniteError) {
        return (this.warning_data =
          'Warning: Consistent Matrix with Infinite Soution');
      }

      if (this.solveSimple instanceof InconsistentMatrixError) {
        if (
          this.solveIqe instanceof InconsistentMatrixError &&
          this.solveUqe instanceof InconsistentMatrixError
        ) {
          return (this.warning_data =
            'Warning: matrix inconsistent (z.B. zwei Spannungsquellen parallel mit unterschiedlichem Wert)');
        } else if (
          this.solveIqe instanceof Ampermeter &&
          this.solveUqe instanceof InconsistentMatrixError
        ) {
          return (this.result_data = `ideale Stromquelle <br>
              Iqe = ${this.solveIqe.valueI} A <br>
              Uqe = unendlich <br>
              Rqe = unendlich <br>
              Pav = unendlich
            `);
        }
      }

      if (this.solveSimple instanceof Error) {
        return (this.warning_data = 'Warning: an error occured');
      }

      if (
        this.solveIqe instanceof InconsistentMatrixError &&
        this.solveUqe instanceof Voltmeter
      ) {
        return (this.result_data = `ideale Spannungsquelle <br>
              Iqe = unendlich <br>
              Uqe = ${this.solveUqe.valueU} V <br>
              Rqe = 0 &#8486 <br>
              Pav = unendlich
            `);
      }

      if (
        this.solveIqe instanceof Ampermeter &&
        this.solveUqe instanceof Voltmeter
      ) {
        //Check if valueU !== 0 && valueI !== 0 => Schritt Gaulocher
        //WARNING valueU when null = 0.000000
        //follow example/structure CircuitSolver().solveUqe()
        let valueRqe = this.solveUqe.valueU / this.solveIqe.valueI;
        const valuePav =
          (this.solveUqe.valueU * this.solveUqe.valueU) / (4 * valueRqe);
        return (this.result_data = `
              Iqe = ${this.solveIqe.valueI} A <br>
              Uqe = ${this.solveUqe.valueU} V <br>
              Rqe = ${valueRqe} &#8486 <br>
              Pav = ${valuePav} W
            `);
      }
      return (this.warning_data = 'Warning: there is an error in your circuit');
    },

    close() {
      this.firstKlemme = undefined;
      this.secondKlemme = undefined;
      this.solveSimple = undefined;
      this.solveIqe = undefined;
      this.solveUqe = undefined;
      this.result_data = '';
      this.warning_data = '';
      this.$emit('close');
    }
  }
};
</script>

<style>
@import './cssFolder/popUp.css';

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
