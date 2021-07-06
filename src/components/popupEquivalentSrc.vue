<!-- src : https://www.digitalocean.com/community/tutorials/vuejs-vue-modal-component -->

<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" @click="outsideClick">
      <div
        class="modalEquSrc"
        id="modalEquSrcId"
        role="dialog"
        aria-labelledby="modalEquSrcTitle"
        aria-describedby="modalEquSrcDescription"
        @mousemove="moveMotion($event)"
        @mouseup="moveEnd($event)"
        @click.stop=""
      >
        <header
          class="modalEquSrc-header"
          id="modalEquSrcTitle"
          @mousedown="moveStart($event)"
        >
          <slot name="header"> {{ equSrc[getCurrentLanguage] }} </slot>
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
        <section class="modalEquSrc-body" id="modalEquSrcDescription">
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
            <button type="button" @click="calcule()">
              {{ solve[getCurrentLanguage] }}
            </button>
          </section>
        </section>

        <section>
          <p v-if="warningBool_data" id="alertHint">{{ warning_data }}</p>
          <p v-if="resultBool_data" id="resultBlock">
            <span v-html="result_data"></span>
          </p>
        </section>
        <footer class="modalEquSrc-footer">
          <slot name="footer">
            <button
              type="button"
              class="btn-green"
              @click="close"
              aria-label="Close modalEquSrc"
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
  data() {
    return {
      onDraggable: false,
      shiftX: undefined,
      shiftY: undefined,
      warning_data: '',
      warningBool_data: false,
      result_data: '',
      resultBool_data: false,

      firstKlemme: undefined,
      secondKlemme: undefined,
      solveSimple: undefined,
      solveIqe: undefined,
      solveUqe: undefined,

      equSrc: { en: 'Equivalent Sources', de: 'Ersatzquellen' },
      instruction: {
        en:
          'In order to calculate the equivalent sources, please select 2 different terminals (Klemmen)',
        de:
          'Um die Ersatzquellen zu berechnen, wählen Sie bitte 2 verschiedene Klemmen'
      },
      solve: { en: 'Solve', de: 'Berechnen' },
      close_data: { en: 'Close', de: 'Schliessen' }
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
      let klemmeArray = this.circuitcomplet.components.filter(comp =>
        isKlemme(comp)
      );
      return klemmeArray;
    },
    selectKlemme1() {
      if (this.firstKlemme !== undefined) {
        console.log('first OK', this.firstKlemme.symbol);
        this.assert2DifferentsKlemmen();
      }
    },
    selectKlemme2() {
      if (this.secondKlemme !== undefined) {
        console.log('second OK', this.secondKlemme.symbol);
        this.assert2DifferentsKlemmen();
      }
    },
    assert2DifferentsKlemmen() {
      this.resultBool_data = false;
      if (this.firstKlemme !== undefined && this.secondKlemme !== undefined) {
        if (this.firstKlemme.uniqueID === this.secondKlemme.uniqueID) {
          this.warningBool_data = true;
          this.warning_data =
            'Warning: the 2 selected terminals must be different';
        } else {
          this.warningBool_data = false;
        }
      }
    },
    calcule() {
      if (this.firstKlemme === undefined || this.secondKlemme === undefined) {
        this.warningBool_data = true;
        this.warning_data =
          'Warning: the 2 selected terminals must be selected and be different';
        return;
      }
      if (this.firstKlemme !== this.secondKlemme) {
        this.solveSimple = undefined;
        this.solveIqe = undefined;
        this.solveUqe = undefined;
        if (
          this.circuitcomplet.components.length > 0 &&
          this.circuitcomplet.wires.length > 0
        ) {
          let solver = new CircuitSolver();
          try {
            solver.solve(this.circuitcomplet);
          } catch (e) {
            console.log('Error is found on simpleSolv');
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
            this.resultBool_data = false;
            this.warningBool_data = true;
            this.warning_data =
              'Warning: Consistent Matrix with Infinite Soution';
          } else if (this.solveSimple instanceof InconsistentMatrixError) {
            if (
              this.solveIqe instanceof InconsistentMatrixError &&
              this.solveUqe instanceof InconsistentMatrixError
            ) {
              this.resultBool_data = false;
              this.warningBool_data = true;
              this.warning_data =
                'Warning: matrix inconsistent (z.B. zwei Spannungsquellen parallel mit unterschiedlichem Wert)';
            } else if (
              this.solveIqe instanceof Ampermeter &&
              this.solveUqe instanceof InconsistentMatrixError
            ) {
              this.resultBool_data = true;
              this.result_data = `ideale Stromquelle <br>
              Iqe = ${this.solveIqe.valueI} A <br>
              Uqe = unendlich <br>
              Rqe = unendlich
            `;
            }
          } else if (this.solveSimple === undefined) {
            if (
              this.solveIqe instanceof InconsistentMatrixError &&
              this.solveUqe instanceof Voltmeter
            ) {
              this.resultBool_data = true;
              this.result_data = `ideale Spannungsquelle <br>
              Iqe = unendlich <br>
              Uqe = ${this.solveUqe.valueU} V <br>
              Rqe = 0 &#8486
            `;
            } else if (
              this.solveIqe instanceof Ampermeter &&
              this.solveUqe instanceof Voltmeter
            ) {
              let valueRqe = this.solveUqe.valueU / this.solveIqe.valueI;
              this.resultBool_data = true;
              this.result_data = `
              Iqe = ${this.solveIqe.valueI} A <br>
              Uqe = ${this.solveUqe.valueU} V <br>
              Rqe = ${valueRqe} &#8486
            `;
            } else {
              this.resultBool_data = false;
              this.warningBool_data = true;
              this.warning_data = 'Warning: there is an error in your circuit';
            }
          }
        }
      }
    },
    /**
     * function when Pop-Up is closed for attribution
     */
    close() {
      this.firstKlemme = undefined;
      this.secondKlemme = undefined;
      this.solveSimple = undefined;
      this.solveIqe = undefined;
      this.solveUqe = undefined;
      this.warningBool_data = false;
      this.resultBool_data = false;
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

.modalEquSrc-header,
.modalEquSrc-footer {
  padding: 15px;
  display: flex;
}

.modalEquSrc-header {
  border-bottom: 1px solid #eeeeee;
  color: #4aae9b;
  justify-content: space-between;
  cursor: default;
}

.modalEquSrc-footer {
  border-top: 1px solid #eeeeee;
  justify-content: flex-end;
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
