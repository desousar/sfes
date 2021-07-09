import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import KlemmeJS from '../../jsFolder/constructorComponent/jsComponents/Klemme';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';

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
    isInStern_bool = this.isInStern(circuit);
    return isAllSameInstance_bool && isInStern_bool;
  }

  is3SameInstance(selectedComp_array) {
    if (selectedComp_array.length !== 3) {
      return false;
    } else {
      return selectedComp_array.every(comp => comp instanceof ResistorJS);
    }
  }

  isInStern(circuitOriginal) {
    let circuit = circuitOriginal.project();
    let selectedComp_array = circuit.getSelectedComponents();
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
    let bool_data1 = this.is2MultiPinNeighbors(circuit);
    if (!bool_data1) {
      return false;
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
        console.log(!this.errorInMiddle);
        console.log('&&');
        console.log(
          selectedComp_array,
          selectedComp_array.every(c => c.flag === true)
        );
        if (
          !this.errorInMiddle &&
          selectedComp_array.every(c => c.flag === true)
        ) {
          res1 = true;
          console.log('res1', res1, 'startPoint', firstComp.symbol, pinNb);
          this.inside1_pinID = pinNb;
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
        const origin = firstComp;
        firstComp.flag = true;
        this.nextNeighbor(circuit, origin, w.to, w.from);
        console.log(!this.errorInMiddle);
        console.log('&&');
        console.log(
          selectedComp_array,
          selectedComp_array.every(c => c.flag === true)
        );
        if (
          !this.errorInMiddle &&
          selectedComp_array.every(c => c.flag === true)
        ) {
          res2 = true;
          console.log('res2', res2, 'startPoint', firstComp.symbol, pinNb);
          this.inside1_pinID = pinNb;
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
      console.log('FLAG ON', comp.symbol);
      comp.flag = true;
      for (let a of circuit.getSelectedComponents()) {
        console.log(a.symbol, 'FLAG', a.flag);
      }
      console.log('SELECTED COMP', origin);
      if (origin.uniqueID === comp.uniqueID) {
        console.log('LOOP Not Allowed');
        this.errorInMiddle = true;
      } else {
        console.log('find an other R', comp.symbol);
        const whichPin = circuit.pinIndexFromComponent(comp, compPin);
        console.log('*/*/*/extremity inside', whichPin);
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
          if (compTo.uniqueID !== parent.uniqueID && compTo.visited !== true) {
            console.log('ENTER 10!');
            this.nextNeighbor(circuit, origin, wire.from, wire.to);
          }
        } else if (comp.uniqueID === compTo.uniqueID) {
          console.log('ENTER 20:', compFrom.symbol);
          if (
            compFrom.uniqueID !== parent.uniqueID &&
            compFrom.visited !== true
          ) {
            console.log('ENTER 20!');
            this.nextNeighbor(circuit, origin, wire.to, wire.from);
          }
        }
      }
    } else {
      console.log('this.errorInMiddle');
    }
  }

  conversion(selectedComp_array, circuit) {
    console.log('###CONVERSION###');
    //Knoten fusion before all to simplify circuits part
    for (let comp of selectedComp_array) {
      for (let w of circuit.wires) {
        const fromComp = circuit.componentFromPin(w.from);
        const toComp = circuit.componentFromPin(w.to);
        if (comp.uniqueID === fromComp.uniqueID) {
          console.log('--FUSION 1--');
          const result = this.fusionNeighborsKnoten(
            circuit,
            comp,
            w.from,
            w.to
          );
          if (!result) {
            return false;
          }
        }
        if (comp.uniqueID === toComp.uniqueID) {
          console.log('--FUSION 2--');
          const result = this.fusionNeighborsKnoten(
            circuit,
            comp,
            w.to,
            w.from
          );
          if (!result) {
            return false;
          }
        }
      }
    }
    console.log('Simplication done');
    for (let c of selectedComp_array) {
      if (c.showPin1 && c.showPin2) {
        return;
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
    //find center Knoten
    const comp1 = selectedComp_array[0];
    let centerKnoten = undefined;
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (comp1.uniqueID === fromComp.uniqueID && toComp instanceof KnotenJS) {
        if (this.nextJump(circuit, toComp, fromComp)) {
          centerKnoten = this.nextJump(circuit, toComp, fromComp);
        }
      }
      if (comp1.uniqueID === toComp.uniqueID && fromComp instanceof KnotenJS) {
        if (this.nextJump(circuit, fromComp, toComp)) {
          centerKnoten = this.nextJump(circuit, fromComp, toComp);
        }
      }
    }
    console.log('center Knoten', centerKnoten);
    // define attibuts with centerKnoten
    for (let w of circuit.wires) {
      const fComp = circuit.componentFromPin(w.from);
      const tComp = circuit.componentFromPin(w.to);
      if (centerKnoten.uniqueID === fComp.uniqueID) {
        if (tComp.uniqueID === selectedComp_array[0].uniqueID) {
          this.inside1_pinID = circuit.pinIndexFromComponent(tComp, w.to);
          this.extremity1_comp = this.nextCompOnOtherPin(
            circuit,
            tComp,
            this.inside1_pinID
          );
        }
        if (tComp.uniqueID === selectedComp_array[1].uniqueID) {
          this.inside2_pinID = circuit.pinIndexFromComponent(tComp, w.to);
          this.extremity2_comp = this.nextCompOnOtherPin(
            circuit,
            tComp,
            this.inside2_pinID
          );
        }
        if (tComp.uniqueID === selectedComp_array[2].uniqueID) {
          this.inside3_pinID = circuit.pinIndexFromComponent(tComp, w.to);
          this.extremity3_comp = this.nextCompOnOtherPin(
            circuit,
            tComp,
            this.inside3_pinID
          );
        }
      }
      if (centerKnoten.uniqueID === tComp.uniqueID) {
        if (fComp.uniqueID === selectedComp_array[0].uniqueID) {
          this.inside1_pinID = circuit.pinIndexFromComponent(fComp, w.from);
          this.extremity1_comp = this.nextCompOnOtherPin(
            circuit,
            fComp,
            this.inside1_pinID
          );
        }
        if (fComp.uniqueID === selectedComp_array[1].uniqueID) {
          this.inside2_pinID = circuit.pinIndexFromComponent(fComp, w.from);
          this.extremity2_comp = this.nextCompOnOtherPin(
            circuit,
            fComp,
            this.inside2_pinID
          );
        }
        if (fComp.uniqueID === selectedComp_array[2].uniqueID) {
          this.inside3_pinID = circuit.pinIndexFromComponent(fComp, w.from);
          this.extremity3_comp = this.nextCompOnOtherPin(
            circuit,
            fComp,
            this.inside3_pinID
          );
        }
      }
    }

    //new valueR
    let sum = 0;
    selectedComp_array.forEach(comp => {
      sum += 1 / comp.valueR;
    });
    const divisor = 1 / sum;
    console.log('divisor', divisor);

    const dividend1 =
      selectedComp_array[0].valueR * selectedComp_array[1].valueR;
    const firstValueR = dividend1 / divisor;
    const dividend2 =
      selectedComp_array[1].valueR * selectedComp_array[2].valueR;
    const secondValueR = dividend2 / divisor;
    const dividend3 =
      selectedComp_array[2].valueR * selectedComp_array[0].valueR;
    const thirdValueR = dividend3 / divisor;

    selectedComp_array[0].valueR = firstValueR;
    selectedComp_array[1].valueR = secondValueR;
    selectedComp_array[2].valueR = thirdValueR;

    //graphical changes
    circuit.deleteOneComponent(centerKnoten);
    circuit.createOneWire(
      selectedComp_array[0],
      this.inside1_pinID,
      this.extremity2_comp,
      0
    );
    circuit.createOneWire(
      selectedComp_array[1],
      this.inside2_pinID,
      this.extremity3_comp,
      0
    );
    circuit.createOneWire(
      selectedComp_array[2],
      this.inside3_pinID,
      this.extremity1_comp,
      0
    );
    circuit.components.map(c => (c.flag = false));
    circuit.components.map(comp => (comp.visited = false));
  }

  nextJump(circuit, fromComp, toComp) {
    for (let w of circuit.wires) {
      const fromComp2 = circuit.componentFromPin(w.from);
      const toComp2 = circuit.componentFromPin(w.to);
      if (
        fromComp.uniqueID === fromComp2.uniqueID &&
        toComp.uniqueID !== toComp2.uniqueID &&
        toComp2.selected
      ) {
        return fromComp2;
      }
      if (
        fromComp.uniqueID === toComp2.uniqueID &&
        toComp.uniqueID !== fromComp2.uniqueID &&
        fromComp2.selected
      ) {
        return toComp2;
      }
    }
  }

  nextCompOnOtherPin(circuit, comp, pinID) {
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (comp.uniqueID === fromComp.uniqueID) {
        const tempPin = circuit.pinIndexFromComponent(comp, w.from);
        if (pinID !== tempPin) {
          console.log('extremity Comp', toComp.symbol);
          return toComp;
        }
      }
      if (comp.uniqueID === toComp.uniqueID) {
        const tempPin = circuit.pinIndexFromComponent(comp, w.to);
        if (pinID !== tempPin) {
          console.log('extremity Comp', fromComp.symbol);
          return fromComp;
        }
      }
    }
  }

  fusionNeighborsKnoten(circuit, origin, fromC, toC) {
    let localKnoten = [];
    this.errorInMiddle = false;
    console.log('origin', origin.symbol);
    this.nextNeighbor(circuit, origin, fromC, toC);
    console.log('nextNeighbor done');
    circuit.components.forEach(c => {
      if (c.visited) {
        localKnoten.push(c);
      }
    });

    circuit.components.map(comp => (comp.visited = false));
    // for fusion keep One, transfer only connection (circuit.wires) to One and delete other
    console.log('GO LK');
    let keepAlive;
    localKnoten.forEach(k => console.log(k.symbol));
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
