import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import KlemmeJS from '../../jsFolder/constructorComponent/jsComponents/Klemme';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';
import CurrentSrcJS from '../../jsFolder/constructorComponent/jsComponents/CurrentSource';

import {
  centerX2PinsComp,
  centerY2PinsComp
} from '../../jsFolder/constructorComponent/Component';

import { dropComp } from '../../jsFolder/dropComponent';

export default class TheveninToNorton {
  /**
   * ext1out_comp : extern extremity on CurrentSrcJS side (neighbor)
   * ext1out_pinID : neighbor pin on which CurrentSrcJS is connected
   * ext1in_maincomp : CurrentSrcJS
   * ext1in_pinID : CurrentSrcJS pin connected to ext1out_comp
   * ext1in_pinID_opposite : CurrentSrcJS pin connected to Resistor
   * rComp : Resistor
   */
  constructor() {
    this.ext1out_comp = undefined;
    this.ext1out_pinID = undefined;
    this.ext1in_maincomp = undefined;
    this.ext1in_pinID = undefined;
    this.ext1in_pinID_opposite = undefined;
    this.rComp = undefined;
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
   * -isInParallel()
   */
  isPossible (onReal, selectedComp_array, circuit) {
    console.log('---------NortonToThevenin---------');
    let isInstanceCorrect_bool = false;
    let isInParallel_bool = false;
    isInstanceCorrect_bool = this.isInstanceCorrect(selectedComp_array);
    if (!isInstanceCorrect_bool) {
      return false;
    }
    isInParallel_bool = this.isInParallel(onReal, selectedComp_array, circuit);
    return isInstanceCorrect_bool && isInParallel_bool;
  }

  isInstanceCorrect (selectedComp_array) {
    let oneResistor = false;
    let oneCurrentSrc = false;
    selectedComp_array.forEach(comp => {
      if (comp instanceof ResistorJS) {
        oneResistor = true;
        this.rComp = comp;
      }
      if (comp instanceof CurrentSrcJS) {
        oneCurrentSrc = true;
        this.ext1in_maincomp = comp;
      }
    });
    return oneResistor && oneCurrentSrc;
  }

  isInParallel (onReal, selectedComp_array, circuitOriginal) {
    let circuit;
    if (onReal) {
      circuit = circuitOriginal;
    } else {
      circuit = circuitOriginal.project();
    }

    // First Test: the selected components have the 2 neighbors and they are Knoten
    // WARNING can't interrupt a ForEach loop with return => use for loop
    let bool_data1 = this.is2MultiPinNeighbors(circuit, false);
    if (!bool_data1) {
      return false;
    }
    // Then visit all Knoten that are directs neighbors with firstComp
    // and flag twice comps that are neighbors to this visited Knoten and in selArray
    // FUSION
    for (let comp of selectedComp_array) {
      for (let w of circuit.wires) {
        const fromComp = circuit.componentFromPin(w.from);
        const toComp = circuit.componentFromPin(w.to);
        if (comp.uniqueID === fromComp.uniqueID) {
          // check "path" based on 1st pin
          const result = this.fusionNeighborsKnoten(
            circuit,
            fromComp,
            toComp,
            0
          );
          if (!result) {
            return false;
          }
        }
        if (comp.uniqueID === toComp.uniqueID) {
          // check "path" based on 2nd pin
          const result = this.fusionNeighborsKnoten(
            circuit,
            toComp,
            fromComp,
            1
          );
          if (!result) {
            return false;
          }
        }
      }
    }
    let bool_data2 = this.is2MultiPinNeighbors(circuit, true);
    if (!bool_data2) {
      return false;
    }
    return true;
  }

  is2MultiPinNeighbors (circuit, same) {
    let selArray = circuit.getSelectedComponents();
    for (let comp of selArray) {
      comp.find = [];
      console.log('comp under test', comp.symbol);
      for (let w of circuit.wires) {
        const fromComp = circuit.componentFromPin(w.from);
        const toComp = circuit.componentFromPin(w.to);
        if (comp.uniqueID === fromComp.uniqueID) {
          console.log('find1', comp.symbol);
          if (!toComp.isMultiPin) {
            console.log('STOP1');
            return false;
          } else {
            comp.find.push(toComp.uniqueID);
          }
        }
        if (comp.uniqueID === toComp.uniqueID) {
          console.log('find2', comp.symbol);
          if (!fromComp.isMultiPin) {
            console.log('STOP2');
            return false;
          } else {
            comp.find.push(fromComp.uniqueID);
          }
        }
      }
    }
    const firstTemp = selArray.splice(0, 1);
    const knTemp1uniqueID = firstTemp.find[0];
    const knTemp2uniqueID = firstTemp.find[1];
    for (let comp of selArray) {
      if (comp.find.length !== 2 || comp.find[0] === comp.find[1]) {
        console.log('Problem With Connection', comp.symbol);
        comp.find = undefined;
        return false;
      }
      if (same) {
        if (
          (comp.find[0] === knTemp1uniqueID &&
            comp.find[1] === knTemp2uniqueID) ||
          (comp.find[0] === knTemp2uniqueID && comp.find[1] === knTemp1uniqueID)
        ) {
          console.log('Not same Knoten', comp.symbol);
          comp.find = undefined;
          return false;
        }
      }
      comp.find = undefined;
    }
    return true;
  }

  //simplification by fusion from all Knoten to obtain the classical Norton circuit
  /*
     |-----kn----kl
     |     |
     I     R
     |     |
     L-----kn----kl
     */
  fusionNeighborsKnoten (circuit, origin, destination, compStorageID) {
    let selArray = circuit.getSelectedComponents();
    let localKnoten = [];
    console.log('find', origin.symbol, destination.isMultiPin);
    const r = this.nextNeighbor(circuit, origin, destination, compStorageID);
    if (r === false) {
      return false;
    }

    let result = selArray.every(comp => comp.flagConversion);
    console.log('***', result);
    if (!result) {
      return false;
    }

    circuit.components.forEach(k => {
      if (k.visited) {
        const count = this.getCountConnectionAsGroup(circuit, k);
        console.log('VISITED', k.symbol, count);
        if (count > 1 && k instanceof KnotenJS) {
          localKnoten.push(k);
        }
      }
    });

    selArray.map(comp => (comp.flagConversion = false));
    circuit.components.map(comp => (comp.visited = false));
    // for fusion keep One, transfer only connection (circuit.wires) to One and delete other if One isn't already connected
    var compStorage;
    compStorageID === 0 ? (compStorage = this.ext1) : (compStorage = this.ext2);
    console.log(localKnoten);
    if (compStorage !== undefined) {
      var index = localKnoten.indexOf(compStorage);
    }
    let [keepAlive] =
      compStorage !== undefined
        ? localKnoten.splice(index, 1)
        : localKnoten.splice(0, 1);
    console.log('keepAlive', keepAlive.symbol);
    localKnoten.forEach(lk => {
      for (let wire of circuit.wires) {
        const compFrom = circuit.componentFromPin(wire.from);
        const compTo = circuit.componentFromPin(wire.to);
        if (
          lk.uniqueID === compFrom.uniqueID &&
          (!(compTo instanceof KnotenJS) ||
            compTo.valuePotentialSource !== undefined) &&
          this.isNotConnectedTogether(compTo, keepAlive, circuit)
        ) {
          wire.from = keepAlive.pins[0];
        }
        if (
          lk.uniqueID === compTo.uniqueID &&
          (!(compFrom instanceof KnotenJS) ||
            compFrom.valuePotentialSource !== undefined) &&
          this.isNotConnectedTogether(compFrom, keepAlive, circuit)
        ) {
          wire.to = keepAlive.pins[0];
        }
      }
    });
    // Delete Other
    localKnoten.forEach(lk => {
      circuit.deleteOneComponent(lk);
    });
    return true;
  }

  isNotConnectedTogether (a, b, circuit) {
    for (let wire of circuit.wires) {
      var compFrom = circuit.componentFromPin(wire.from);
      var compTo = circuit.componentFromPin(wire.to);
      if (
        (a.uniqueID === compFrom.uniqueID && b.uniqueID === compTo.uniqueID) ||
        (a.uniqueID === compTo.uniqueID && b.uniqueID === compFrom.uniqueID)
      ) {
        return false;
      }
    }
    return true;
  }

  getCountConnectionAsGroup (circuit, comp) {
    let count = 0;
    for (let wire of circuit.wires) {
      var compFrom = circuit.componentFromPin(wire.from);
      var compTo = circuit.componentFromPin(wire.to);
      if (
        comp.uniqueID === compFrom.uniqueID &&
        (compTo.visited || compTo.flagConversion)
      ) {
        count++;
      }
      if (
        comp.uniqueID === compTo.uniqueID &&
        (compFrom.visited || compFrom.flagConversion)
      ) {
        count++;
      }
    }
    return count;
  }

  nextNeighbor (circuit, origin, comp, compStorageID) {
    var compStorage;
    compStorageID === 0 ? (compStorage = this.ext1) : (compStorage = this.ext2);
    const selArray = circuit.getSelectedComponents();
    if (selArray.includes(origin)) {
      console.log('SELARRAY contains', origin.symbol);
      origin.flagConversion = true;
    }
    console.log(comp.symbol, 'is under test');
    comp.visited = true;
    if (
      comp instanceof KlemmeJS ||
      (comp instanceof KnotenJS && comp.valuePotentialSource !== undefined)
    ) {
      if (compStorage === undefined) {
        compStorageID === 0
          ? (compStorage = this.ext1 = comp)
          : (compStorage = this.ext2 = comp);
        console.log('compStorage', compStorage.symbol);
      } else {
        console.log('ERROR');
        return false;
      }
    }
    for (let wire of circuit.wires) {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (comp.uniqueID === compFrom.uniqueID) {
        console.log('ENTER 10 find:', compTo.symbol);
        if (
          (compTo instanceof KnotenJS ||
            (compTo instanceof KlemmeJS && compStorage === undefined) ||
            (compTo instanceof KnotenJS &&
              compStorage === undefined &&
              compTo.valuePotentialSource !== undefined)) &&
          !compTo.visited
        ) {
          this.nextNeighbor(circuit, compFrom, compTo, compStorageID);
        }
        if (selArray.includes(compTo)) {
          console.log('SELARRAY10 contains', compTo.symbol);
          compTo.flagConversion = true;
        }
      } else if (comp.uniqueID === compTo.uniqueID) {
        console.log('ENTER 20 find:', compFrom.symbol);
        if (
          (compFrom instanceof KnotenJS ||
            (compFrom instanceof KlemmeJS && compStorage === undefined) ||
            (compFrom instanceof KnotenJS &&
              compStorage === undefined &&
              compFrom.valuePotentialSource !== undefined)) &&
          !compFrom.visited
        ) {
          this.nextNeighbor(circuit, compTo, compFrom, compStorageID);
        }
        if (selArray.indexOf(compFrom) !== -1) {
          console.log('SELARRAY20 contains', compFrom.symbol);
          compFrom.flagConversion = true;
        }
      }
    }
    return true;
  }

  conversion (circuit) {
    //we have a classical Norton circuit
    const valueIq = this.ext1in_maincomp.valueI;
    const dirU = this.ext1in_maincomp.directionU;
    const dirI = this.ext1in_maincomp.directionI;
    if (dirI === 0) {
      this.ext1in_pinID = 1;
      this.ext1in_pinID_opposite = 0;
    } else {
      this.ext1in_pinID = 0;
      this.ext1in_pinID_opposite = 1;
    }
    for (let wire of circuit.wires) {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (
        this.ext1in_maincomp.uniqueID === compFrom.uniqueID &&
        this.ext1in_pinID ===
        circuit.pinIndexFromComponent(this.ext1in_maincomp, wire.from)
      ) {
        this.ext1out_comp = compTo;
        this.ext1out_pinID = circuit.pinIndexFromComponent(compTo, wire.to);
        this.findR_middleConversion(circuit, valueIq, dirI, dirU);
      }
      if (
        this.ext1in_maincomp.uniqueID === compTo.uniqueID &&
        this.ext1in_pinID ===
        circuit.pinIndexFromComponent(this.ext1in_maincomp, wire.to)
      ) {
        this.ext1out_comp = compFrom;
        this.ext1out_pinID = circuit.pinIndexFromComponent(compFrom, wire.from);
        this.findR_middleConversion(circuit, valueIq, dirI, dirU);
      }
    }
  }

  findR_middleConversion (circuit, valueIq, dirI, dirU) {
    circuit.wires.forEach((wire2) => {
      const compFrom2 = circuit.componentFromPin(wire2.from);
      const compTo2 = circuit.componentFromPin(wire2.to);
      let pinRtoHold;
      if (
        this.ext1out_comp.uniqueID === compFrom2.uniqueID &&
        this.rComp.uniqueID === compTo2.uniqueID
      ) {
        pinRtoHold = circuit.pinIndexFromComponent(this.rComp, wire2.to);
        this.terminateTheConversion(
          circuit,
          wire2,
          valueIq,
          dirI,
          dirU,
          pinRtoHold
        );
      }
      if (
        this.ext1out_comp.uniqueID === compTo2.uniqueID &&
        this.rComp.uniqueID === compFrom2.uniqueID
      ) {
        pinRtoHold = circuit.pinIndexFromComponent(this.rComp, wire2.from);
        this.terminateTheConversion(
          circuit,
          wire2,
          valueIq,
          dirI,
          dirU,
          pinRtoHold
        );
      }
    });
  }

  terminateTheConversion (
    circuit,
    wire2,
    valueIq,
    dirI,
    dirU,
    pinRtoHold
  ) {
    circuit.deleteOneWire(wire2);
    circuit.deleteOneComponent(this.ext1in_maincomp);
    this.rComp.selected = false;
    let vsrc = dropComp({
      c_id: 'VoltageSource',
      valueLeft: this.ext1in_maincomp.x + centerX2PinsComp,
      valueTop: this.ext1in_maincomp.y + centerY2PinsComp
    });
    dirU === 0 ? (vsrc.directionU = 0) : (vsrc.directionU = 1);
    dirI === 0 ? (vsrc.directionI = 0) : (vsrc.directionI = 1);
    vsrc.valueU = valueIq * this.rComp.valueR;
    circuit.components.push(vsrc);
    circuit.createOneWire(
      vsrc,
      this.ext1in_pinID,
      this.ext1out_comp,
      this.ext1out_pinID
    );
    circuit.createOneWire(
      vsrc,
      this.ext1in_pinID_opposite,
      this.rComp,
      pinRtoHold
    );
  }
}
