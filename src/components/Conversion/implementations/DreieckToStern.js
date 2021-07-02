import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import KlemmeJS from '../../jsFolder/constructorComponent/jsComponents/Klemme';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';

import { middle3Points } from '../util/mathFunction';
// eslint-disable-next-line no-unused-vars
import { dropComp } from '../../jsFolder/dropComponent';

export default class MultipleRinSerie {
  constructor() {
    this.extremity1_comp = undefined;
    this.extremity2_comp = undefined;
    this.extremity3_comp = undefined;
    this.extremity1_pinID = undefined;
    this.extremity2_pinID = undefined;
    this.extremity3_pinID = undefined;
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
   * -is3SameInstance()
   * -isInDreieck()
   */
  isPossible(selectedComp_array, circuit) {
    console.log('---------DreieckToStern---------');
    let isAllSameInstance_bool = false;
    let isInSerie_bool = false;
    isAllSameInstance_bool = this.is3SameInstance(selectedComp_array);
    if (!isAllSameInstance_bool) {
      return false;
    }
    isInSerie_bool = this.isInDreieck(selectedComp_array, circuit);
    return isAllSameInstance_bool && isInSerie_bool;
  }

  is3SameInstance(selectedComp_array) {
    if (selectedComp_array.length !== 3) {
      return false;
    } else {
      return selectedComp_array.every(comp => comp instanceof ResistorJS);
    }
  }

  isInDreieck(selectedComp_array, circuitOriginal) {
    let circuit = circuitOriginal;
    let bool_data1 = this.is2MultiPinNeighbors(circuit);
    if (!bool_data1) {
      return false;
    }

    for (let sComp of selectedComp_array) {
      console.log('---START---', sComp.symbol);
      for (let pin of sComp.pins) {
        console.log('---PIN---');
        sComp.isConnected = false;
        sComp.hasTooMuchNeighbor = false;
        const localKnoten = [];
        circuit.wires.forEach(w => {
          const fromComp = circuit.componentFromPin(w.from);
          const toComp = circuit.componentFromPin(w.to);
          if (pin === w.from) {
            console.log('find', sComp.symbol, 'on fromComp');
            fromComp.step = 0;
            this.nextNeighbor(circuit, fromComp, fromComp, toComp, localKnoten);
          }
          if (pin === w.to) {
            console.log('find', sComp.symbol, 'on toComp');
            toComp.step = 0;
            this.nextNeighbor(circuit, toComp, toComp, fromComp, localKnoten);
          }
        });
        circuit.components.map(comp => (comp.visited = false));
        circuit.components.map(c => (c.step = -1));
        if (!sComp.isConnected) {
          console.log('DONT HAVE NEIGHBOR');
          return false;
        }
        if (sComp.hasTooMuchNeighbor) {
          console.log('TOO MUCH NEIGHBOR');
          return false;
        }

        const res = this.checkLocalKnoten(localKnoten);
        if (!res) {
          return false;
        }
      }
    }
    console.log('END SUCCESSFUL TEST');
    return true;
  }

  checkLocalKnoten(localKnoten) {
    //in localKnoten max 1 Klemme or 1 Knoten with potential value
    let specificMultiPin = 0;
    console.log('localKnoten', localKnoten);
    localKnoten.forEach(lk => {
      if (
        lk instanceof KlemmeJS ||
        (lk instanceof KnotenJS && lk.valuePotentialSource !== undefined)
      ) {
        specificMultiPin += 1;
      }
    });
    if (specificMultiPin > 1) {
      console.log('too much specificMultiPin');
      return false;
    } else {
      return true;
    }
  }

  is2MultiPinNeighbors(circuit) {
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
    for (let comp of selArray) {
      if (comp.find.length !== 2 || comp.find[0] === comp.find[1]) {
        console.log('Problem With Connection', comp.symbol);
        comp.find = undefined;
        return false;
      }
      comp.find = undefined;
    }
    return true;
  }

  getNextCompWith(circuit, origin, comp, localKnoten) {
    console.log('##NEXT STEP##', comp.step);
    for (let wire of circuit.wires) {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (comp.uniqueID === compFrom.uniqueID) {
        console.log('ENTER 10:', compTo.symbol, 'step', comp.step);
        if (compTo !== origin && compTo.visited !== true) {
          this.nextNeighbor(circuit, origin, compFrom, compTo, localKnoten);
        }
      } else if (comp.uniqueID === compTo.uniqueID) {
        console.log('ENTER 20:', compFrom.symbol, 'step', comp.step);
        if (compFrom !== origin && compFrom.visited !== true) {
          this.nextNeighbor(circuit, origin, compTo, compFrom, localKnoten);
        }
      }
    }
  }

  nextNeighbor(circuit, origin, parent, comp, localKnoten) {
    console.log(comp.symbol, 'is under test');
    if (comp.isMultiPin) {
      console.log('comp isMultiPin and visited', comp.symbol);
      comp.visited = true;
      comp.step = parent.step + 1;
      console.log('NEW BRANCH', comp.step);
      localKnoten.push(comp);
      if (this.checkLocalKnoten(localKnoten)) {
        this.getNextCompWith(circuit, origin, comp, localKnoten);
      } else {
        console.log('***STOP***pop');
        for (let i = localKnoten.length - 1; i >= 0; i--) {
          console.log(localKnoten[i].symbol);
          if (
            circuit.getCountConnection(localKnoten[i]) === 1 ||
            circuit.getCountConnection(localKnoten[i]) === 2
          ) {
            localKnoten.splice(i, 1);
          }
        }
        console.log('OK');
        console.log(localKnoten);
      }
    } else if (comp.selected) {
      if (origin.isConnected) {
        console.log('HAVE ALREADY A NEIGHBOR');
        origin.hasTooMuchNeighbor = true;
      } else {
        origin.isConnected = true;
        console.log('comp.selected', comp.symbol, 'start:', origin.symbol);
      }
    }
  }

  conversion(selectedComp_array, circuit) {
    //Knoten fusion before all to simplify circuits part
    for (let comp of selectedComp_array) {
      for (let w of circuit.wires) {
        const fromComp = circuit.componentFromPin(w.from);
        const toComp = circuit.componentFromPin(w.to);
        if (comp.uniqueID === fromComp.uniqueID) {
          // check "path" based on 1st pin
          const result = this.fusionNeighborsKnoten(circuit, fromComp, toComp);
          if (!result) {
            return false;
          }
        }
        if (comp.uniqueID === toComp.uniqueID) {
          // check "path" based on 2nd pin
          const result = this.fusionNeighborsKnoten(circuit, toComp, fromComp);
          if (!result) {
            return false;
          }
        }
      }
    }
    //add centered Knoten
    let [x, y] = middle3Points(
      selectedComp_array[0],
      selectedComp_array[1],
      selectedComp_array[2]
    );

    let kn = dropComp({
      c_id: 'Knoten',
      valueLeft: x,
      valueTop: y
    });
    circuit.components.push(kn);
    //detach one Wire from each extremity
    let compA = selectedComp_array[0];
    console.log(compA.symbol);
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (compA.uniqueID === fromComp.uniqueID) {
        console.log('0a', toComp.symbol);
        this.extremity1_comp === undefined
          ? (this.extremity1_comp = toComp)
          : (this.extremity2_comp = toComp);
      }
      if (compA.uniqueID === toComp.uniqueID) {
        console.log('1a', fromComp.symbol);
        this.extremity1_comp === undefined
          ? (this.extremity1_comp = fromComp)
          : (this.extremity2_comp = fromComp);
      }
    }
    console.log(
      'ext',
      this.extremity1_comp.symbol,
      this.extremity2_comp.symbol
    );
    let compB = selectedComp_array[1];
    console.log(compB.symbol);
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (compB.uniqueID === fromComp.uniqueID) {
        console.log('0b', toComp.symbol);
        if (
          toComp.uniqueID !== this.extremity1_comp.uniqueID &&
          toComp.uniqueID !== this.extremity2_comp.uniqueID
        ) {
          console.log('3');
          this.extremity3_comp = toComp;
        }
      }
      if (compB.uniqueID === toComp.uniqueID) {
        console.log('1b', fromComp.symbol);
        if (
          fromComp.uniqueID !== this.extremity1_comp.uniqueID &&
          fromComp.uniqueID !== this.extremity2_comp.uniqueID
        ) {
          console.log('3');
          this.extremity3_comp = fromComp;
        }
      }
    }

    console.log(
      this.extremity1_comp.symbol,
      this.extremity2_comp.symbol,
      this.extremity3_comp.symbol
    );

    let divisor = 0;
    selectedComp_array.forEach(c => {
      divisor += c.valueR;
    });
    console.log('divisor', divisor);

    console.log('ON', this.extremity1_comp.symbol);
    this.extremity1_comp.ngbValueR = [];
    var ext1_comp = undefined;
    var keepOne = 0;
    for (let i = 0; i < circuit.wires.length; i++) {
      let w = circuit.wires[i];
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (
        this.extremity1_comp.uniqueID === fromComp.uniqueID &&
        toComp.selected
      ) {
        console.log('add', toComp.valueR);
        const val = toComp.valueR;
        this.extremity1_comp.ngbValueR.push(val);
        keepOne += 1;
        if (keepOne === 1) {
          toComp.checked = true;
          ext1_comp = toComp;
          console.log(toComp.symbol, 'is Checked');
        } else {
          circuit.deleteOneWire(w, i);
        }
      }
      if (
        this.extremity1_comp.uniqueID === toComp.uniqueID &&
        fromComp.selected
      ) {
        const val = fromComp.valueR;
        this.extremity1_comp.ngbValueR.push(val);
        keepOne += 1;
        if (keepOne === 1) {
          fromComp.checked = true;
          ext1_comp = fromComp;
          console.log(fromComp.symbol, 'is Checked');
        } else {
          circuit.deleteOneWire(w, i);
        }
      }
    }
    if (this.extremity1_comp.ngbValueR.length === 2) {
      console.log(
        '*data*',
        this.extremity1_comp.ngbValueR[0],
        this.extremity1_comp.ngbValueR[1],
        divisor
      );
      let dividend_ext1 =
        this.extremity1_comp.ngbValueR[0] * this.extremity1_comp.ngbValueR[1];
      var firstValueR = dividend_ext1 / divisor;
    }

    console.log('ON', this.extremity2_comp.symbol);
    this.extremity2_comp.ngbValueR = [];
    var ext2_comp = undefined;
    for (let i = 0; i < circuit.wires.length; i++) {
      let w = circuit.wires[i];
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (
        this.extremity2_comp.uniqueID === fromComp.uniqueID &&
        toComp.selected
      ) {
        console.log('find1', toComp.symbol);
        const val = toComp.valueR;
        this.extremity2_comp.ngbValueR.push(val);
        if (toComp.checked) {
          circuit.deleteOneWire(w, i);
        } else {
          toComp.checked = true;
          ext2_comp = toComp;
        }
      }
      if (
        this.extremity2_comp.uniqueID === toComp.uniqueID &&
        fromComp.selected
      ) {
        console.log('find1', fromComp.symbol);
        const val = fromComp.valueR;
        this.extremity2_comp.ngbValueR.push(val);
        if (fromComp.checked) {
          circuit.deleteOneWire(w, i);
        } else {
          fromComp.checked = true;
          ext2_comp = fromComp;
        }
      }
    }
    if (this.extremity1_comp.ngbValueR.length === 2) {
      console.log(
        '*data*',
        this.extremity2_comp.ngbValueR[0],
        this.extremity2_comp.ngbValueR[1],
        divisor
      );
      let dividend_ext2 =
        this.extremity2_comp.ngbValueR[0] * this.extremity2_comp.ngbValueR[1];
      var secondValueR = dividend_ext2 / divisor;
    }

    console.log('ON', this.extremity3_comp.symbol);
    this.extremity3_comp.ngbValueR = [];
    var ext3_comp = undefined;
    for (let i = 0; i < circuit.wires.length; i++) {
      let w = circuit.wires[i];
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (
        this.extremity3_comp.uniqueID === fromComp.uniqueID &&
        toComp.selected
      ) {
        const val = toComp.valueR;
        console.log('push', toComp, toComp.valueR);
        this.extremity3_comp.ngbValueR.push(val);
        if (toComp.checked) {
          circuit.deleteOneWire(w, i);
        } else {
          ext3_comp = toComp;
        }
      }
      if (
        this.extremity3_comp.uniqueID === toComp.uniqueID &&
        fromComp.selected
      ) {
        const val = fromComp.valueR;
        console.log('push', fromComp, fromComp.valueR);
        this.extremity3_comp.ngbValueR.push(val);
        if (fromComp.checked) {
          circuit.deleteOneWire(w, i);
        } else {
          ext3_comp = fromComp;
        }
      }
    }
    if (this.extremity1_comp.ngbValueR.length === 2) {
      console.log(
        '*data*',
        this.extremity3_comp.ngbValueR[0],
        this.extremity3_comp.ngbValueR[1],
        divisor
      );
      let dividend_ext3 =
        this.extremity3_comp.ngbValueR[0] * this.extremity3_comp.ngbValueR[1];
      var thirdValueR = dividend_ext3 / divisor;
    }

    ext1_comp.valueR = firstValueR;
    ext2_comp.valueR = secondValueR;
    ext3_comp.valueR = thirdValueR;

    selectedComp_array.forEach(c => {
      if (c.showPin1) {
        circuit.createOneWire(c, 0, kn, 0);
      }
      if (c.showPin2) {
        circuit.createOneWire(c, 1, kn, 0);
      }
    });
    circuit.components.map(c => (c.checked = false));
  }

  fusionNeighborsKnoten(circuit, origin, destination) {
    let localKnoten = [];
    console.log('find', origin.symbol, destination.isMultiPin);
    this.nextNeighbor(circuit, origin, origin, destination, localKnoten);

    circuit.components.map(comp => (comp.visited = false));
    // for fusion keep One, transfer only connection (circuit.wires) to One and delete other
    console.log('GO LK');
    let keepAlive;
    console.log(localKnoten);
    localKnoten.forEach((lk, index) => {
      if (
        lk instanceof KlemmeJS ||
        (lk instanceof KnotenJS && lk.valuePotentialSource !== undefined)
      ) {
        console.log('find keepAlive');
        [keepAlive] = localKnoten.splice(index, 1);
      }
    });
    if (keepAlive === undefined) {
      [keepAlive] = localKnoten.splice(0, 1);
    }
    console.log('keepAlive', keepAlive.symbol);
    localKnoten.forEach(lk => {
      for (let i = 0; i < circuit.wires.length; i++) {
        let wire = circuit.wires[i];
        const compFrom = circuit.componentFromPin(wire.from);
        const compTo = circuit.componentFromPin(wire.to);
        if (lk.uniqueID === compFrom.uniqueID) {
          if (compTo.uniqueID !== keepAlive.uniqueID) {
            wire.from = keepAlive.pins[0];
          }
        }
        if (lk.uniqueID === compTo.uniqueID) {
          if (compFrom.uniqueID !== keepAlive.uniqueID) {
            wire.to = keepAlive.pins[0];
          }
        }
      }
    });
    // Delete Other
    localKnoten.forEach(lk => {
      circuit.deleteOneComponent(lk);
    });
    return true;
  }
}
