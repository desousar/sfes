import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';
import WireJS from '../../jsFolder/constructorComponent/Wire.js';

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
    if (selectedComp_array.length < 2) {
      return false;
    } else {
      try {
        selectedComp_array.forEach(comp => {
          comp.assertMainValue();
        });
        isAllSameInstance_bool = this.isAllSameInstance(selectedComp_array);
        isInSerie_bool = this.isInSerie(onReal, selectedComp_array, circuit);
      } catch (e) {
        alert(e.message);
      }
    }
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
      if (firstComp === fromComp) {
        console.log('find', firstComp.symbol, 'on fromComp');
        this.nextNeighbor(circuit, fromComp, toComp);
      }
      if (firstComp === toComp) {
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
        if (origin === compFrom && comp === compTo) {
          pinID = circuit.pinIndexFromComponent(comp, wire.to);
        } else if (origin === compTo && comp === compFrom) {
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

    circuit.getSelectedComponents().forEach(component => {
      circuit.deleteOneComponent(component);
    });

    let newR = new ResistorJS({
      symbol: selectedComp_array[0].symbol + 'SUM',
      valueLeft: selectedComp_array[0].x,
      valueTop: selectedComp_array[0].y,
      pins: [
        {
          x: selectedComp_array[0].pins[0].x,
          y: selectedComp_array[0].pins[0].y
        },
        {
          x: selectedComp_array[0].pins[1].x,
          y: selectedComp_array[0].pins[1].y
        }
      ]
    });
    newR.valueR = sumR;
    newR.showSymbol = true;
    newR.rotation = selectedComp_array[0].rotation;
    circuit.components.push(newR);

    if (this.circuitAsLoop) {
      let kn = dropComp({
        c_id: 'Knoten',
        valueLeft: selectedComp_array[1].x,
        valueTop: selectedComp_array[1].y
      });
      circuit.components.push(kn);
      this.create1Wire(circuit, newR, 0, kn, 0);
      this.create1Wire(circuit, newR, 1, kn, 0);
    }
    // check coord x and y for graphical attribution
    else if (
      this.extremity1_comp !== undefined &&
      this.extremity2_comp !== undefined
    ) {
      const pin0 = distanceBtw2Points(
        this.extremity1_comp.pins[this.extremity1_pinID],
        newR.pins[0]
      );
      const pin1 = distanceBtw2Points(
        this.extremity1_comp.pins[this.extremity1_pinID],
        newR.pins[1]
      );
      if (pin0 <= pin1) {
        //connect extremity1_comp with pin0 and extremity2_comp with pin1
        this.create1Wire(
          circuit,
          this.extremity1_comp,
          this.extremity1_pinID,
          newR,
          0
        );
        this.create1Wire(
          circuit,
          this.extremity2_comp,
          this.extremity2_pinID,
          newR,
          1
        );
      } else {
        //connect extremity1_comp with pin1 and extremity2_comp with pin0
        this.create1Wire(
          circuit,
          this.extremity1_comp,
          this.extremity1_pinID,
          newR,
          1
        );
        this.create1Wire(
          circuit,
          this.extremity2_comp,
          this.extremity2_pinID,
          newR,
          0
        );
      }
    } else {
      if (this.extremity1_comp !== undefined) {
        const pin0 = distanceBtw2Points(
          this.extremity1_comp.pins[this.extremity1_pinID],
          newR.pins[0]
        );
        const pin1 = distanceBtw2Points(
          this.extremity1_comp.pins[this.extremity1_pinID],
          newR.pins[1]
        );
        if (pin0 <= pin1) {
          //connect extremity1_comp with pin0
          this.create1Wire(
            circuit,
            this.extremity1_comp,
            this.extremity1_pinID,
            newR,
            0
          );
        } else {
          //connect extremity1_comp with pin1
          this.create1Wire(
            circuit,
            this.extremity1_comp,
            this.extremity1_pinID,
            newR,
            1
          );
        }
      }
      if (this.extremity2_comp !== undefined) {
        const pin0 = distanceBtw2Points(
          this.extremity2_comp.pins[this.extremity2_pinID],
          newR.pins[0]
        );
        const pin1 = distanceBtw2Points(
          this.extremity2_comp.pins[this.extremity2_pinID],
          newR.pins[1]
        );
        if (pin0 <= pin1) {
          //connect extremity2_comp with pin0
          this.create1Wire(
            circuit,
            this.extremity2_comp,
            this.extremity2_pinID,
            newR,
            0
          );
        } else {
          //connect extremity2_comp with pin1
          this.create1Wire(
            circuit,
            this.extremity2_comp,
            this.extremity2_pinID,
            newR,
            1
          );
        }
      }
    }
  }

  create1Wire(circuit, extremity, extPinId, newR, newRPinId) {
    const wire = new WireJS({
      from: extremity.pins[extPinId],
      to: newR.pins[newRPinId]
    });
    if (extremity.isMultiPin === false) {
      if (extPinId === 0) {
        extremity.showPin1 = false;
      } else if (extPinId === 1) {
        extremity.showPin2 = false;
      }
    }
    if (newRPinId === 0) {
      newR.showPin1 = false;
    } else if (newRPinId === 1) {
      newR.showPin2 = false;
    }
    circuit.wires.push(wire);
  }
}
