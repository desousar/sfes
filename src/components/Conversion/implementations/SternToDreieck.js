import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import KlemmeJS from '../../jsFolder/constructorComponent/jsComponents/Klemme';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';

import { middle3Points } from '../util/mathFunction';
import { dropComp } from '../../jsFolder/dropComponent';

export default class SternToStern {
  constructor() {
    this.extremity1_comp = undefined;
    this.extremity2_comp = undefined;
    this.extremity3_comp = undefined;
    this.extremity1_pinID = undefined;
    this.extremity2_pinID = undefined;
    this.extremity3_pinID = undefined;
    this.errorInMiddle = false;
    this.inside1_pinID = undefined;
    this.inside2_pinID = undefined;
    this.inside3_pinID = undefined;
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
   * -isInStern()
   */
  isPossible(selectedComp_array, circuit) {
    console.log('---------SternToDreieck---------');
    let isAllSameInstance_bool = false;
    let isInStern_bool = false;
    isAllSameInstance_bool = this.is3SameInstance(selectedComp_array);
    if (!isAllSameInstance_bool) {
      return false;
    }
    isInStern_bool = this.isInStern(selectedComp_array, circuit);
    return isAllSameInstance_bool && isInStern_bool;
  }

  is3SameInstance(selectedComp_array) {
    if (selectedComp_array.length !== 3) {
      return false;
    } else {
      return selectedComp_array.every(comp => comp instanceof ResistorJS);
    }
  }

  isInStern(selectedComp_array, circuitOriginal) {
    let circuit = circuitOriginal.project();
    for (let c of selectedComp_array) {
      if (c.showPin1 && c.showPin2) {
        return false;
      }
      if (c.showPin1) {
        const kn = dropComp({
          c_id: 'Knoten',
          valueLeft: c.pins[0].x + 40,
          valueTop: c.pins[0].y + 40
        });
        circuit.components.push(kn);
        circuit.createOneWire(c, 0, kn, 0);
        if (c === selectedComp_array[1]) {
          this.extremity2_comp = c;
          this.extremity2_pinID = 0;
        }
        if (c === selectedComp_array[2]) {
          this.extremity3_comp = c;
          this.extremity3_pinID = 0;
        }
      }
      if (c.showPin2) {
        const kn = dropComp({
          c_id: 'Knoten',
          valueLeft: c.pins[0].x + 40,
          valueTop: c.pins[0].y + 40
        });
        circuit.components.push(kn);
        circuit.createOneWire(c, 1, kn, 0);
        if (c === selectedComp_array[1]) {
          this.extremity2_comp = c;
          this.extremity2_pinID = 1;
        }
        if (c === selectedComp_array[2]) {
          this.extremity3_comp = c;
          this.extremity3_pinID = 1;
        }
      }
    }
    let firstComp = selectedComp_array[0];
    console.log('firstComp', firstComp.symbol);
    let res1 = false;
    let res2 = false;
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (firstComp.uniqueID === fromComp.uniqueID) {
        this.errorInMiddle = false;
        const pinNb = circuit.pinIndexFromComponent(firstComp, w.from);
        console.log('find firstComp on fromComp, start pin', pinNb);
        const origin = { firstComp, pinNb };
        firstComp.flag = true;
        this.nextNeighbor(circuit, origin, w.from, w.to);
        if (
          !this.errorInMiddle &&
          selectedComp_array.every(c => c.flag === true)
        ) {
          res1 = true;
          console.log('res1', res1, 'startPoint', firstComp.symbol, pinNb);
          this.inside1_pinID = pinNb;
          this.fusionVisitedKnoten(circuit);
        } else {
          res1 = false;
          console.log('res1', res1, 'extremity is', toComp.symbol);
          this.extremity1_comp = toComp;
          this.extremity1_pinID = circuit.pinIndexFromComponent(toComp, w.to);
        }

        circuit.components.map(c => (c.visited = false));
        selectedComp_array.map(c => (c.flag = false));
      }
      if (firstComp.uniqueID === toComp.uniqueID) {
        this.errorInMiddle = false;
        const pinNb = circuit.pinIndexFromComponent(firstComp, w.to);
        console.log('find firstComp on toComp, start pin', pinNb);
        const origin = { firstComp, pinNb };
        firstComp.flag = true;
        this.nextNeighbor(circuit, origin, w.to, w.from);
        if (
          !this.errorInMiddle &&
          selectedComp_array.every(c => c.flag === true)
        ) {
          res2 = true;
          console.log('res2', res2, 'startPoint', firstComp.symbol, pinNb);
          this.inside1_pinID = pinNb;
          this.fusionVisitedKnoten(circuit);
        } else {
          res2 = false;
          console.log('res2', res2, 'extremity is', fromComp.symbol);
          this.extremity1_comp = fromComp;
          this.extremity1_pinID = circuit.pinIndexFromComponent(
            fromComp,
            w.from
          );
        }
        circuit.components.map(c => (c.visited = false));
        selectedComp_array.map(c => (c.flag = false));
      }
    }

    if (!res1 && !res2) {
      console.log('NOT OK By FIRST COMP TESTED');
      return false;
    }

    console.log(
      this.inside1_pinID,
      this.inside2_pinID,
      this.inside3_pinID,
      this.extremity1_comp.symbol,
      this.extremity1_pinID,
      this.extremity2_comp,
      this.extremity2_pinID,
      this.extremity3_comp,
      this.extremity3_pinID
    );
    //second comp pour trouver extremity2_comp
    if (!this.extremity2_comp) {
      //voisin de sel_arr[1] sur pin inverse inside2_pinID
      let targetPin;
      this.inside2_pinID === 0 ? (targetPin = 1) : (targetPin = 0);
      console.log('search on', targetPin);
      // forloop wire + pinIndexFromComponent(component, pin)
      for (let w of circuit.wires) {
        const fromComp = circuit.componentFromPin(w.from);
        const toComp = circuit.componentFromPin(w.to);
        if (fromComp.uniqueID === selectedComp_array[1].uniqueID) {
          const tempPinNb = circuit.pinIndexFromComponent(fromComp, w.from);
          if (tempPinNb === targetPin) {
            console.log('extremity', toComp.symbol);
            this.extremity2_comp = toComp;
            this.extremity2_pinID = 0;
          }
        }
        if (toComp.uniqueID === selectedComp_array[1].uniqueID) {
          const tempPinNb = circuit.pinIndexFromComponent(toComp, w.to);
          if (tempPinNb === targetPin) {
            console.log('extremity', fromComp.symbol);
            this.extremity2_comp = fromComp;
            this.extremity2_pinID = 0;
          }
        }
      }
    }
    //third comp pour trouver extremity3_comp
    if (!this.extremity3_comp) {
      //voisin de sel_arr[2] sur pin inverse inside3_pinID
      let targetPin;
      this.inside3_pinID === 0 ? (targetPin = 1) : (targetPin = 0);
      console.log('search on', targetPin);
      // forloop wire + pinIndexFromComponent(component, pin)
      for (let w of circuit.wires) {
        const fromComp = circuit.componentFromPin(w.from);
        const toComp = circuit.componentFromPin(w.to);
        if (fromComp.uniqueID === selectedComp_array[2].uniqueID) {
          const tempPinNb = circuit.pinIndexFromComponent(fromComp, w.from);
          if (tempPinNb === targetPin) {
            console.log('extremity', toComp.symbol);
            this.extremity3_comp = toComp;
            this.extremity3_pinID = 0;
          }
        }
        if (toComp.uniqueID === selectedComp_array[2].uniqueID) {
          const tempPinNb = circuit.pinIndexFromComponent(toComp, w.to);
          if (tempPinNb === targetPin) {
            console.log('extremity', fromComp.symbol);
            this.extremity3_comp = fromComp;
            this.extremity3_pinID = 0;
          }
        }
      }
    }

    console.log(
      this.inside1_pinID,
      this.inside2_pinID,
      this.inside3_pinID,
      this.extremity1_comp.symbol,
      this.extremity1_pinID,
      this.extremity2_comp.symbol,
      this.extremity2_pinID,
      this.extremity3_comp.symbol,
      this.extremity3_pinID
    );

    console.log('END SUCCESSFUL TEST isPossible');
    return true;
  }

  isClassicKnoten(comp) {
    return comp instanceof KnotenJS && comp.valuePotentialSource === undefined;
  }

  nextNeighbor(circuit, origin, parentPin, compPin) {
    const comp = circuit.componentFromPin(compPin);
    console.log(comp.symbol, 'is under test');
    if (this.isClassicKnoten(comp)) {
      console.log('comp is ClassicKnoten and visited', comp.symbol);
      comp.visited = true;
      this.getNextCompWith(circuit, origin, parentPin, compPin);
    } else if (comp.selected) {
      console.log('SELECTED COMP', origin);
      if (origin.firstComp.uniqueID === comp.uniqueID) {
        console.log('LOOP Not Allowed');
        this.errorInMiddle = true;
      } else {
        console.log('find an other R', comp.symbol);
        const whichPin = circuit.pinIndexFromComponent(comp, compPin);
        console.log('*/*/*/extremity inside', whichPin);
        comp.flag = true;
        const selected_array = circuit.getSelectedComponents();
        if (comp.uniqueID === selected_array[1].uniqueID) {
          this.inside2_pinID = whichPin;
        }
        if (comp.uniqueID === selected_array[2].uniqueID) {
          this.inside3_pinID = whichPin;
        }
      }
    } else {
      console.log('comp inside middle Not Allowed', comp.symbol);
      this.errorInMiddle = true;
    }
  }

  getNextCompWith(circuit, origin, parentPin, compPin) {
    const parent = circuit.componentFromPin(parentPin);
    const comp = circuit.componentFromPin(compPin);
    if (!this.errorInMiddle) {
      console.log('##getNextCompWith##', comp.symbol);
      for (let wire of circuit.wires) {
        const compFrom = circuit.componentFromPin(wire.from);
        const compTo = circuit.componentFromPin(wire.to);
        if (comp.uniqueID === compFrom.uniqueID) {
          console.log('ENTER 10:', compTo.symbol);
          if (compTo !== parent && compTo.visited !== true) {
            this.nextNeighbor(circuit, origin, wire.from, wire.to);
          }
        } else if (comp.uniqueID === compTo.uniqueID) {
          console.log('ENTER 20:', compFrom.symbol);
          if (compFrom !== parent && compFrom.visited !== true) {
            this.nextNeighbor(circuit, origin, wire.to, wire.from);
          }
        }
      }
    } else {
      console.log('this.errorInMiddle');
    }
  }
  fusionVisitedKnoten(circuit) {
    console.log('###FUSION###');
    // for fusion keep One, transfer only connection (circuit.wires) to One and delete other
    let keepAlive = undefined;
    let localKnoten = [];
    for (let c of circuit.components) {
      if (c.visited && keepAlive === undefined) {
        keepAlive = c;
      } else if (c.visited) {
        localKnoten.push(c);
      }
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

  //-------------------------
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
