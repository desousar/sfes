import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';

export default class MultipleRinParallel {
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
   * -isInParallel()
   */
  isPossible(selectedComp_array, circuit) {
    console.log('---------Parallel---------');
    let isAllSameInstance_bool = false;
    let isInParallel_bool = false;
    if (selectedComp_array.length < 2) {
      return false;
    } else {
      try {
        selectedComp_array.forEach(comp => {
          comp.assertMainValue();
        });
        isAllSameInstance_bool = this.isAllSameInstance(selectedComp_array);
        let onRealCircuit = false;
        isInParallel_bool = this.isInParallel(circuit, onRealCircuit);
      } catch (e) {
        alert(e.message);
      }
    }
    return isAllSameInstance_bool && isInParallel_bool;
  }

  isAllSameInstance(selectedComp_array) {
    return selectedComp_array.every(comp => comp instanceof ResistorJS);
  }

  isInParallel(circuitOriginal, onRealCircuit) {
    let circuit;
    if (onRealCircuit) {
      circuit = circuitOriginal;
    } else {
      circuit = circuitOriginal.project();
    }
    const selArray = circuit.getSelectedComponents();
    // First Test: the selected components have the 2 neighbors and they are Knoten
    // WARNING can't interrupt a ForEach loop with return => use for loop
    let bool_data1 = this.is2KnotenNeighbors(circuit, selArray);
    if (!bool_data1) {
      return false;
    }
    console.log('FIRST TEST OK');
    // Then visit all Knoten that are directs neighbors with firstComp
    // and flag twice comps that are neighbors to this visited Knoten and in selArray
    // FUSION
    let firstComp = selArray[0];
    console.log('firstComp', firstComp.symbol);
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (firstComp === fromComp) {
        // check "path" based on 1st pin
        const result = this.fusionNeighborsKnoten(
          circuit,
          selArray,
          fromComp,
          toComp
        );
        if (!result) {
          return false;
        }
      }
      if (firstComp === toComp) {
        // check "path" based on 2nd pin
        const result = this.fusionNeighborsKnoten(
          circuit,
          selArray,
          toComp,
          fromComp
        );
        if (!result) {
          return false;
        }
      }
    }
    let bool_data2 = this.is2KnotenNeighbors(circuit, selArray);
    if (!bool_data2) {
      return false;
    }
    return true;
  }

  is2KnotenNeighbors(circuit, selArray) {
    console.log(selArray);
    for (let comp of selArray) {
      comp.find = [];
      console.log('comp under test', comp.symbol);
      for (let w of circuit.wires) {
        const fromComp = circuit.componentFromPin(w.from);
        const toComp = circuit.componentFromPin(w.to);
        if (comp === fromComp) {
          console.log('find1', comp.symbol, toComp instanceof KnotenJS);
          if (
            !(toComp instanceof KnotenJS) ||
            toComp.valuePotentialSource !== undefined
          ) {
            console.log('STOP1');
            return false;
          } else {
            comp.find.push(toComp.uniqueID);
          }
        }
        if (comp === toComp) {
          console.log('find2', comp.symbol, fromComp instanceof KnotenJS);
          if (
            !(fromComp instanceof KnotenJS) ||
            fromComp.valuePotentialSource !== undefined
          ) {
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

  fusionNeighborsKnoten(circuit, selArray, origin, destination) {
    let localKnoten = [];
    console.log('find', origin.symbol, destination instanceof KnotenJS);
    this.nextNeighbor(circuit, origin, destination);

    let result = selArray.every(comp => comp.flagConversion);
    console.log('***', result);
    if (!result) {
      console.log('return false');
      return false;
    }
    selArray.map(comp => (comp.flagConversion = false));

    circuit.components.forEach(k => {
      if (k.visited) {
        console.log('VISITED2', k.symbol);
        localKnoten.push(k);
      }
    });
    circuit.components.map(comp => (comp.visited = false));
    // for fusion keep One, transfer only connection (circuit.wires) to One and delete other
    let [keepAlive] = localKnoten.splice(0, 1);
    localKnoten.forEach(lk => {
      for (let wire of circuit.wires) {
        const compFrom = circuit.componentFromPin(wire.from);
        const compTo = circuit.componentFromPin(wire.to);
        if (
          lk === compFrom &&
          (!(compTo instanceof KnotenJS) ||
            compTo.valuePotentialSource !== undefined)
        ) {
          wire.from = keepAlive.pins[0];
        }
        if (
          lk === compTo &&
          (!(compFrom instanceof KnotenJS) ||
            compFrom.valuePotentialSource !== undefined)
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

  nextNeighbor(circuit, origin, comp) {
    const selArray = circuit.getSelectedComponents();
    if (selArray.includes(origin)) {
      console.log('SELARRAY contains', origin.symbol);
      origin.flagConversion = true;
    }
    console.log(comp.symbol, 'is under test');
    comp.visited = true;
    for (let wire of circuit.wires) {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (comp === compFrom) {
        console.log('ENTER 10 find:', compTo.symbol);
        if (
          compTo instanceof KnotenJS &&
          !compTo.visited &&
          compTo.valuePotentialSource === undefined
        ) {
          this.nextNeighbor(circuit, compFrom, compTo);
        }
        if (selArray.includes(compTo)) {
          console.log('SELARRAY10 contains', compTo.symbol);
          compTo.flagConversion = true;
        }
      } else if (comp === compTo) {
        console.log('ENTER 20 find:', compFrom.symbol);
        if (
          compFrom instanceof KnotenJS &&
          !compFrom.visited &&
          compFrom.valuePotentialSource === undefined
        ) {
          this.nextNeighbor(circuit, compTo, compFrom);
        }
        if (selArray.indexOf(compFrom) !== -1) {
          console.log('SELARRAY20 contains', compFrom.symbol);
          compFrom.flagConversion = true;
        }
      }
    }
  }

  /**
   * modify value from one comp ~ keepAlive (R)
   * delete Other (R)
   */
  conversion(circuit) {
    const selectedComp_array = circuit.getSelectedComponents();
    let onRealCircuit = true;
    this.isInParallel(circuit, onRealCircuit);
    let sum = 0;
    selectedComp_array.forEach(comp => {
      console.log('value:', 1 / comp.valueR);
      sum += 1 / comp.valueR;
    });
    console.log('result', sum);

    let [keepAlive] = selectedComp_array.splice(0, 1);
    keepAlive.symbol += 'SUM';
    keepAlive.valueR = sum;
    keepAlive.selected = false;
    selectedComp_array.forEach(component => {
      circuit.deleteOneComponent(component);
    });
  }
}
