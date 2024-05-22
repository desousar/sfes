<template>
  <div class="bigBody">
    <div class="list">
      <div
        class="bBcontent_img"
        v-bind:class="{
          greenClass: props.selectedTool === state.toolState.TOOL_CREATE_WIRE
        }"
      >
        <img
          type="image/svg+xml"
          :alt="state.wireItem.name"
          :src="state.wireItem.src"
          draggable="false"
          @click="creationWire"
        />
      </div>
      <div
        v-for="(control, idx) in state.componentsItem"
        :key="'control-' + idx"
        class="bBcontent_img"
      >
        <img
          type="image/svg+xml"
          :alt="control.name"
          :src="control.src"
          draggable="true"
          @dragstart="dragStart"
          :data-type="control.name"
          @dragover.stop
        />
      </div>
    </div>

    <div
      id="targetDiv"
      ref="targetDivRef"
      @dragover.prevent
      @drop.prevent="drop($event, true)"
      @dragenter.prevent
      @mouseup.prevent="moveEnd"
      @mousemove.prevent="moveMotion($event)"
      @contextmenu="openMenu"
    >
      <template
        v-for="(component, idx) in circuit.components"
        :key="idx"
      >
        <span
          :key="'complabel-' + idx"
          v-if="component.showSymbol"
        >
          <span
            v-if="!component.isMultiPin"
            :key="'label-' + idx"
            :style="{
              left: component.x + 'px',
              top: component.y - 20 + 'px',
              position: 'absolute'
            }"
          >
            {{ component.symbol }}
          </span>
          <span
            v-if="component.name === 'Knoten' && !component.showPotential"
            :key="'label-' + idx"
            :style="{
              left: component.x + 'px',
              top: component.y + 10 + 'px',
              position: 'absolute'
            }"
          >
            {{ component.symbol }}
          </span>
          <span
            v-if="
              component.isMultiPin &&
              !(component.name === 'Knoten' && !component.showPotential)
            "
            :key="'label-' + idx"
            :style="{
              left: component.x + 'px',
              top: component.y - 20 + 'px',
              position: 'absolute'
            }"
          >
            {{ component.symbol }}
          </span>
        </span>
        <component
          :is="getComponent(component.name)"
          :alt="component.name"
          :component="component"
          :style="{
            left: component.x + 'px',
            top: component.y + 'px',
            position: 'absolute'
          }"
          @simpleClick="simpleClick(component)"
          @doubleClick="doubleClick(component)"
          @pin="(nr) => pinClicked(component, nr)"
          @pinMouseUp="(nr) => pinMoveEnd(component, nr)"
          @mousedown="moveStart($event, component)"
          @mousemove="
            showTooltip($event, component), pointerComp($event, component)
          "
          @mouseout="hideTooltip()"
        ></component>
        <div
          id="tooltip"
          display="none"
          style="position: absolute; display: none"
        ></div>
      </template>

      <!--A4 = width="20cm" height="29.7cm"-->
      <svg
        id="svgArea"
        :width="dynamicWidth()"
        :height="dynamicHeight()"
        :class="{
          limitA4Paper: inA4Format,
          gridPoint: setGridPoint,
          gridLine: setGridLine
        }"
      >
        <template
          v-for="(wire, idx) in circuit.wires"
          :key="idx"
        >
          <line
            style="stroke: black; stroke-width: 2"
            :x1="wire.from.x"
            :x2="wire.to.x"
            :y1="wire.from.y"
            :y2="wire.to.y"
          />
          <line
            style="stroke: transparent; stroke-width: 10"
            @mouseover="pointerWire($event)"
            :x1="wire.from.x"
            :x2="wire.to.x"
            :y1="wire.from.y"
            :y2="wire.to.y"
            @click="selectedWire(wire)"
            @drop.stop="dropOnWire($event, wire)"
          />
        </template>
      </svg>

      <!-- contextmenu as right click menu -->
      <ul
        id="right-click-menu"
        tabindex="-1"
        ref="right"
        v-if="state.viewMenu"
        v-on:blur="closeMenu"
        :style="{ top: state.top, left: state.left }"
      >
        <li>available conversions:</li>
        <li
          v-if="state.multipleRinSerie_data"
          @click="multipleRinSerie_function"
        >
          multiple R in Série
        </li>
        <li
          v-if="state.multipleRinParallel_data"
          @click="multipleRinParallel_function"
        >
          multiple R in Parallel
        </li>
        <li
          v-if="state.theveninToNorton_data"
          @click="theveninToNorton_function"
        >
          Thevenin to Norton
        </li>
        <li
          v-if="state.nortonToThevenin_data"
          @click="nortonToThevenin_function"
        >
          Norton to Thevenin
        </li>
        <li
          v-if="state.dreieckToStern_data"
          @click="dreieckToStern_function"
        >
          Dreieck to Stern
        </li>
        <li
          v-if="state.sternToDreieck_data"
          @click="sternToDreieck_function"
        >
          Stern to Dreieck
        </li>
        <li
          v-if="state.permutation_data"
          @click="permutation_function"
        >
          Permutation
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import {
  reactive,
  ref,
  computed,
  defineProps,
  defineEmits,
  nextTick
} from 'vue';

import { useEventBusListeners } from './BigBodyComposable/useEventBus.js';

import EventBus from '../jsFolder/event-bus';
import toolStates from '../../states.js';

import Knoten from '../elements/Knoten.vue';
import Klemme from '../elements/Klemme.vue';
import Resistor from '../elements/Resistor.vue';
import CurrentSource from '../elements/CurrentSource.vue';
import VoltageSource from '../elements/VoltageSource.vue';
import Ampermeter from '../elements/Ampermeter.vue';
import Voltmeter from '../elements/Voltmeter.vue';
/*import Inductor from "./elements/Inductor.vue";
import Capacitor from "./elements/Capacitor.vue";*/

const components = {
  Knoten,
  Klemme,
  Resistor,
  CurrentSource,
  VoltageSource,
  Ampermeter,
  Voltmeter
};

import WireJS from '../jsFolder/constructorComponent/Wire.js';
import KnotenJS from '../jsFolder/constructorComponent/jsComponents/Knoten.js';
import KlemmeJS from '../jsFolder/constructorComponent/jsComponents/Klemme.js';

import { hasMainVal } from '../Conversion/util/hasMainValue';
import { distanceBtw2Points } from '../Conversion/util/mathFunction';
import MultipleRinSerie from '../Conversion/implementations/MultipleRinSerie.js';
import MultipleRinParallel from '../Conversion/implementations/MultipleRinParallel.js';
import TheveninToNorton from '../Conversion/implementations/TheveninToNorton.js';
import NortonToThevenin from '../Conversion/implementations/NortonToThevenin.js';
import DreieckToStern from '../Conversion/implementations/DreieckToStern.js';
import SternToDreieck from '../Conversion/implementations/SternToDreieck.js';
import Permutation from '../Conversion/implementations/Permutation.js';

function srcPath(file) {
  return './image/components/' + file;
}
const wireItem = { name: 'Wire', src: srcPath('Wire.svg') };
const componentsItem = [
  { name: 'Knoten', src: srcPath('Knoten.svg') },
  { name: 'Klemme', src: srcPath('Klemme.svg') },
  { name: 'Resistor', src: srcPath('Resistor.svg') },
  /*{ name: "Inductor", src: srcPath("Inductor.svg") },
  { name: "Capacitor", src: srcPath("Capacitor.svg") },*/
  { name: 'VoltageSource', src: srcPath('VoltageSource.svg') },
  { name: 'CurrentSource', src: srcPath('CurrentSource.svg') },
  { name: 'Voltmeter', src: srcPath('Voltmeter.svg') },
  { name: 'Ampermeter', src: srcPath('Ampermeter.svg') }
];

const targetDivRef = ref(null);
const right = ref(null);

const props = defineProps({
  withPredefinedValue: Boolean,
  selectedTool: Number,
  theCircuit: Object //circuit with components and wires array
});

const emit = defineEmits(['tool-state-changed', 'set-circuit']);

const state = reactive({
  componentsItem: componentsItem,
  wireItem: wireItem,
  selectedComponent: null,
  shiftX: null,
  shiftY: null,
  onCreationWire: false,
  fromComponentPin: null,
  fromComponent: null,
  toComponentPin: null,
  toComponent: null,

  toolState: toolStates,

  viewMenu: false,
  top: '0px',
  left: '0px',

  multiRinParallel_instance: undefined,
  multipleRinSerie_instance: undefined,
  permutation_instance: undefined,
  theveninToNorton_instance: undefined,
  nortonToThevenin_instance: undefined,
  dreieckToStern_instance: undefined,
  sternToDreieck_instance: undefined,

  multipleRinSerie_data: false,
  multipleRinParallel_data: false,
  theveninToNorton_data: false,
  nortonToThevenin_data: false,
  dreieckToStern_data: false,
  sternToDreieck_data: false,
  permutation_data: false,

  compToDD: undefined
});

const circuit = computed(() => {
  return props.theCircuit;
});
const getWithPredefinedValue = computed(() => {
  return props.withPredefinedValue;
});

const { setGridPoint, setGridLine, inA4Format } = useEventBusListeners(
  circuit,
  emit
);

const getComponent = (name) => {
  return components[name] || null;
};

function pointerComp(e, c) {
  if (
    props.selectedTool === state.toolState.TOOL_ROTATE &&
    (c instanceof KnotenJS || c instanceof KlemmeJS)
  ) {
    e.target.style.cursor = 'auto';
  } else if (
    props.selectedTool === state.toolState.TOOL_SELECT &&
    c instanceof KnotenJS
  ) {
    if (c.valuePotentialSource === undefined) {
      e.target.style.cursor = 'auto';
    }
  } else {
    e.target.style.cursor = 'pointer';
  }
}
function pointerWire(e) {
  if (props.selectedTool === state.toolState.TOOL_ROTATE) {
    e.target.style.cursor = 'pointer';
  } else {
    e.target.style.cursor = 'auto';
  }
}
function showTooltip(e, comp) {
  if (props.selectedTool === state.toolState.STATE_IDLE) {
    let tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = comp.getString();
    tooltip.style.display = 'block';

    let targetDiv = targetDivRef.value;
    let tgt = targetDiv.getBoundingClientRect();
    let valueTop = e.clientY - tgt.top + targetDiv.scrollTop;
    let valueLeft = e.clientX - tgt.left + targetDiv.scrollLeft;
    //check tgt.right && tgt.bottom
    if (valueTop > tgt.bottom - 180) {
      tooltip.style.top = valueTop - 70 + 'px';
    } else {
      tooltip.style.top = valueTop + 10 + 'px';
    }
    if (valueLeft > tgt.right - 225) {
      tooltip.style.left = valueLeft - 150 + 'px';
    } else {
      tooltip.style.left = valueLeft + 10 + 'px';
    }
  }
}
function hideTooltip() {
  let tooltip = document.getElementById('tooltip');
  tooltip.style.display = 'none';
}
function dynamicWidth() {
  let targetDiv = targetDivRef.value;
  if (targetDiv) {
    if (inA4Format.value) {
      targetDiv.style.maxWidth = '21cm';
    } else {
      targetDiv.style.maxWidth = 'none';
      targetDiv.style.width = 'calc(100% - 112px)';
    }
    let width = targetDiv.scrollWidth;
    return width + 'px';
  }
}
function dynamicHeight() {
  let targetDiv = targetDivRef.value;
  if (targetDiv) {
    if (inA4Format.value) {
      targetDiv.style.maxHeight = '29.7cm';
    } else {
      targetDiv.style.maxHeight = 'none';
      targetDiv.style.height = '99.2%';
    }
    let height = targetDiv.scrollHeight - 4;
    return height + 'px';
  }
}

//TODO menu in composable file
function setMenu(top, left) {
  let targetDiv = targetDivRef.value;
  let tgt = targetDiv.getBoundingClientRect();
  let valueScrollTop = targetDiv.scrollTop; //if the srollcar is used, valueScrollTop and Left take this offset
  let valueScrollLeft = targetDiv.scrollLeft;

  let valueTop = top - tgt.top + valueScrollTop; //calculate the correct coordinate
  let valueLeft = left - tgt.left + valueScrollLeft;

  state.top = valueTop + 'px';
  state.left = valueLeft + 'px';
}

function closeMenu() {
  state.viewMenu = false;
  state.multipleRinSerie_data = false;
  state.multipleRinParallel_data = false;
  state.theveninToNorton_data = false;
  state.nortonToThevenin_data = false;
  state.dreieckToStern_data = false;
  state.sternToDreieck_data = false;
  state.permutation_data = false;
}

function openMenu(e) {
  state.viewMenu = true;
  nextTick().then(() => {
    right.value.focus();
    setMenu(e.y, e.x);
  });
  e.preventDefault();
  circuit.value.components.forEach((c) => {
    if (isClassicKnoten(c) && c.selected) {
      c.selected = false; // a classic Knoten is useless
    }
  });
  const selectedComp = circuit.value.getSelectedComponents();
  if (hasMainVal(selectedComp) && selectedComp.length > 1) {
    multipleRinSerie_openMenu();
    multipleRinParallel_openMenu();
    theveninToNorton_openMenu();
    nortonToThevenin_openMenu();
    dreieckToStern_openMenu();
    sternToDreieck_openMenu();
    permutation_openMenu();
  }
}

//TODO replace with instance from file instanceFunction
function isClassicKnoten(comp) {
  return comp instanceof KnotenJS && comp.valuePotentialSource === undefined;
}
function multipleRinSerie_openMenu() {
  state.multipleRinSerie_instance = new MultipleRinSerie(circuit.value);
  state.multipleRinSerie_data = state.multipleRinSerie_instance.isPossible();
}
function multipleRinParallel_openMenu() {
  state.multiRinParallel_instance = new MultipleRinParallel(circuit.value);
  state.multipleRinParallel_data = state.multiRinParallel_instance.isPossible();
}
function theveninToNorton_openMenu() {
  state.theveninToNorton_instance = new TheveninToNorton(circuit.value);
  state.theveninToNorton_data = state.theveninToNorton_instance.isPossible();
}
function nortonToThevenin_openMenu() {
  state.nortonToThevenin_instance = new NortonToThevenin(circuit.value);
  state.nortonToThevenin_data = state.nortonToThevenin_instance.isPossible();
}
function dreieckToStern_openMenu() {
  state.dreieckToStern_instance = new DreieckToStern(circuit.value);
  state.dreieckToStern_data = state.dreieckToStern_instance.isPossible();
}
function sternToDreieck_openMenu() {
  state.sternToDreieck_instance = new SternToDreieck(circuit.value);
  state.sternToDreieck_data = state.sternToDreieck_instance.isPossible();
}
function permutation_openMenu() {
  state.permutation_instance = new Permutation(circuit.value);
  state.permutation_data = state.permutation_instance.isPossible();
}
function multipleRinSerie_function() {
  state.multipleRinSerie_instance.conversion();
  resetAndSaveAfterConversion();
}
function multipleRinParallel_function() {
  state.multiRinParallel_instance.conversion();
  resetAndSaveAfterConversion();
}
function theveninToNorton_function() {
  state.theveninToNorton_instance.conversion();
  resetAndSaveAfterConversion();
}
function nortonToThevenin_function() {
  state.nortonToThevenin_instance.conversion();
  resetAndSaveAfterConversion();
}
function dreieckToStern_function() {
  state.dreieckToStern_instance.conversion();
  resetAndSaveAfterConversion();
}
function sternToDreieck_function() {
  state.sternToDreieck_instance.conversion();
  resetAndSaveAfterConversion();
}
function permutation_function() {
  if (confirm('Potential values will change')) {
    state.permutation_instance.conversion();
    resetAndSaveAfterConversion();
  }
}
function resetAndSaveAfterConversion() {
  circuit.value.components.map((c) => {
    c.selected = false;
    c.recalculatePins();
  });
  emit('tool-state-changed', state.toolState.STATE_IDLE);
  closeMenu();
  EventBus.emit('BBSave');
}

function doubleClick(component) {
  // clear if some text is selected by double click
  if (document.selection && document.selection.empty) {
    document.selection.empty();
  } else if (window.getSelection) {
    var sel = window.getSelection();
    sel.removeAllRanges();
  }

  if (props.selectedTool === state.toolState.STATE_IDLE) {
    EventBus.emit('BBcomp', component);
  }
}

/**
 * #region Drag&Drop
 */
function dragStart(e) {
  emit('tool-state-changed', state.toolState.STATE_IDLE);
  resetbyfalseCreationWire(false);
  resetCompFromWire();

  // src: https://stackoverflow.com/questions/7680285/how-do-you-turn-off-setdragimage
  var img = document.createElement('img');
  img.src =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; //blank img
  e.dataTransfer.setDragImage(img, 0, 0);

  state.compToDD = e.target.alt; // target.alt is the correct name of the component
}
function drop(e, saveAfterDrop) {
  const c_id = state.compToDD;
  if (c_id != '') {
    //security
    let targetDiv = targetDivRef.value; //instead of document.getElementById("targetDiv");
    let tgt = targetDiv.getBoundingClientRect();
    let valueScrollTop = targetDiv.scrollTop; //if the srollcar is used, valueScrollTop and Left take this offset
    let valueScrollLeft = targetDiv.scrollLeft;

    let valueTop = e.clientY - tgt.top + valueScrollTop; //calculate the correct coordinate
    let valueLeft = e.clientX - tgt.left + valueScrollLeft;

    //method from dropComponent.js
    const c = circuit.value.dropComp({
      withPresValue: getWithPredefinedValue.value,
      c_id,
      valueLeft,
      valueTop
    });

    if (saveAfterDrop === true) {
      EventBus.emit('BBSave');
    }
    return c;
  }
}
/**
 * #endregion
 */

/**
 * #region Movement
 */
function moveStart(event, component) {
  if (props.selectedTool === state.toolState.TOOL_MOVE) {
    state.selectedComponent = component;
    state.shiftX = event.offsetX; //where I click inside Component
    state.shiftY = event.offsetY;
  }
}
function moveMotion(e) {
  if (
    state.selectedComponent &&
    props.selectedTool === state.toolState.TOOL_MOVE
  ) {
    let targetDiv = targetDivRef.value;
    let tgt = targetDiv.getBoundingClientRect();
    let valueTop = null;
    let valueLeft = null;

    state.selectedComponent.recalculatePins();

    if (
      state.selectedComponent.rotation === 0 ||
      state.selectedComponent.rotation === 180 ||
      state.selectedComponent.isMultiPin === true
    ) {
      valueTop = e.clientY - tgt.top + targetDiv.scrollTop - state.shiftY;
      valueLeft = e.clientX - tgt.left + targetDiv.scrollLeft - state.shiftX;
    } else if (
      state.selectedComponent.rotation === 90 ||
      state.selectedComponent.rotation === 270
    ) {
      valueTop = e.clientY - tgt.top + targetDiv.scrollTop - 18.9; // because width === 63.31 and graphical mouse is in middle of comp
      valueLeft = e.clientX - tgt.left + targetDiv.scrollLeft - 50; // because height === 100 => be placed on horizontal center
    }

    state.selectedComponent.y = valueTop;
    state.selectedComponent.x = valueLeft;
  }
  if (
    props.selectedTool === state.toolState.TOOL_CREATE_WIRE &&
    state.onCreationWire === true
  ) {
    let targetDiv = targetDivRef.value;
    let tgt = targetDiv.getBoundingClientRect();
    const valTop = e.clientY - tgt.top + targetDiv.scrollTop;
    const valLeft = e.clientX - tgt.left + targetDiv.scrollLeft;
    const line = document.getElementById('tempLine');
    line.setAttribute('x2', valLeft);
    line.setAttribute('y2', valTop);
  }
}
function moveEnd(e) {
  if (
    state.selectedComponent &&
    props.selectedTool === state.toolState.TOOL_MOVE
  ) {
    moveMotion(e);
    state.selectedComponent = null;
    EventBus.emit('BBSave');
  }
  if (
    props.selectedTool === state.toolState.TOOL_CREATE_WIRE &&
    state.onCreationWire === true
  ) {
    //move up not on a pin
    state.onCreationWire = false;
    resetCompFromWire();
    document.getElementById('tempLine').remove();
  }
}
function pinMoveEnd(component, nr) {
  if (
    props.selectedTool === state.toolState.TOOL_CREATE_WIRE &&
    state.onCreationWire === true
  ) {
    if (state.toComponent === null && state.fromComponent !== component) {
      state.toComponentPin = nr;
      state.toComponent = component;
      drawWire();
      EventBus.emit('BBSave');
    } else if (
      state.fromComponent !== null &&
      state.toComponent === null &&
      state.fromComponentPin !== nr
    ) {
      // you are on same comp BUT not same pin
      let newValLeft;
      if (state.fromComponent.x - 50 > 0) {
        newValLeft = state.fromComponent.x - 10;
      } else {
        newValLeft = state.fromComponent.x + 80;
      }
      const newValTop = state.fromComponent.y + 50;
      const kn = circuit.value.dropComp({
        c_id: 'Knoten',
        valueLeft: newValLeft,
        valueTop: newValTop
      });
      //connect 2 pins from state.fromComponent with kn pin
      circuit.value.createOneWire(state.fromComponent, 0, kn, 0);
      circuit.value.createOneWire(state.fromComponent, 1, kn, 0);
      EventBus.emit('BBSave');
    } else {
      alert('You can choose same pin of the same component');
    }
    resetCompFromWire();
    state.onCreationWire = false;
    document.getElementById('tempLine').remove();
  }
}
/**
 * #endregion
 */

function simpleClick(component) {
  if (props.selectedTool === state.toolState.TOOL_SELECT) {
    component.selection();
    component.recalculatePins();
  } else if (props.selectedTool === state.toolState.TOOL_DELETE) {
    circuit.value.deleteOneComponent(component); //call the function delete
    EventBus.emit('BBSave');
  } else if (
    props.selectedTool === state.toolState.TOOL_ROTATE &&
    component.isMultiPin === false
  ) {
    component.rotateRight();
    EventBus.emit('BBSave');
  }
}
/**
 * #region Wire
 */
function creationWire() {
  if (props.selectedTool === state.toolState.TOOL_CREATE_WIRE) {
    resetbyfalseCreationWire(false);
  } else {
    resetbyfalseCreationWire(true);
  }
  resetCompFromWire();
}

function pinClicked(component, nr) {
  if (props.selectedTool !== state.toolState.TOOL_CREATE_WIRE) {
    return;
  }
  state.onCreationWire = true;
  state.fromComponentPin = nr;
  state.fromComponent = component;
  var newLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  newLine.style.stroke = 'black';
  newLine.style.strokeWidth = '2';
  newLine.setAttribute('id', 'tempLine');
  newLine.setAttribute('x1', component.pins[nr].x);
  newLine.setAttribute('y1', component.pins[nr].y);
  newLine.setAttribute('x2', component.pins[nr].x);
  newLine.setAttribute('y2', component.pins[nr].y);
  document.getElementById('svgArea').append(newLine);
}
function resetbyfalseCreationWire(bool) {
  if (bool === true) {
    emit('tool-state-changed', state.toolState.TOOL_CREATE_WIRE);
  } else if (bool === false) {
    emit('tool-state-changed', state.toolState.STATE_IDLE);
  }
}
function resetCompFromWire() {
  state.fromComponent =
    state.fromComponentPin =
    state.toComponent =
    state.toComponentPin =
      null;
}
function selectedWire(line) {
  if (props.selectedTool === state.toolState.TOOL_DELETE) {
    circuit.value.deleteOneWire(line);
    EventBus.emit('BBSave');
  }
}

function dropOnWire(e, wire) {
  if (confirm('Do you want to insert this component on the Wire?')) {
    const comp = drop(e, false);
    circuit.value.wires.forEach((w) => {
      if (w === wire) {
        const fromComp = circuit.value.componentFromPin(w.from);
        const fromPin = circuit.value.pinIndexFromComponent(fromComp, w.from);
        const toComp = circuit.value.componentFromPin(w.to);
        const toPin = circuit.value.pinIndexFromComponent(toComp, w.to);
        circuit.value.deleteOneWire(w);
        if (comp.isMultiPin) {
          circuit.value.createOneWire(comp, 0, fromComp, fromPin);
          circuit.value.createOneWire(comp, 0, toComp, toPin);
        } else {
          const lengthPin0 = distanceBtw2Points(
            fromComp.pins[fromPin],
            comp.pins[0]
          );
          const lengthPin1 = distanceBtw2Points(
            fromComp.pins[fromPin],
            comp.pins[1]
          );
          if (lengthPin0 <= lengthPin1) {
            circuit.value.createOneWire(comp, 0, fromComp, fromPin);
            circuit.value.createOneWire(comp, 1, toComp, toPin);
          } else {
            circuit.value.createOneWire(comp, 1, fromComp, fromPin);
            circuit.value.createOneWire(comp, 0, toComp, toPin);
          }
        }
        EventBus.emit('BBSave');
      }
    });
  } else {
    drop(e, true);
  }
}
function drawWire() {
  let wire = new WireJS({
    from: state.fromComponent.pins[state.fromComponentPin],
    to: state.toComponent.pins[state.toComponentPin]
  });
  circuit.value.wires.push(wire);
  pinOpacity0(wire);
}

//TODO à supprimer (enfin d'abord contrôler qu'on peut bien le supprimer)
function pinOpacity0(wire) {
  const showHidePin = (c, pinNB) => {
    if (c.isMultiPin === false) {
      if (pinNB === 0) {
        c.showPin1 = false;
      } else if (pinNB === 1) {
        c.showPin2 = false;
      }
    }
  };
  const fromComp = circuit.value.componentFromPin(wire.from);
  const toComp = circuit.value.componentFromPin(wire.to);
  showHidePin(
    fromComp,
    circuit.value.pinIndexFromComponent(fromComp, wire.from)
  );
  showHidePin(toComp, circuit.value.pinIndexFromComponent(toComp, wire.to));
}
/**
 * #endregion
 */
</script>

<style>
@import './../cssFolder/bigBody.css';

@page {
  size: A4;
  margin: 0;
}
@media print {
  body * {
    visibility: hidden;
  }
  #targetDiv,
  #targetDiv * {
    visibility: visible;
    border: none;
  }
  #targetDiv {
    position: absolute;
    overflow: hidden;
    left: 0;
    top: 0;
    width: 21cm;
    height: 29.7cm;
  }
}
</style>
