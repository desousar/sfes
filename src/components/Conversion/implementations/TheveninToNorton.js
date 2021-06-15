// eslint-disable-next-line no-unused-vars
import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
// eslint-disable-next-line no-unused-vars
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';
// eslint-disable-next-line no-unused-vars
import VoltageSrcJS from '../../jsFolder/constructorComponent/jsComponents/VoltageSource';
// eslint-disable-next-line no-unused-vars
import CurrentSrcJS from '../../jsFolder/constructorComponent/jsComponents/CurrentSource';
// eslint-disable-next-line no-unused-vars
import WireJS from '../../jsFolder/constructorComponent/Wire.js';

// eslint-disable-next-line no-unused-vars
import { dropComp } from '../../jsFolder/dropComponent';

export default class TheveninToNorton {
  constructor() {
    this.ext1out_comp = undefined;
    this.ext1out_pinID = undefined;
    this.ext1in_comp = undefined;
    this.ext1in_pinID = undefined;
    this.ext2out_comp = undefined;
    this.ext2out_pinID = undefined;
    this.initialDirU = undefined;
  }

  /**
   * every Conversion Class has at least 2 importants functions:
   * -isPossible()
   * -conversion()
   */

  /**
   * @param {just comp with attribut selected === true} selectedComp_array
   * @param {entire object} circuit
   * @returns true if condition are met :
   * -isInstanceCorrect()
   * -isInSerie()
   */
  isPossible(selectedComp_array, circuit) {
    console.log('---------TheveninToNorton---------');
    let isInstanceCorrect_bool = false;
    let isInSerie_bool = false;
    if (selectedComp_array.length !== 2) {
      return false;
    } else {
      try {
        selectedComp_array.forEach(comp => {
          comp.assertMainValue();
        });
        isInstanceCorrect_bool = this.isInstanceCorrect(selectedComp_array);
        isInSerie_bool = this.isInSerie(selectedComp_array, circuit);
      } catch (e) {
        alert(e.message);
      }
    }
    return isInstanceCorrect_bool && isInSerie_bool;
  }

  isInstanceCorrect(selectedComp_array) {
    let oneResistor = false;
    let oneVoltageSrc = false;
    selectedComp_array.forEach(comp => {
      console.log(comp.symbol);
      if (comp instanceof ResistorJS) {
        console.log('is resistor');
        oneResistor = true;
      }
      if (comp instanceof VoltageSrcJS) {
        console.log('is voltageSrc');
        oneVoltageSrc = true;
      }
    });
    console.log('isInstanceCorrect', oneResistor && oneVoltageSrc);
    return oneResistor && oneVoltageSrc;
  }

  isInSerie(selectedComp_array, circuit) {
    circuit.components.map(comp => (comp.flagConversion = false));
    console.log('reset');
    let firstComp = selectedComp_array[0];
    firstComp.flagConversion = true;
    console.log(firstComp.symbol, 'flagConversion = true');
    circuit.wires.forEach(w => {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (firstComp === fromComp) {
        console.log('find', firstComp.symbol, 'on fromComp');
        this.nextNeighbor(circuit, fromComp, toComp);
      }
      if (firstComp === toComp) {
        console.log('find', firstComp.symbol, 'on toComp');
        this.nextNeighbor(circuit, toComp, fromComp);
      }
    });
    console.log('FINISH');
    const result = selectedComp_array.every(
      comp => comp.flagConversion === true
    );
    circuit.components.map(comp => (comp.flagConversion = false));
    // console.log(
    //   'extremity',
    //   this.ext1out_comp.symbol,
    //   'on',
    //   this.ext1out_pinID,
    //   this.ext2out_comp.symbol,
    //   'on',
    //   this.ext2out_pinID
    // );
    return result;
  }

  getNextCompWith(circuit, comp) {
    for (let wire of circuit.wires) {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (comp === compFrom) {
        console.log('ENTER 10:', compTo.symbol);
        if (compTo.flagConversion !== true) {
          this.nextNeighbor(circuit, compFrom, compTo);
        }
      } else if (comp === compTo) {
        console.log('ENTER 20:', compFrom.symbol);
        if (compFrom.flagConversion !== true) {
          this.nextNeighbor(circuit, compTo, compFrom);
        }
      }
    }
  }

  nextNeighbor(circuit, origin, comp) {
    console.log(comp.symbol, 'is under test');
    if (comp.flagConversion === true) {
      console.log(comp.symbol, ' flagConversion is already true A LOOP');
      return;
    } else if (
      comp.selected ||
      (comp instanceof KnotenJS &&
        circuit.getCountConnection(comp) === 2 &&
        comp.valuePotentialSource === undefined)
    ) {
      comp.flagConversion = true;
      console.log(comp.symbol, 'flagConversion = true');
      this.getNextCompWith(circuit, comp);
    } else {
      var pinID = undefined;
      for (let wire of circuit.wires) {
        const compFrom = circuit.componentFromPin(wire.from);
        const compTo = circuit.componentFromPin(wire.to);
        if (origin === compFrom && comp === compTo) {
          pinID = circuit.pinIndexFromComponent(comp, wire.to);
        } else if (origin === compTo && comp === compFrom) {
          pinID = circuit.pinIndexFromComponent(comp, wire.from);
        }
      }

      this.ext1out_comp === undefined
        ? (this.ext1out_comp = comp)
        : (this.ext2out_comp = comp);
      this.ext1out_pinID === undefined
        ? (this.ext1out_pinID = pinID)
        : (this.ext2out_pinID = pinID);
    }
  }
  /* */
}
