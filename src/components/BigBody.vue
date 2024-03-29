<template>
  <div class="bigBody">
    <div class="list">
      <div
        class="bBcontent_img"
        v-bind:class="{
          greenClass: selectedTool === toolState.TOOL_CREATE_WIRE
        }"
      >
        <img
          type="image/svg+xml"
          :alt="wireItem.name"
          :src="wireItem.src"
          draggable="false"
          @click="creationWire"
        />
      </div>
      <div
        v-for="(control, idx) in componentsItem"
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
      ref="targetDiv"
      @dragover.prevent
      @drop.prevent="drop($event, true)"
      @dragenter.prevent
      @mouseup.prevent="moveEnd"
      @mousemove.prevent="moveMotion($event)"
      @contextmenu="openMenu"
    >
      <template v-for="(component, idx) in circuit.components" :key="idx">
        <span :key="'complabel-' + idx" v-if="component.showSymbol">
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
        <svg
          v-is="component.name"
          :alt="component.name"
          :component="component"
          :style="{
            left: component.x + 'px',
            top: component.y + 'px',
            position: 'absolute'
          }"
          @simpleClick="simpleClick(component)"
          @doubleClick="doubleClick(component)"
          @pin="nr => pinClicked(component, nr)"
          @pinMouseUp="nr => pinMoveEnd(component, nr)"
          @mousedown="moveStart($event, component)"
          @mousemove="
            showTooltip($event, component), pointerComp($event, component)
          "
          @mouseout="hideTooltip()"
        ></svg>
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
        <template v-for="(wire, idx) in circuit.wires" :key="idx">
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
        v-if="viewMenu"
        v-on:blur="closeMenu"
        :style="{ top: top, left: left }"
      >
        <li>available conversions:</li>
        <li v-if="multipleRinSerie_data" @click="multipleRinSerie_function">
          multiple R in Série
        </li>
        <li
          v-if="multipleRinParallel_data"
          @click="multipleRinParallel_function"
        >
          multiple R in Parallel
        </li>
        <li v-if="theveninToNorton_data" @click="theveninToNorton_function">
          Thevenin to Norton
        </li>
        <li v-if="nortonToThevenin_data" @click="nortonToThevenin_function">
          Norton to Thevenin
        </li>
        <li v-if="dreieckToStern_data" @click="dreieckToStern_function">
          Dreieck to Stern
        </li>
        <li v-if="sternToDreieck_data" @click="sternToDreieck_function">
          Stern to Dreieck
        </li>
        <li v-if="permutation_data" @click="permutation_function">
          Permutation
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import EventBus from './jsFolder/event-bus';
import toolStates from '../states.js';
import { dropComp } from './jsFolder/dropComponent.js';
import CircuitSolver from './jsFolder/constructorComponent/CircuitSolver.js';

import Knoten from './elements/Knoten.vue';
import Klemme from './elements/Klemme.vue';
import Resistor from './elements/Resistor.vue';
/*import Inductor from "./elements/Inductor.vue";
import Capacitor from "./elements/Capacitor.vue";*/
import CurrentSource from './elements/CurrentSource.vue';
import VoltageSource from './elements/VoltageSource.vue';
import Ampermeter from './elements/Ampermeter.vue';
import Voltmeter from './elements/Voltmeter.vue';

import WireJS from './jsFolder/constructorComponent/Wire.js';
import KnotenJS from './jsFolder/constructorComponent/jsComponents/Knoten.js';
import KlemmeJS from './jsFolder/constructorComponent/jsComponents/Klemme.js';

import { hasMainVal } from './Conversion/util/hasMainValue';
import { distanceBtw2Points } from './Conversion/util/mathFunction';
import MultipleRinSerie from './Conversion/implementations/MultipleRinSerie.js';
import MultipleRinParallel from './Conversion/implementations/MultipleRinParallel.js';
import TheveninToNorton from './Conversion/implementations/TheveninToNorton.js';
import NortonToThevenin from './Conversion/implementations/NortonToThevenin.js';
import DreieckToStern from './Conversion/implementations/DreieckToStern.js';
import SternToDreieck from './Conversion/implementations/SternToDreieck.js';
import Permutation from './Conversion/implementations/Permutation.js';

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

export default {
  components: {
    Knoten,
    Klemme,
    Resistor,
    /*Inductor,
    Capacitor,*/
    CurrentSource,
    VoltageSource,
    Ampermeter,
    Voltmeter
  },
  props: {
    currentLanguage: String,
    withPredefinedValue: Boolean,
    selectedTool: Number,
    theCircuit: Object, //circuit with components and wires array
    undoRedoData: Object
  },
  emits: [
    'simpleClick',
    'doubleClick',
    'dragstart',
    'dragenter',
    'dragover',
    'drop',
    'mouseover',
    'mousedown',
    'mousemove',
    'mouseup',
    'mouseout',
    'contextmenu',
    'pin',
    'pinMouseUp',
    'tool-state-changed',
    'set-circuit'
  ],
  mounted: function() {
    EventBus.on('MBcapture', () => {
      this.MBcapture();
    });
    EventBus.on('MBa4Format', newA4Bool => {
      this.inA4Format = newA4Bool;
    });
    EventBus.on('MBsetGridPoint', bool => {
      this.setGridPoint = bool;
    });
    EventBus.on('MBsetGridLine', bool => {
      this.setGridLine = bool;
    });
    EventBus.on('MBsolve', () => {
      this.MBsolve();
    });
    EventBus.on('MBopenFile', () => {
      this.MBopenFile();
    });
    EventBus.on('MBsaveFile', () => {
      this.MBsaveFile();
    });

    EventBus.on('MBgetEmptyCircuit', () => {
      this.MBgetEmptyCircuit();
    });
  },

  data() {
    return {
      setGridPoint: false,
      setGridLine: false,
      inA4Format: false,
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
      multipleRinSerie_data: false,
      multipleRinParallel_data: false,
      theveninToNorton_data: false,
      nortonToThevenin_data: false,
      dreieckToStern_data: false,
      sternToDreieck_data: false,
      permutation_data: false,

      compToDD: undefined
    };
  },
  computed: {
    circuit() {
      return this.theCircuit;
    },
    getWithPredefinedValue() {
      return this.withPredefinedValue;
    }
  },
  methods: {
    pointerComp(e, c) {
      if (
        this.selectedTool === this.toolState.TOOL_ROTATE &&
        (c instanceof KnotenJS || c instanceof KlemmeJS)
      ) {
        e.target.style.cursor = 'auto';
      } else if (
        this.selectedTool === this.toolState.TOOL_SELECT &&
        c instanceof KnotenJS
      ) {
        if (c.valuePotentialSource === undefined) {
          e.target.style.cursor = 'auto';
        }
      } else {
        e.target.style.cursor = 'pointer';
      }
    },
    pointerWire(e) {
      if (this.selectedTool === this.toolState.TOOL_ROTATE) {
        e.target.style.cursor = 'pointer';
      } else {
        e.target.style.cursor = 'auto';
      }
    },
    showTooltip: function(e, comp) {
      if (this.selectedTool === this.toolState.STATE_IDLE) {
        let tooltip = document.getElementById('tooltip');
        tooltip.innerHTML = comp.getString();
        tooltip.style.display = 'block';

        let targetDiv = this.$refs.targetDiv;
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
    },
    hideTooltip: function() {
      let tooltip = document.getElementById('tooltip');
      tooltip.style.display = 'none';
    },
    dynamicWidth: function() {
      let targetDiv = this.$refs.targetDiv;
      if (targetDiv !== undefined) {
        if (this.inA4Format) {
          targetDiv.style.maxWidth = '21cm';
        } else {
          targetDiv.style.maxWidth = 'none';
          targetDiv.style.width = 'calc(100% - 112px)';
        }
        let width = targetDiv.scrollWidth;
        return width + 'px';
      }
    },
    dynamicHeight: function() {
      let targetDiv = this.$refs.targetDiv;
      if (targetDiv !== undefined) {
        if (this.inA4Format) {
          targetDiv.style.maxHeight = '29.7cm';
        } else {
          targetDiv.style.maxHeight = 'none';
          targetDiv.style.height = '99.2%';
        }
        let height = targetDiv.scrollHeight - 4;
        return height + 'px';
      }
    },

    setMenu: function(top, left) {
      let targetDiv = this.$refs.targetDiv;
      let tgt = targetDiv.getBoundingClientRect();
      let valueScrollTop = targetDiv.scrollTop; //if the srollcar is used, valueScrollTop and Left take this offset
      let valueScrollLeft = targetDiv.scrollLeft;

      let valueTop = top - tgt.top + valueScrollTop; //calculate the correct coordinate
      let valueLeft = left - tgt.left + valueScrollLeft;

      this.top = valueTop + 'px';
      this.left = valueLeft + 'px';
    },

    closeMenu: function() {
      this.viewMenu = false;
      this.multipleRinSerie_data = false;
      this.multipleRinParallel_data = false;
      this.theveninToNorton_data = false;
      this.nortonToThevenin_data = false;
      this.dreieckToStern_data = false;
      this.sternToDreieck_data = false;
      this.permutation_data = false;
    },

    openMenu: function(e) {
      this.viewMenu = true;
      this.$nextTick(
        function() {
          this.$refs.right.focus();
          this.setMenu(e.y, e.x);
        }.bind(this)
      );
      e.preventDefault();
      this.circuit.components.forEach(c => {
        if (this.isClassicKnoten(c) && c.selected) {
          c.selected = false; // a classic Knoten is useless
        }
      });
      const selectedComp = this.circuit.getSelectedComponents();
      if (hasMainVal(selectedComp) && selectedComp.length > 1) {
        this.multipleRinSerie_openMenu(selectedComp);
        this.multipleRinParallel_openMenu(selectedComp);
        this.theveninToNorton_openMenu(selectedComp);
        this.nortonToThevenin_openMenu(selectedComp);
        this.dreieckToStern_openMenu(selectedComp);
        this.sternToDreieck_openMenu(selectedComp);
        this.permutation_openMenu(selectedComp);
      }
    },
    isClassicKnoten(comp) {
      return (
        comp instanceof KnotenJS && comp.valuePotentialSource === undefined
      );
    },
    multipleRinSerie_openMenu: function(selectedComp) {
      let multiRinSerie = new MultipleRinSerie();
      this.multipleRinSerie_data = multiRinSerie.isPossible(
        false,
        selectedComp,
        this.circuit
      );
    },
    multipleRinParallel_openMenu: function(selectedComp) {
      let multiRinParallel = new MultipleRinParallel();
      this.multipleRinParallel_data = multiRinParallel.isPossible(
        selectedComp,
        this.circuit
      );
    },
    theveninToNorton_openMenu(selectedComp) {
      let theveninToNorton = new TheveninToNorton();
      this.theveninToNorton_data = theveninToNorton.isPossible(
        false,
        selectedComp,
        this.circuit
      );
    },
    nortonToThevenin_openMenu(selectedComp) {
      let nortonToThevenin = new NortonToThevenin();
      this.nortonToThevenin_data = nortonToThevenin.isPossible(
        false,
        selectedComp,
        this.circuit
      );
    },
    dreieckToStern_openMenu(selectedComp) {
      let dreieckToStern = new DreieckToStern();
      this.dreieckToStern_data = dreieckToStern.isPossible(
        selectedComp,
        this.circuit
      );
    },
    sternToDreieck_openMenu(selectedComp) {
      let sternToDreieck = new SternToDreieck();
      this.sternToDreieck_data = sternToDreieck.isPossible(
        selectedComp,
        this.circuit
      );
    },
    permutation_openMenu(selectedComp) {
      let permutation = new Permutation();
      this.permutation_data = permutation.isPossible(
        selectedComp,
        this.circuit
      );
    },
    multipleRinSerie_function: function() {
      let multiRinSerie = new MultipleRinSerie();
      multiRinSerie.isPossible(
        true,
        this.circuit.getSelectedComponents(),
        this.circuit
      );
      multiRinSerie.conversion(
        this.circuit.getSelectedComponents(),
        this.circuit
      );
      this.resetAndSaveAfterConversion();
    },
    multipleRinParallel_function: function() {
      let multiRinParallel = new MultipleRinParallel();
      multiRinParallel.conversion(this.circuit);
      this.resetAndSaveAfterConversion();
    },
    theveninToNorton_function() {
      let theveninToNorton = new TheveninToNorton();
      theveninToNorton.isPossible(
        true,
        this.circuit.getSelectedComponents(),
        this.circuit
      );
      theveninToNorton.conversion(this.circuit);
      this.resetAndSaveAfterConversion();
    },
    nortonToThevenin_function() {
      let nortonToThevenin = new NortonToThevenin();
      nortonToThevenin.isPossible(
        true,
        this.circuit.getSelectedComponents(),
        this.circuit
      );
      nortonToThevenin.conversion(this.circuit);
      this.resetAndSaveAfterConversion();
    },
    dreieckToStern_function() {
      let dreieckToStern = new DreieckToStern();
      dreieckToStern.conversion(
        this.circuit.getSelectedComponents(),
        this.circuit
      );
      this.resetAndSaveAfterConversion();
    },
    sternToDreieck_function() {
      let sternToDreieck = new SternToDreieck();
      sternToDreieck.conversion(
        this.circuit.getSelectedComponents(),
        this.circuit
      );
      this.resetAndSaveAfterConversion();
    },
    permutation_function() {
      if (confirm('Potential values will change')) {
        let permutation = new Permutation();
        permutation.conversion(
          this.circuit.getSelectedComponents(),
          this.circuit
        );
        this.resetAndSaveAfterConversion();
      }
    },
    resetAndSaveAfterConversion() {
      this.$emit('tool-state-changed', this.toolState.STATE_IDLE);
      this.circuit.components.map(c => (c.selected = false));
      this.closeMenu();
      EventBus.emit('BBSave');
    },

    doubleClick: function(component) {
      // clear if some text is selected by double click
      if (document.selection && document.selection.empty) {
        document.selection.empty();
      } else if (window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
      }

      if (this.selectedTool === this.toolState.STATE_IDLE) {
        EventBus.emit('BBcomp', component);
      }
    },

    /**
     * #region Drag&Drop
     */
    dragStart: function(e) {
      this.$emit('tool-state-changed', this.toolState.STATE_IDLE);
      this.resetbyfalseCreationWire(false);
      this.resetCompFromWire();

      // src: https://stackoverflow.com/questions/7680285/how-do-you-turn-off-setdragimage
      var img = document.createElement('img');
      img.src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; //blank img
      e.dataTransfer.setDragImage(img, 0, 0);

      this.compToDD = e.target.alt; // target.alt is the correct name of the component
    },
    drop: function(e, saveAfterDrop) {
      const c_id = this.compToDD;
      if (c_id != '') {
        //security
        let targetDiv = this.$refs.targetDiv; //instead of document.getElementById("targetDiv");
        let tgt = targetDiv.getBoundingClientRect();
        let valueScrollTop = targetDiv.scrollTop; //if the srollcar is used, valueScrollTop and Left take this offset
        let valueScrollLeft = targetDiv.scrollLeft;

        let valueTop = e.clientY - tgt.top + valueScrollTop; //calculate the correct coordinate
        let valueLeft = e.clientX - tgt.left + valueScrollLeft;

        //method from dropComponent.js
        let c = dropComp({
          withPresValue: this.getWithPredefinedValue,
          c_id,
          valueLeft,
          valueTop
        });

        this.circuit.components.push(c);
        if (saveAfterDrop === true) {
          EventBus.emit('BBSave');
        }
        return c;
      }
    },
    /**
     * #endregion
     */

    /**
     * #region Movement
     */
    moveStart: function(event, component) {
      if (this.selectedTool === this.toolState.TOOL_MOVE) {
        this.selectedComponent = component;
        this.shiftX = event.offsetX; //where I click inside Component
        this.shiftY = event.offsetY;
      }
    },
    moveMotion: function(e) {
      if (
        this.selectedComponent &&
        this.selectedTool === this.toolState.TOOL_MOVE
      ) {
        let targetDiv = this.$refs.targetDiv;
        let tgt = targetDiv.getBoundingClientRect();
        let valueTop = null;
        let valueLeft = null;

        this.selectedComponent.recalculatePins();

        if (
          this.selectedComponent.rotation === 0 ||
          this.selectedComponent.rotation === 180 ||
          this.selectedComponent.isMultiPin === true
        ) {
          valueTop = e.clientY - tgt.top + targetDiv.scrollTop - this.shiftY;
          valueLeft = e.clientX - tgt.left + targetDiv.scrollLeft - this.shiftX;
        } else if (
          this.selectedComponent.rotation === 90 ||
          this.selectedComponent.rotation === 270
        ) {
          valueTop = e.clientY - tgt.top + targetDiv.scrollTop - 18.9; // because width === 63.31 and graphical mouse is in middle of comp
          valueLeft = e.clientX - tgt.left + targetDiv.scrollLeft - 50; // because height === 100 => be placed on horizontal center
        }

        this.selectedComponent.y = valueTop;
        this.selectedComponent.x = valueLeft;
      }
      if (
        this.selectedTool === this.toolState.TOOL_CREATE_WIRE &&
        this.onCreationWire === true
      ) {
        let targetDiv = this.$refs.targetDiv;
        let tgt = targetDiv.getBoundingClientRect();
        const valTop = e.clientY - tgt.top + targetDiv.scrollTop;
        const valLeft = e.clientX - tgt.left + targetDiv.scrollLeft;
        const line = document.getElementById('tempLine');
        line.setAttribute('x2', valLeft);
        line.setAttribute('y2', valTop);
      }
    },
    moveEnd: function(e) {
      if (
        this.selectedComponent &&
        this.selectedTool === this.toolState.TOOL_MOVE
      ) {
        this.moveMotion(e);
        this.selectedComponent = null;
        EventBus.emit('BBSave');
      }
      if (
        this.selectedTool === this.toolState.TOOL_CREATE_WIRE &&
        this.onCreationWire === true
      ) {
        //move up not on a pin
        this.onCreationWire = false;
        this.resetCompFromWire();
        document.getElementById('tempLine').remove();
      }
    },
    pinMoveEnd(component, nr) {
      if (
        this.selectedTool === this.toolState.TOOL_CREATE_WIRE &&
        this.onCreationWire === true
      ) {
        if (this.toComponent === null && this.fromComponent !== component) {
          this.toComponentPin = nr;
          this.toComponent = component;
          this.drawWire();
          EventBus.emit('BBSave');
        } else if (
          this.fromComponent !== null &&
          this.toComponent === null &&
          this.fromComponentPin !== nr
        ) {
          // you are on same comp BUT not same pin
          let newValLeft;
          if (this.fromComponent.x - 50 > 0) {
            newValLeft = this.fromComponent.x - 10;
          } else {
            newValLeft = this.fromComponent.x + 80;
          }
          const newValTop = this.fromComponent.y + 50;
          const kn = dropComp({
            c_id: 'Knoten',
            valueLeft: newValLeft,
            valueTop: newValTop
          });
          this.circuit.components.push(kn);
          //connect 2 pins from this.fromComponent with kn pin
          const createWire = (fC, fCpin, tC, tCpin) => {
            let wire = new WireJS({
              from: fC.pins[fCpin],
              to: tC.pins[tCpin]
            });
            this.circuit.wires.push(wire);
            this.pinOpacity0(wire);
          };
          createWire(this.fromComponent, 0, kn, 0);
          createWire(this.fromComponent, 1, kn, 0);
          EventBus.emit('BBSave');
        } else {
          alert('You can choose same pin of the same component');
        }
        this.resetCompFromWire();
        this.onCreationWire = false;
        document.getElementById('tempLine').remove();
      }
    },
    /**
     * #endregion
     */

    simpleClick: function(component) {
      if (this.selectedTool === this.toolState.TOOL_SELECT) {
        component.selection();
        component.recalculatePins();
      } else if (this.selectedTool === this.toolState.TOOL_DELETE) {
        this.circuit.deleteOneComponent(component); //call the function delete
        EventBus.emit('BBSave');
      } else if (
        this.selectedTool === this.toolState.TOOL_ROTATE &&
        component.isMultiPin === false
      ) {
        component.rotateRight();
        EventBus.emit('BBSave');
      }
    },
    /**
     * #region Wire
     */
    creationWire: function() {
      if (this.selectedTool === this.toolState.TOOL_CREATE_WIRE) {
        this.resetbyfalseCreationWire(false);
      } else {
        this.resetbyfalseCreationWire(true);
      }
      this.resetCompFromWire();
    },

    pinClicked: function(component, nr) {
      if (this.selectedTool !== this.toolState.TOOL_CREATE_WIRE) {
        return;
      }
      this.onCreationWire = true;
      this.fromComponentPin = nr;
      this.fromComponent = component;
      var newLine = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      newLine.style.stroke = 'black';
      newLine.style.strokeWidth = '2';
      newLine.setAttribute('id', 'tempLine');
      newLine.setAttribute('x1', component.pins[nr].x);
      newLine.setAttribute('y1', component.pins[nr].y);
      newLine.setAttribute('x2', component.pins[nr].x);
      newLine.setAttribute('y2', component.pins[nr].y);
      document.getElementById('svgArea').append(newLine);
    },
    resetbyfalseCreationWire: function(bool) {
      if (bool === true) {
        this.$emit('tool-state-changed', this.toolState.TOOL_CREATE_WIRE);
      } else if (bool === false) {
        this.$emit('tool-state-changed', this.toolState.STATE_IDLE);
      }
    },
    resetCompFromWire() {
      this.fromComponent = this.fromComponentPin = this.toComponent = this.toComponentPin = null;
    },
    selectedWire: function(line) {
      if (this.selectedTool === this.toolState.TOOL_DELETE) {
        this.circuit.deleteOneWire(line);
        EventBus.emit('BBSave');
      }
    },

    dropOnWire(e, wire) {
      if (confirm('Do you want to insert this component on the Wire?')) {
        const comp = this.drop(e, false);
        this.circuit.wires.forEach(w => {
          if (w === wire) {
            const fromComp = this.circuit.componentFromPin(w.from);
            const fromPin = this.circuit.pinIndexFromComponent(
              fromComp,
              w.from
            );
            const toComp = this.circuit.componentFromPin(w.to);
            const toPin = this.circuit.pinIndexFromComponent(toComp, w.to);
            this.circuit.deleteOneWire(w);
            if (comp.isMultiPin) {
              this.circuit.createOneWire(comp, 0, fromComp, fromPin);
              this.circuit.createOneWire(comp, 0, toComp, toPin);
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
                this.circuit.createOneWire(comp, 0, fromComp, fromPin);
                this.circuit.createOneWire(comp, 1, toComp, toPin);
              } else {
                this.circuit.createOneWire(comp, 1, fromComp, fromPin);
                this.circuit.createOneWire(comp, 0, toComp, toPin);
              }
            }
            EventBus.emit('BBSave');
          }
        });
      } else {
        this.drop(e, true);
      }
    },
    drawWire: function() {
      let wire = new WireJS({
        from: this.fromComponent.pins[this.fromComponentPin],
        to: this.toComponent.pins[this.toComponentPin]
      });
      this.circuit.wires.push(wire);
      this.pinOpacity0(wire);
    },

    pinOpacity0: function(wire) {
      const showHidePin = (c, pinNB) => {
        if (c.isMultiPin === false) {
          if (pinNB === 0) {
            c.showPin1 = false;
          } else if (pinNB === 1) {
            c.showPin2 = false;
          }
        }
      };
      const fromComp = this.circuit.componentFromPin(wire.from);
      const toComp = this.circuit.componentFromPin(wire.to);
      showHidePin(
        fromComp,
        this.circuit.pinIndexFromComponent(fromComp, wire.from)
      );
      showHidePin(toComp, this.circuit.pinIndexFromComponent(toComp, wire.to));
    },
    /**
     * #endregion
     */

    /**
     * #region MenuBar function
     */
    MBcapture() {
      let targetDiv = document.getElementById('targetDiv');
      targetDiv.scrollTo(0, 0);
      print();
    },

    MBsolve() {
      if (
        hasMainVal(this.circuit.components) &&
        this.circuit.components.length > 0
      ) {
        let solver = new CircuitSolver();
        try {
          solver.solveWithAttribution(this.circuit);
          EventBus.emit('BBresult');
          EventBus.emit('BBSave');
        } catch (e) {
          alert('*****ERROR*****\n' + e.message);
        }
      }
    },
    MBopenFile() {
      var file = document.getElementById('fileInput').files[0];
      const blob = new Blob([file], { type: 'application/json' });
      const fr = new FileReader();
      var obj;
      var self = this;

      fr.onload = function() {
        obj = JSON.parse(fr.result);
        console.log('JSON.parse(fr.result)\n', obj);
      };
      fr.readAsText(blob);
      fr.onloadend = function() {
        console.log('START Load');
        self.circuit.loadNewCircuit(obj);
        console.log('Comp Ok, Wire load start');
        self.circuit.loadWireOfNewCircuit(obj);
        console.log('CIRCUIT LOADED', self.circuit);
      };
      EventBus.emit('BBSave');
    },
    MBsaveFile() {
      let data = this.circuit;
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
    },
    MBgetEmptyCircuit() {
      if (
        confirm(
          'The current file will be deleted when you create a new one. Are you sure ?'
        )
      ) {
        this.$emit('set-circuit');
        EventBus.emit('BBSave');
      }
    }
  }
};
</script>

<style>
@import './cssFolder/bigBody.css';

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
