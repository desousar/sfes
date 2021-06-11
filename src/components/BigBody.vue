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
      @drop.prevent="drop"
      @dragenter.prevent
      @mouseup="moveEnd"
      @mousemove.prevent="moveMotion($event)"
      @contextmenu="openMenu"
      :class="{ 'z-50': false, 'z-75': true }"
    >
      <template v-for="(component, idx) in circuit.components">
        <span :key="'complabel-' + idx" v-if="component.showSymbol">
          <span
            v-if="!component.isMultiPin"
            :key="'label-' + idx"
            :style="{
              left: component.x + 5 + 'px',
              top: component.y - 30 + 'px',
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
          :is="component.name"
          :key="'component-' + idx"
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
          @mousedown="moveStart($event, component)"
          @mousemove="showTooltip($event, component)"
          @mouseout="hideTooltip()"
        ></svg>
        <div
          :key="'tooltip' + idx"
          id="tooltip"
          display="none"
          style="position: absolute; display: none"
        ></div>
      </template>

      <!--A4 = width="20cm" height="26.7cm"-->
      <svg
        :width="dynamicWidth()"
        :height="dynamicHeight()"
        :class="{ limitA4Paper: inA4Format }"
      >
        <template v-for="(wire, idx) in circuit.wires">
          <line
            style="cursor: pointer; stroke: black; stroke-width: 2"
            :key="'line-' + idx"
            class="lineClass"
            :x1="wire.from.x"
            :x2="wire.to.x"
            :y1="wire.from.y"
            :y2="wire.to.y"
          />
          <line
            style="cursor: pointer; stroke: transparent; stroke-width: 10"
            :key="'shadow-line-' + idx"
            class="lineClass"
            :x1="wire.from.x"
            :x2="wire.to.x"
            :y1="wire.from.y"
            :y2="wire.to.y"
            @click="selectedWire(wire)"
          />
        </template>
      </svg>

      <popupComp
        v-show="isPopupCompVisible"
        @close="openClosePopupComp"
        :compoToPass="CompoToPass"
        :arrayComponents="circuit.components"
        :currentLanguage="currentLanguage"
      />

      <popupResult
        v-show="isPopupResultVisible"
        @close="openClosePopupResult"
        :arrayComponents="circuit.components"
        :currentLanguage="currentLanguage"
      />

      <popupEquivalentSrc
        v-show="isPopupEquivalentSrcVisible"
        @close="openClosePopupEquivalentSrc"
        :circuitcomplet="circuit"
        :currentLanguage="currentLanguage"
      />

      <popupAboutUs
        v-show="isPopupAboutUsVisible"
        @close="openClosePopupAboutUs"
        :currentLanguage="currentLanguage"
      />

      <popupHelp
        v-show="isPopupHelpVisible"
        @close="openClosePopupHelp"
        :currentLanguage="currentLanguage"
      />

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
      </ul>
    </div>
  </div>
</template>

<script>
import EventBus from './jsFolder/event-bus';
import toolStates from '../states.js';
import { dropComp } from './jsFolder/dropComponent.js';
import CircuitSolver from './jsFolder/constructorComponent/CircuitSolver.js';

import popupComp from './popupComp.vue';
import popupResult from './popupResult.vue';
import popupEquivalentSrc from './popupEquivalentSrc.vue';
import popupAboutUs from './popupAboutUs.vue';
import popupHelp from './popupHelp.vue';
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
import Circuit from './jsFolder/constructorComponent/Circuit';

import MultipleRinSerie from './Conversion/implementations/MultipleRinSerie.js';
import MultipleRinParallel from './Conversion/implementations/MultipleRinParallel.js';

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
  { name: 'CurrentSource', src: srcPath('CurrentSource.svg') },
  { name: 'VoltageSource', src: srcPath('VoltageSource.svg') },
  { name: 'Ampermeter', src: srcPath('Ampermeter.svg') },
  { name: 'Voltmeter', src: srcPath('Voltmeter.svg') }
];

export default {
  components: {
    popupComp,
    popupResult,
    popupEquivalentSrc,
    popupAboutUs,
    popupHelp,
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
    selectedTool: Number,
    circuit: Object, //circuit with components and wires array
    undoRedoData: Object
  },
  mounted: function() {
    EventBus.$on('MBcapture', () => {
      this.MBcapture();
    });
    EventBus.$on('MBa4Format', newA4Bool => {
      this.inA4Format = newA4Bool;
    });
    EventBus.$on('MBsolve', () => {
      this.MBsolve();
    });
    EventBus.$on('MBopenFile', () => {
      this.MBopenFile();
    });
    EventBus.$on('MBsaveFile', () => {
      this.MBsaveFile();
    });
    EventBus.$on('MBequivalentSource', () => {
      this.MBequivalentSource();
    });
    EventBus.$on('MBgetEmptyCircuit', () => {
      this.MBgetEmptyCircuit();
    });
    EventBus.$on('MBaboutUs', () => {
      this.MBaboutUs();
    });
    EventBus.$on('MBhelp', () => {
      this.MBhelp();
    });
  },

  data() {
    return {
      inA4Format: false,
      componentsItem: componentsItem,
      wireItem: wireItem,
      selectedComponent: null,
      shiftX: null,
      shiftY: null,
      fromComponentPin: null,
      fromComponent: null,
      toComponentPin: null,
      toComponent: null,
      symbolNumber: 0,
      isPopupCompVisible: false,
      CompoToPass: null,
      isPopupResultVisible: false,
      isPopupEquivalentSrcVisible: false,
      isPopupAboutUsVisible: false,
      isPopupHelpVisible: false,

      toolState: toolStates,

      viewMenu: false,
      top: '0px',
      left: '0px',
      multipleRinSerie_data: false,
      multipleRinParallel_data: false
    };
  },
  methods: {
    showTooltip: function(e, comp) {
      if (this.selectedTool === this.toolState.STATE_IDLE) {
        let tooltip = document.getElementById('tooltip');
        tooltip.innerHTML = comp.getString();
        tooltip.style.display = 'block';

        let targetDiv = this.$refs.targetDiv;
        let tgt = targetDiv.getBoundingClientRect();
        let valueTop = e.clientY - tgt.top + targetDiv.scrollTop;
        let valueLeft = e.clientX - tgt.left + targetDiv.scrollLeft;

        tooltip.style.left = valueLeft + 10 + 'px';
        tooltip.style.top = valueTop + 10 + 'px';
      }
    },
    hideTooltip: function() {
      let tooltip = document.getElementById('tooltip');
      tooltip.style.display = 'none';
    },
    dynamicWidth: function() {
      let targetDiv = this.$refs.targetDiv;
      if (targetDiv !== undefined) {
        let width = targetDiv.scrollWidth;
        return width + 'px';
      }
    },
    dynamicHeight: function() {
      let targetDiv = this.$refs.targetDiv;
      if (targetDiv !== undefined) {
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
      console.log('open menu');
      const selectedComp = this.circuit.getSelectedComponents();
      this.multipleRinSerie_openMenu(selectedComp);
      this.multipleRinParallel_openMenu(selectedComp);
    },
    multipleRinSerie_openMenu: function(selectedComp) {
      let multiRinSerie = new MultipleRinSerie();
      this.multipleRinSerie_data = multiRinSerie.isPossible(
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

    multipleRinSerie_function: function() {
      let multiRinSerie = new MultipleRinSerie();
      multiRinSerie.isPossible(
        this.circuit.getSelectedComponents(),
        this.circuit
      );
      multiRinSerie.conversion(
        this.circuit.getSelectedComponents(),
        this.circuit
      );
      this.$emit('tool-state-changed', this.toolState.STATE_IDLE);
      this.closeMenu();
      this.save();
    },
    multipleRinParallel_function: function() {
      let multiRinParallel = new MultipleRinParallel();
      multiRinParallel.conversion(this.circuit);
      this.$emit('tool-state-changed', this.toolState.STATE_IDLE);
      this.closeMenu();
      this.save();
    },

    openClosePopupComp: function() {
      // situation: click on close button from pop up windows
      if (this.isPopupCompVisible) {
        this.save();
      }
      this.isPopupCompVisible = !this.isPopupCompVisible;
    },
    openClosePopupResult: function() {
      this.isPopupResultVisible = !this.isPopupResultVisible;
    },
    openClosePopupEquivalentSrc: function() {
      this.isPopupEquivalentSrcVisible = !this.isPopupEquivalentSrcVisible;
    },
    openClosePopupAboutUs: function() {
      this.isPopupAboutUsVisible = !this.isPopupAboutUsVisible;
    },
    openClosePopupHelp: function() {
      this.isPopupHelpVisible = !this.isPopupHelpVisible;
    },

    doubleClick: function(component) {
      if (this.selectedTool === this.toolState.STATE_IDLE) {
        this.CompoToPass = component;
        this.openClosePopupComp();
      }
    },

    /**
     * #region Drag&Drop
     */
    dragStart: function(e) {
      this.$emit('tool-state-changed', this.toolState.STATE_IDLE);
      this.resetbyfalseCreationWire(false);
      this.resetCompFromWire();

      const target = e.target;
      e.dataTransfer.setData('c_id', target.alt); // target.alt is the correct name of the component
    },
    drop: function(e) {
      const c_id = e.dataTransfer.getData('c_id');
      if (c_id != '') {
        //security
        let targetDiv = this.$refs.targetDiv; //instead of document.getElementById("targetDiv");
        let tgt = targetDiv.getBoundingClientRect();
        let valueScrollTop = targetDiv.scrollTop; //if the srollcar is used, valueScrollTop and Left take this offset
        let valueScrollLeft = targetDiv.scrollLeft;

        let valueTop = e.clientY - tgt.top + valueScrollTop; //calculate the correct coordinate
        let valueLeft = e.clientX - tgt.left + valueScrollLeft;

        //method from dropComponent.js
        let c = dropComp(c_id, valueLeft, valueTop, this.symbolNumber);

        this.circuit.components.push(c);
        this.symbolNumber = this.symbolNumber + 1;
        this.save();
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
    },
    moveEnd: function(e) {
      if (
        this.selectedComponent &&
        this.selectedTool === this.toolState.TOOL_MOVE
      ) {
        this.moveMotion(e);
        this.selectedComponent = null;
        this.save();
      }
    },
    /**
     * #endregion
     */

    simpleClick: function(component) {
      if (
        this.selectedTool === this.toolState.TOOL_SELECT &&
        component.isMultiPin === false
      ) {
        component.selected = !component.selected;
      } else if (this.selectedTool === this.toolState.TOOL_DELETE) {
        this.circuit.deleteOneComponent(component); //call the function delete
        this.save();
      } else if (
        this.selectedTool === this.toolState.TOOL_ROTATE &&
        component.isMultiPin === false
      ) {
        component.rotateRight();
        this.save();
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
      if (this.fromComponent === null && this.toComponent === null) {
        this.fromComponentPin = nr;
        this.fromComponent = component;
      } else if (
        this.fromComponent !== null &&
        this.toComponent === null &&
        this.fromComponent !== component
      ) {
        this.toComponentPin = nr;
        this.toComponent = component;

        this.drawWire();
        this.resetCompFromWire();
        this.save();
      } else if (
        this.fromComponent !== null &&
        this.toComponent === null &&
        this.fromComponentPin !== nr
      ) {
        // you are on same comp BUT not same pin
        const newValLeft = this.fromComponent.x - 50;
        const newValTop = this.fromComponent.y + 50;
        const kn = dropComp('Knoten', newValLeft, newValTop, 'temp');
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
        this.resetCompFromWire();
        this.save();
      } else {
        alert('You can choose same pin of the same component');
        this.resetCompFromWire();
      }
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
        this.circuit.wires.forEach((wire, index) => {
          console.log(line);
          if (line === wire) {
            this.deleteOneWire(wire, index);
            this.save();
          }
        });
      }
    },
    deleteOneWire(wireToDelete, index) {
      for (
        let compIndex = this.circuit.components.length - 1;
        compIndex >= 0;
        compIndex -= 1
      ) {
        let compUnderTest = this.circuit.components[compIndex];
        const fromComp = this.circuit.componentFromPin(wireToDelete.from);
        const fromPinNB = this.circuit.pinIndexFromComponent(
          fromComp,
          wireToDelete.from
        );
        const toComp = this.circuit.componentFromPin(wireToDelete.to);
        const toPinNB = this.circuit.pinIndexFromComponent(
          toComp,
          wireToDelete.to
        );
        if (fromComp === compUnderTest) {
          if (compUnderTest.isMultiPin === false) {
            fromPinNB === 0
              ? (compUnderTest.showPin1 = true)
              : (compUnderTest.showPin2 = true);
          }
        } else if (toComp === compUnderTest) {
          if (compUnderTest.isMultiPin === false) {
            toPinNB === 0
              ? (compUnderTest.showPin1 = true)
              : (compUnderTest.showPin2 = true);
          }
        }
      }
      this.circuit.wires.splice(index, 1); //delete line graphical
      this.circuit.components.forEach(comp => {
        comp.resetCalculatedValues();
      });
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
     * #region Undo Redo function
     */
    setValue(value) {
      if (this.undoRedoData.position < this.undoRedoData.history.length - 1) {
        this.undoRedoData.history = this.undoRedoData.history.slice(
          0,
          this.undoRedoData.position + 1
        );
      }
      if (
        this.undoRedoData.position ===
        this.undoRedoData.historyMaxLength - 1
      ) {
        this.$emit('shift-history');
        this.$emit('set-position', -1);
      }
      this.$emit('push-history', value);
      this.$emit('set-position', 1);
    },
    save() {
      const deepCopy = this.circuit.project();
      console.log(deepCopy.components);
      this.setValue(deepCopy);
    },
    /**
     * #endregion
     */

    /**
     * #region MenuBar function
     */
    MBcapture: function() {
      print();
    },

    MBsolve() {
      if (this.circuit.components.length > 0 && this.circuit.wires.length > 0) {
        let solver = new CircuitSolver();
        try {
          solver.solveWithAttribution(this.circuit);
          this.openClosePopupResult();
          this.save();
        } catch (e) {
          alert('*****ERROR*****\n' + e.message);
        }
      }
    },
    MBequivalentSource() {
      this.openClosePopupEquivalentSrc();
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
      this.save();
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
        newLink.style.display = 'none';
        document.body.appendChild(newLink);
      }
      newLink.click();
    },
    MBgetEmptyCircuit() {
      this.circuit = new Circuit([], []);
      this.save();
    },
    MBaboutUs() {
      this.openClosePopupAboutUs();
    },
    MBhelp() {
      this.openClosePopupHelp();
    }
  }
};
</script>

<style>
@import './cssFolder/bigBody.css';

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
    left: 0;
    top: 0;
    width: 21cm;
    height: 26.7cm;
    overflow: hidden;
    transform-origin: top left;
  }

  .z-50 {
    transform: scale(0.5);
  }

  .z-75 {
    transform: scale(0.75);
  }
}
</style>
