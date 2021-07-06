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
    // find a path btw all selected comp
    // flag twice comps that are neighbors
    for (let sComp of selArray) {
      console.log('---START---', sComp.symbol);
      for (let pin of sComp.pins) {
        console.log('---PIN---');
        sComp.flagConversion = true;
        sComp.visited = true;
        sComp.onPath = true;
        let localKnoten = [];
        circuit.wires.forEach(w => {
          const fromComp = circuit.componentFromPin(w.from);
          const toComp = circuit.componentFromPin(w.to);
          if (pin === w.from) {
            console.log('find', sComp.symbol, 'on fromComp');
            toComp.onPath = true;
            this.nextNeighbor(circuit, fromComp, fromComp, toComp, localKnoten);
            console.log('a', localKnoten);
            if (selArray.every(comp => comp.flagConversion)) {
              localKnoten = [];
              circuit.components.map(comp => (comp.visited = false));
              selArray.map(comp => (comp.flagConversion = false));
              sComp.flagConversion = true;
              sComp.visited = true;
              sComp.onPath = true;
              this.nextNeighbor(
                circuit,
                fromComp,
                fromComp,
                toComp,
                localKnoten
              );
              console.log('a2', localKnoten);
            }
          }
          if (pin === w.to) {
            console.log('find', sComp.symbol, 'on toComp');
            fromComp.onPath = true;
            this.nextNeighbor(circuit, toComp, toComp, fromComp, localKnoten);
            console.log('b', localKnoten);
            if (!selArray.every(comp => comp.flagConversion)) {
              sComp.isConnected = false;
              sComp.hasTooMuchNeighbor = false;
              localKnoten = [];
              circuit.components.map(comp => (comp.visited = false));
              selArray.map(comp => (comp.flagConversion = false));
              sComp.flagConversion = true;
              sComp.visited = true;
              sComp.onPath = true;
              this.nextNeighbor(circuit, toComp, toComp, fromComp, localKnoten);
              console.log('b2', localKnoten);
            }
          }
        });

        let result = selArray.every(comp => comp.flagConversion);
        console.log('***flagConversion***', result);
        if (!result) {
          return false;
        }
      }
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

  nextNeighbor(circuit, origin, parent, comp, localKnoten) {
    console.log(comp.symbol, 'is under test');
    if (comp.selected) {
      console.log('comp is selected', comp.symbol);
      comp.flagConversion = true;
    }
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
    }
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
        if (this.isSimpleKnoten(compTo)) {
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
        if (this.isSimpleKnoten(compFrom)) {
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
        !this.isSimpleKnoten(compTo2) &&
        !compTo2.selected
      ) {
        console.log('specific neignbors');
        counterT += 1;
      }
      if (
        parent.uniqueID === compTo2.uniqueID &&
        !this.isSimpleKnoten(compFrom2) &&
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

  isSimpleKnoten(comp) {
    return comp instanceof KnotenJS && comp.valuePotentialSource === undefined;
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
}
