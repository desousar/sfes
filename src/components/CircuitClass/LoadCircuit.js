import Knoten from '@/components/jsFolder/constructorComponent/jsComponents/Knoten.js';
import CurrentSource from '@/components/jsFolder/constructorComponent/jsComponents/CurrentSource.js';
import Resistor from '@/components/jsFolder/constructorComponent/jsComponents/Resistor.js';
import VoltageSource from '@/components/jsFolder/constructorComponent/jsComponents/VoltageSource.js';
import Ampermeter from '@/components/jsFolder/constructorComponent/jsComponents/Ampermeter.js';
import Voltmeter from '@/components/jsFolder/constructorComponent/jsComponents/Voltmeter.js';
import Klemme from '@/components/jsFolder/constructorComponent/jsComponents/Klemme.js';

import log from '@/consoleLog';

function loadNewCircuit(obj) {
  this.components = undefined;
  log('obj before comp:', obj);
  obj.components.forEach((comp) => {
    /**
     * for every components
     * set the Prototype by checking comp.name
     */
    if (comp.name === 'Resistor') {
      Object.setPrototypeOf(comp, Resistor.prototype);
      //because comp needs recalculatePins() (when move) who is in Component.js (parent)
    }
    if (comp.name === 'VoltageSource') {
      Object.setPrototypeOf(comp, VoltageSource.prototype);
    }
    if (comp.name === 'CurrentSource') {
      Object.setPrototypeOf(comp, CurrentSource.prototype);
    }
    if (comp.name === 'Ampermeter') {
      Object.setPrototypeOf(comp, Ampermeter.prototype);
    }
    if (comp.name === 'Voltmeter') {
      Object.setPrototypeOf(comp, Voltmeter.prototype);
    }
    if (comp.name === 'Knoten') {
      Object.setPrototypeOf(comp, Knoten.prototype);
    }
    if (comp.name === 'Klemme') {
      Object.setPrototypeOf(comp, Klemme.prototype);
    }
  });
  this.components = obj.components;

  this.wires = [];
  obj.wires.forEach((w) => {
    const fromComp = this.componentFromPinWithXY(w.from);
    const fromPinNB = this.pinIndexFromComponentWithXY(fromComp, w.from);
    const toComp = this.componentFromPinWithXY(w.to);
    const toPinNB = this.pinIndexFromComponentWithXY(toComp, w.to);
    w.from = fromComp.pins[fromPinNB];
    w.to = toComp.pins[toPinNB];
    this.wires.push(w);
  });
}

export { loadNewCircuit };
