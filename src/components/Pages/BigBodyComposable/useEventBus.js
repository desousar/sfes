import { reactive, onMounted, computed } from 'vue';
import EventBus from '@/components/jsFolder/event-bus';

import CircuitSolver from '@/components/jsFolder/constructorComponent/CircuitSolver.js';

import { hasMainVal } from '@/components/Conversion/util/hasMainValue';

import log from '@/consoleLog';

export function useEventBusListeners(circuit, emit) {
  const state = reactive({
    setGridPoint: false,
    setGridLine: false,
    inA4Format: false
  });

  const setGridPoint = computed(() => state.setGridPoint);
  const setGridLine = computed(() => state.setGridLine);
  const inA4Format = computed(() => state.inA4Format);

  onMounted(() => {
    EventBus.on('MBcapture', () => {
      MBcapture();
    });
    EventBus.on('MBa4Format', (newA4Bool) => {
      state.inA4Format = newA4Bool;
    });
    EventBus.on('MBsetGridPoint', (bool) => {
      state.setGridPoint = bool;
    });
    EventBus.on('MBsetGridLine', (bool) => {
      state.setGridLine = bool;
    });
    EventBus.on('MBsolve', () => {
      MBsolve();
    });
    EventBus.on('MBopenFile', () => {
      MBopenFile();
    });
    EventBus.on('MBsaveFile', () => {
      MBsaveFile();
    });

    EventBus.on('MBgetEmptyCircuit', () => {
      MBgetEmptyCircuit();
    });
  });

  /**
   * #region MenuBar function
   */
  function MBcapture() {
    let targetDiv = document.getElementById('targetDiv');
    targetDiv.scrollTo(0, 0);
    print();
  }

  function MBsolve() {
    if (
      hasMainVal(circuit.value.components) &&
      circuit.value.components.length > 0
    ) {
      let solver = new CircuitSolver(circuit.value);
      try {
        solver.solveWithAttribution();
        EventBus.emit('BBresult');
        EventBus.emit('BBSave');
      } catch (e) {
        alert('*****ERROR*****\n' + e.message);
      }
    }
  }
  function MBopenFile() {
    const file = document.getElementById('fileInput').files[0];
    const blob = new Blob([file], { type: 'application/json' });
    const fr = new FileReader();
    let obj;

    fr.onload = function () {
      obj = JSON.parse(fr.result);
      log('JSON.parse(fr.result)\n', obj);
    };
    fr.readAsText(blob);
    fr.onloadend = function () {
      log('START Load');
      circuit.value.loadNewCircuit(obj);
      log('CIRCUIT LOADED', circuit.value);
    };
    EventBus.emit('BBSave');
  }
  function MBsaveFile() {
    let data = circuit.value;
    // Convert the text to BLOB.
    const textToBLOB = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const sFileName = 'SfeS-circuit.json'; // The file to save the data.
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
  }
  function MBgetEmptyCircuit() {
    if (
      confirm(
        'The current file will be deleted when you create a new one. Are you sure ?'
      )
    ) {
      emit('set-circuit');
      EventBus.emit('BBSave');
    }
  }

  return {
    setGridPoint,
    setGridLine,
    inA4Format
  };
}
