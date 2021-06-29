import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';
import KlemmeJS from '../../jsFolder/constructorComponent/jsComponents/Klemme';

export default class MultipleRinParallel {
  constructor() {
    this.ext1 = undefined;
    this.ext2 = undefined;
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
   * -isInParallel()
   */
  isPossible(selectedComp_array, circuit) {
    console.log('---------Parallel---------');
    let isAllSameInstance_bool = false;
    let isInParallel_bool = false;
    isAllSameInstance_bool = this.isAllSameInstance(selectedComp_array);
    if (!isAllSameInstance_bool) {
      return false;
    }
    isInParallel_bool = this.isInParallel(circuit);
    return isAllSameInstance_bool && isInParallel_bool;
  }

  isAllSameInstance(selectedComp_array) {
    return selectedComp_array.every(comp => comp instanceof ResistorJS);
  }

  isInParallel(circuitOriginal) {
    let circuit = circuitOriginal.project();

    const selArray = circuit.getSelectedComponents();
    // First Test: the selected components have the 2 neighbors and they are Knoten
    // WARNING can't interrupt a ForEach loop with return => use for loop
    let bool_data1 = this.is2MultiPinNeighbors(circuit, selArray);
    if (!bool_data1) {
      return false;
    }
    // Then visit all Knoten that are directs neighbors with firstComp
    // and flag twice comps that are neighbors to this visited Knoten and in selArray
    // FUSION
    let firstComp = selArray[0];
    console.log('firstComp', firstComp.symbol);
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (firstComp.uniqueID === fromComp.uniqueID) {
        // check "path" based on 1st pin
        const result = this.fusionNeighborsKnoten(
          circuit,
          selArray,
          fromComp,
          toComp,
          0
        );
        if (!result) {
          return false;
        }
      }
      if (firstComp.uniqueID === toComp.uniqueID) {
        // check "path" based on 2nd pin
        const result = this.fusionNeighborsKnoten(
          circuit,
          selArray,
          toComp,
          fromComp,
          1
        );
        if (!result) {
          return false;
        }
      }
    }
    let bool_data2 = this.is2MultiPinNeighbors(circuit, selArray);
    if (!bool_data2) {
      return false;
    }
    return true;
  }

  is2MultiPinNeighbors(circuit, selArray) {
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

  getCountConnectionAsGroup(circuit, comp) {
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

  fusionNeighborsKnoten(circuit, selArray, origin, destination, compStorageID) {
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
    // for fusion keep One, transfer only connection (circuit.wires) to One and delete other
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

  isNotConnectedTogether(a, b, circuit) {
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

  nextNeighbor(circuit, origin, comp, compStorageID) {
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
  }

  /**
   * modify value from one comp ~ keepAlive (R)
   * delete Other (R)
   */
  conversion(circuit) {
    const selectedComp_array = circuit.getSelectedComponents();
    let sum = 0;
    selectedComp_array.forEach(comp => {
      sum += 1 / comp.valueR;
    });
    console.log('result', 1 / sum);

    let [keepAlive] = selectedComp_array.splice(0, 1);
    keepAlive.symbol += 'SUM';
    keepAlive.valueR = 1 / sum;
    keepAlive.selected = false;
    selectedComp_array.forEach(component => {
      circuit.deleteOneComponent(component);
    });
    // while a Knoten in the circuit has just 1 connection && this Knoten isn't a potentialSrc => delete this one
    while (this.everyKnotenHas2CoMin_control(circuit) === false) {
      this.everyKnotenHas2CoMin_function(circuit);
    }
  }
  everyKnotenHas2CoMin_function(circuit) {
    circuit.components.forEach(kn => {
      if (this.isSimpleKnoten(kn)) {
        if (circuit.getCountConnection(kn) === 1) {
          const tempComp = this.getNeighborFor1Co(circuit, kn);
          if (this.isSimpleKnoten(tempComp)) {
            circuit.deleteOneComponent(kn);
          }
        } else if (circuit.getCountConnection(kn) === 0) {
          circuit.deleteOneComponent(kn);
        }
      }
    });
  }
  everyKnotenHas2CoMin_control(circuit) {
    for (let kn of circuit.components) {
      if (this.isSimpleKnoten(kn)) {
        if (circuit.getCountConnection(kn) === 1) {
          const tempComp = this.getNeighborFor1Co(circuit, kn);
          if (this.isSimpleKnoten(tempComp)) {
            return false;
          }
        } else if (circuit.getCountConnection(kn) === 0) {
          return false;
        }
      }
    }
  }
  getNeighborFor1Co(circuit, comp) {
    let compToReturn;
    for (let wire of circuit.wires) {
      var compFrom = circuit.componentFromPin(wire.from);
      var compTo = circuit.componentFromPin(wire.to);
      if (comp.uniqueID === compFrom.uniqueID) {
        compToReturn = compTo;
      }
      if (comp.uniqueID === compTo.uniqueID) {
        compToReturn = compFrom;
      }
    }
    return compToReturn;
  }
  isSimpleKnoten(comp) {
    return comp instanceof KnotenJS && comp.valuePotentialSource === undefined;
  }
}
