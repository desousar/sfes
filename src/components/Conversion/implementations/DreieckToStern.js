import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import KlemmeJS from '../../jsFolder/constructorComponent/jsComponents/Klemme';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';

import { middle3Points } from '../util/mathFunction';
import { dropComp } from '../../jsFolder/dropComponent';

export default class DreieckToStern {
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
    let isInDreieck_bool = false;
    isAllSameInstance_bool = this.is3SameInstance(selectedComp_array);
    if (!isAllSameInstance_bool) {
      return false;
    }
    isInDreieck_bool = this.isInDreieck(selectedComp_array, circuit);
    return isAllSameInstance_bool && isInDreieck_bool;
  }

  is3SameInstance(selectedComp_array) {
    if (selectedComp_array.length !== 3) {
      return false;
    } else {
      return selectedComp_array.every(comp => comp instanceof ResistorJS);
    }
  }

  isInDreieck(selectedComp_array, circuit) {
    let bool_data1 = this.is2MultiPinNeighbors(circuit);
    if (!bool_data1) {
      return false;
    }

    for (let sComp of selectedComp_array) {
      console.log('---START---', sComp.symbol);
      for (let pin of sComp.pins) {
        console.log('---PIN---');
        sComp.onPath = true;
        sComp.visited = true;
        sComp.isConnected = false;
        sComp.hasTooMuchNeighbor = false;
        let localKnoten = [];
        circuit.wires.forEach(w => {
          const fromComp = circuit.componentFromPin(w.from);
          const toComp = circuit.componentFromPin(w.to);
          if (pin === w.from) {
            console.log('find', sComp.symbol, 'on fromComp');

            toComp.onPath = true;
            this.nextNeighbor(circuit, fromComp, fromComp, toComp, localKnoten);
            console.log('a', localKnoten);
            sComp.isConnected = false;
            sComp.hasTooMuchNeighbor = false;
            localKnoten = [];
            circuit.components.map(comp => (comp.visited = false));
            sComp.visited = true;
            toComp.onPath = true;
            this.nextNeighbor(circuit, fromComp, fromComp, toComp, localKnoten);
            console.log('a2', localKnoten);
          }
          if (pin === w.to) {
            console.log('find', sComp.symbol, 'on toComp');

            fromComp.onPath = true;
            this.nextNeighbor(circuit, toComp, toComp, fromComp, localKnoten);
            console.log('b', localKnoten);
            sComp.isConnected = false;
            sComp.hasTooMuchNeighbor = false;
            localKnoten = [];
            circuit.components.map(comp => (comp.visited = false));
            sComp.visited = true;
            fromComp.onPath = true;
            this.nextNeighbor(circuit, toComp, toComp, fromComp, localKnoten);
            console.log('b2', localKnoten);
          }
        });
        circuit.components.map(comp => (comp.visited = false));
        circuit.components.map(comp => (comp.onPath = undefined));

        if (!sComp.isConnected) {
          sComp.isConnected = false;
          console.log('DONT HAVE NEIGHBOR');
          return false;
        }
        sComp.isConnected = false;

        if (sComp.hasTooMuchNeighbor) {
          sComp.hasTooMuchNeighbor = false;
          console.log('TOO MUCH NEIGHBOR');
          return false;
        }
        sComp.hasTooMuchNeighbor = false;

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
    console.log('##NEXT STEP##');
    for (let wire of circuit.wires) {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (comp.uniqueID === compFrom.uniqueID && comp.onPath !== false) {
        console.log('ENTER 10:', compTo.symbol);
        if (
          compTo !== origin &&
          compTo.visited === false &&
          compTo.onPath !== false
        ) {
          this.nextNeighbor(circuit, origin, compFrom, compTo, localKnoten);
        }
      } else if (comp.uniqueID === compTo.uniqueID && comp.onPath !== false) {
        console.log('ENTER 20:', compFrom.symbol);
        if (
          compFrom !== origin &&
          compFrom.visited === false &&
          compFrom.onPath !== false
        ) {
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
      localKnoten.push(comp);
      if (this.checkLocalKnoten(localKnoten)) {
        console.log('***OK***');
        comp.onPath = true;
        this.getNextCompWith(circuit, origin, comp, localKnoten);
      } else {
        console.log('***STOP impasse***');
        comp.onPath = undefined;
        localKnoten.pop();
        console.log('1pop', localKnoten);
        for (let i = localKnoten.length - 1; i >= 0; i--) {
          console.log(localKnoten[i].symbol);
          if (
            (circuit.getCountConnection(localKnoten[i]) === 1 ||
              circuit.getCountConnection(localKnoten[i]) === 2) &&
            i !== 0
          ) {
            console.log(localKnoten[i].symbol, 'to delete');
            localKnoten[i].onPath = false;
            localKnoten.splice(i, 1);
          } else {
            break;
          }
        }
        if (
          !this.isOnPath(
            circuit,
            localKnoten[localKnoten.length - 1],
            localKnoten
          )
        ) {
          localKnoten.pop();
          console.log('2pop', localKnoten);
          console.log(parent.symbol, 'is not onPath');
          parent.onPath = false;
        }

        console.log('OK');
        console.log(localKnoten);
      }
    } else if (comp.selected && comp.uniqueID !== origin.uniqueID) {
      if (origin.isConnected) {
        console.log('HAVE ALREADY A NEIGHBOR');
        origin.hasTooMuchNeighbor = true;
      } else {
        parent.onPath = true;
        origin.isConnected = true;
        console.log('comp.selected', comp.symbol, 'start:', origin.symbol);
      }
    }
  }

  isOnPath(circuit, parent, localKnoten) {
    console.log('isOnPath');
    if (parent.uniqueID === localKnoten[0].uniqueID) {
      console.log('first comp always on path');
      return true;
    }
    let count = 0;
    for (let wire of circuit.wires) {
      var compFrom = circuit.componentFromPin(wire.from);
      var compTo = circuit.componentFromPin(wire.to);
      if (parent.uniqueID === compFrom.uniqueID) {
        if (this.isClassicKnoten(compTo)) {
          if (compTo.onPath !== false) {
            count += 1;
            console.log(compTo.symbol, '+1');
          }
        } else if (compTo.selected || compTo.onPath === true) {
          count += 1;
          console.log(compTo.symbol, '+1');
        }
      }
      if (parent.uniqueID === compTo.uniqueID) {
        if (this.isClassicKnoten(compFrom)) {
          if (compFrom.onPath !== false) {
            count += 1;
            console.log(compFrom.symbol, '+1');
          }
        } else if (compFrom.selected || compFrom.onPath === true) {
          count += 1;
          console.log(compFrom.symbol, '+1');
        }
      }
    }
    const counterCo = circuit.getCountConnection(parent);
    let counterT = 0;
    for (let wire of circuit.wires) {
      var compFrom2 = circuit.componentFromPin(wire.from);
      var compTo2 = circuit.componentFromPin(wire.to);
      if (
        parent.uniqueID === compFrom2.uniqueID &&
        !this.isClassicKnoten(compTo2) &&
        !compTo2.selected
      ) {
        console.log('specific neignbors');
        counterT += 1;
      }
      if (
        parent.uniqueID === compTo2.uniqueID &&
        !this.isClassicKnoten(compFrom2) &&
        !compFrom2.selected
      ) {
        console.log('specific neignbors');
        counterT += 1;
      }
    }
    if (counterCo === counterT) {
      console.log('only specific neignbors');
      return false;
    }
    if (count > 1) {
      console.log('true');
      return true;
    } else {
      console.log('false');
      return false;
    }
  }
  isClassicKnoten(comp) {
    return comp instanceof KnotenJS && comp.valuePotentialSource === undefined;
  }

  conversion(selectedComp_array, circuit) {
    console.log('###CONVERSION###');
    //Knoten fusion before all to simplify circuits part
    for (let comp of selectedComp_array) {
      for (let w of circuit.wires) {
        const fromComp = circuit.componentFromPin(w.from);
        const toComp = circuit.componentFromPin(w.to);
        if (comp.uniqueID === fromComp.uniqueID) {
          const result = this.fusionNeighborsKnoten(circuit, fromComp, toComp);
          if (!result) {
            return false;
          }
        }
        if (comp.uniqueID === toComp.uniqueID) {
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

    console.log('ON*', this.extremity1_comp.symbol);
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
        const val = toComp.valueR;
        this.extremity1_comp.ngbValueR.push(val);
        keepOne += 1;
        if (keepOne === 1) {
          toComp.checked = true;
          ext1_comp = toComp;
          console.log(toComp.symbol, 'is Checked');
        } else {
          toComp.checked = false;
          console.log(toComp.symbol, 'is not Checked');
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
          fromComp.checked = false;
          console.log(fromComp.symbol, 'is not Checked');
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

    console.log('ON**', this.extremity2_comp.symbol);
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
        if (toComp.checked !== true) {
          toComp.checked = true;
          console.log(toComp.symbol, 'is Checked');
          ext2_comp = toComp;
        } else {
          console.log(toComp.symbol, 'is already Checked');
          circuit.deleteOneWire(w, i);
        }
      }
      if (
        this.extremity2_comp.uniqueID === toComp.uniqueID &&
        fromComp.selected
      ) {
        console.log('find1', fromComp.symbol);
        const val = fromComp.valueR;
        this.extremity2_comp.ngbValueR.push(val);
        if (fromComp.checked !== true) {
          fromComp.checked = true;
          console.log(fromComp.symbol, 'is Checked');
          ext2_comp = fromComp;
        } else {
          console.log(fromComp.symbol, 'is already Checked');
          circuit.deleteOneWire(w, i);
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

    console.log('ON***', this.extremity3_comp.symbol);
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
        console.log('push', toComp.symbol, toComp.valueR);
        this.extremity3_comp.ngbValueR.push(val);
        if (toComp.checked) {
          console.log(toComp.symbol, 'is already Checked');
          circuit.deleteOneWire(w, i);
        } else {
          console.log(toComp.symbol, 'is Checked');
          ext3_comp = toComp;
        }
      }
      if (
        this.extremity3_comp.uniqueID === toComp.uniqueID &&
        fromComp.selected
      ) {
        const val = fromComp.valueR;
        console.log('push', fromComp.symbol, fromComp.valueR);
        this.extremity3_comp.ngbValueR.push(val);
        if (fromComp.checked) {
          console.log(fromComp.symbol, 'is already Checked');
          circuit.deleteOneWire(w, i);
        } else {
          console.log(fromComp.symbol, 'is Checked');
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

    console.log('********************************************');
    console.log(ext1_comp.valueR);
    console.log(ext2_comp.valueR);
    console.log(ext3_comp.valueR);
    ext1_comp.valueR = firstValueR;
    ext2_comp.valueR = secondValueR;
    ext3_comp.valueR = thirdValueR;
    console.log('********************************************');
    console.log(ext1_comp.valueR);
    console.log(ext2_comp.valueR);
    console.log(ext3_comp.valueR);

    selectedComp_array.forEach(c => {
      if (c.showPin1) {
        circuit.createOneWire(c, 0, kn, 0);
      }
      if (c.showPin2) {
        circuit.createOneWire(c, 1, kn, 0);
      }
    });
    circuit.components.map(c => (c.checked = false));
    circuit.components.map(comp => (comp.visited = false));
    circuit.components.map(comp => (comp.onPath = undefined));
  }

  fusionNeighborsKnoten(circuit, origin, destination) {
    origin.isConnected = false;
    origin.hasTooMuchNeighbor = false;
    let localKnoten = [];
    circuit.components.map(comp => (comp.visited = false));
    circuit.components.map(comp => (comp.onPath = undefined));
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
