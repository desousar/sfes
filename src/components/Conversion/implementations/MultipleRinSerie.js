import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';

import { distanceBtw2Points } from '../util/mathFunction';
import { dropComp } from '../../jsFolder/dropComponent';

export default class MultipleRinSerie {
  constructor() {
    this.extremity1_comp = undefined;
    this.extremity2_comp = undefined;
    this.extremity1_pinID = undefined;
    this.extremity2_pinID = undefined;
    this.circuitAsLoop = false;
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
   * -isAllSameInstance()
   * -isInSerie()
   */
  isPossible(onReal, selectedComp_array, circuit) {
    console.log('---------Serie---------');
    let isAllSameInstance_bool = false;
    let isInSerie_bool = false;
    isAllSameInstance_bool = this.isAllSameInstance(selectedComp_array);
    if (!isAllSameInstance_bool) {
      return false;
    }
    isInSerie_bool = this.isInSerie(onReal, selectedComp_array, circuit);
    return isAllSameInstance_bool && isInSerie_bool;
  }

  isAllSameInstance(selectedComp_array) {
    return selectedComp_array.every(comp => comp instanceof ResistorJS);
  }

  isInSerie(onReal, selectedComp_array, circuit) {
    this.extremity1_comp = undefined;
    this.extremity2_comp = undefined;
    circuit.components.map(comp => (comp.flagConversion = false));
    let firstComp = selectedComp_array[0];
    firstComp.flagConversion = true;
    console.log(firstComp.symbol, 'fflagConversion = true');
    circuit.wires.forEach(w => {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (firstComp.uniqueID === fromComp.uniqueID) {
        console.log('find', firstComp.symbol, 'on fromComp');
        this.nextNeighbor(circuit, fromComp, toComp);
      }
      if (firstComp.uniqueID === toComp.uniqueID) {
        console.log('find', firstComp.symbol, 'on toComp');
        this.nextNeighbor(circuit, toComp, fromComp);
      }
    });
    const result = selectedComp_array.every(
      comp => comp.flagConversion === true
    );
    circuit.components.map(comp => (comp.flagConversion = false));
    if (!onReal) {
      circuit.components.map(comp => (comp.visited = false));
    }
    console.log('extremity', this.extremity1_comp, this.extremity2_comp);
    return result;
  }

  getNextCompWith(circuit, comp) {
    for (let wire of circuit.wires) {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (comp.uniqueID === compFrom.uniqueID) {
        console.log('ENTER 10:', compTo.symbol);
        if (compTo.flagConversion !== true) {
          this.nextNeighbor(circuit, compFrom, compTo);
        }
      } else if (comp.uniqueID === compTo.uniqueID) {
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
      this.circuitAsLoop = true;
      return;
    } else if (
      comp.selected ||
      (comp instanceof KnotenJS &&
        circuit.getCountConnection(comp) === 2 &&
        comp.valuePotentialSource === undefined)
    ) {
      comp.flagConversion = true;
      console.log(comp.symbol, 'flagConversion = true');
      if (comp instanceof KnotenJS) {
        console.log('comp is Knoteand visited', comp.symbol);
        comp.visited = true;
      }
      this.getNextCompWith(circuit, comp);
    } else {
      var pinID = undefined;
      for (let wire of circuit.wires) {
        const compFrom = circuit.componentFromPin(wire.from);
        const compTo = circuit.componentFromPin(wire.to);
        if (
          origin.uniqueID === compFrom.uniqueID &&
          comp.uniqueID === compTo.uniqueID
        ) {
          pinID = circuit.pinIndexFromComponent(comp, wire.to);
        } else if (
          origin.uniqueID === compTo.uniqueID &&
          comp.uniqueID === compFrom.uniqueID
        ) {
          pinID = circuit.pinIndexFromComponent(comp, wire.from);
        }
      }

      this.extremity1_comp === undefined
        ? (this.extremity1_comp = comp)
        : (this.extremity2_comp = comp);
      this.extremity1_pinID === undefined
        ? (this.extremity1_pinID = pinID)
        : (this.extremity2_pinID = pinID);
    }
  }

  /**
   * delete old components (R)
   * add new component (R)
   */
  conversion(selectedComp_array, circuit) {
    var sumR = 0;
    selectedComp_array.forEach(comp => {
      sumR += comp.valueR;
    });

    for (var i = circuit.components.length - 1; i >= 0; i--) {
      let kn = circuit.components[i];
      if (kn.visited) {
        console.log(kn.symbol);
        circuit.deleteOneComponent(kn);
      }
    }

    let [keepRAlive] = selectedComp_array.splice(0, 1);
    selectedComp_array.forEach(component => {
      circuit.deleteOneComponent(component);
    });
    circuit.wires.forEach((wire, index) => {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (
        keepRAlive.uniqueID === compFrom.uniqueID ||
        keepRAlive.uniqueID === compTo.uniqueID
      ) {
        circuit.deleteOneWire(wire, index);
      }
    });
    keepRAlive.valueR = sumR;
    keepRAlive.showSymbol = true;
    keepRAlive.selected = false;

    if (this.circuitAsLoop) {
      let kn = dropComp({
        c_id: 'Knoten',
        valueLeft: selectedComp_array[0].x,
        valueTop: selectedComp_array[0].y
      });
      circuit.components.push(kn);
      circuit.createOneWire(keepRAlive, 0, kn, 0);
      circuit.createOneWire(keepRAlive, 1, kn, 0);
    }
    // check coord x and y for graphical attribution
    else if (
      this.extremity1_comp !== undefined &&
      this.extremity2_comp !== undefined
    ) {
      const pin0 = distanceBtw2Points(
        this.extremity1_comp.pins[this.extremity1_pinID],
        keepRAlive.pins[0]
      );
      const pin1 = distanceBtw2Points(
        this.extremity1_comp.pins[this.extremity1_pinID],
        keepRAlive.pins[1]
      );
      if (pin0 <= pin1) {
        //connect extremity1_comp with pin0 and extremity2_comp with pin1
        circuit.createOneWire(
          this.extremity1_comp,
          this.extremity1_pinID,
          keepRAlive,
          0
        );
        circuit.createOneWire(
          this.extremity2_comp,
          this.extremity2_pinID,
          keepRAlive,
          1
        );
      } else {
        //connect extremity1_comp with pin1 and extremity2_comp with pin0
        circuit.createOneWire(
          this.extremity1_comp,
          this.extremity1_pinID,
          keepRAlive,
          1
        );
        circuit.createOneWire(
          this.extremity2_comp,
          this.extremity2_pinID,
          keepRAlive,
          0
        );
      }
    } else {
      if (this.extremity1_comp !== undefined) {
        const pin0 = distanceBtw2Points(
          this.extremity1_comp.pins[this.extremity1_pinID],
          keepRAlive.pins[0]
        );
        const pin1 = distanceBtw2Points(
          this.extremity1_comp.pins[this.extremity1_pinID],
          keepRAlive.pins[1]
        );
        if (pin0 <= pin1) {
          //connect extremity1_comp with pin0
          circuit.createOneWire(
            this.extremity1_comp,
            this.extremity1_pinID,
            keepRAlive,
            0
          );
        } else {
          //connect extremity1_comp with pin1
          circuit.createOneWire(
            this.extremity1_comp,
            this.extremity1_pinID,
            keepRAlive,
            1
          );
        }
      }
      if (this.extremity2_comp !== undefined) {
        const pin0 = distanceBtw2Points(
          this.extremity2_comp.pins[this.extremity2_pinID],
          keepRAlive.pins[0]
        );
        const pin1 = distanceBtw2Points(
          this.extremity2_comp.pins[this.extremity2_pinID],
          keepRAlive.pins[1]
        );
        if (pin0 <= pin1) {
          //connect extremity2_comp with pin0
          circuit.createOneWire(
            this.extremity2_comp,
            this.extremity2_pinID,
            keepRAlive,
            0
          );
        } else {
          //connect extremity2_comp with pin1
          circuit.createOneWire(
            this.extremity2_comp,
            this.extremity2_pinID,
            keepRAlive,
            1
          );
        }
      }
    }
  }
}
