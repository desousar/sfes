import Matrix from '@/components/jsFolder/Matrix.js';

import ConsistentMatrixInfiniteError from '@/CustomError/consistentMatrixInfiniteError.js';
import InconsistentMatrixError from '@/CustomError/inconsistentMatrixError.js';

import log from '@/consoleLog';

import deleteOneWire from './handleWire/DeleteWire.js';
import createOneWire from './handleWire/CreateWire.js';
import {
  deleteOneComponent,
  deleteCompAndSetWireInstead,
  deleteMultiPinCompAndSetWireInstead
} from './handleComponent/DeleteComponent.js';
import { dropComp } from './handleComponent/CreateComponent.js';
import {
  isCircuitOpen,
  verifyOneKnotenBetweenTwo2PinsKomp,
  getSubCircuit,
  getOneSubCircuit,
  verifyPotential,
  addOneWireBetweenTwoMultiPinKomp
} from './PrepareCircuit.js';
import {
  knotenEquation,
  bauteilEquation,
  potenzialEquation
} from './Knotenpotentialverfahren.js';
import { loadNewCircuit } from './LoadCircuit.js';

export default class Circuit {
  constructor(components, wires) {
    this.components = components;
    this.wires = wires;
    this.listOfSubCircuit = []; //IDEA: besser stateless implementieren ( get subCircuit(){} )
  }

  /*
   * very important method: given pin, return component in global components Array
   */
  componentFromPin(pin) {
    return this.components.find((c) => c.pins.some((p) => p === pin));
  }
  // used for loading a circuit
  componentFromPinWithXY(pin) {
    return this.components.find((c) =>
      c.pins.some((p) => p.x === pin.x && p.y === pin.y)
    );
  }
  /*
   * very important method: given pin, return component in specific SubCircuit Array
   */
  componentFromPinInSubC(pin, nb) {
    return this.listOfSubCircuit[nb].find((c) => c.pins.some((p) => p === pin));
  }
  /*
   * very important method: given component and pin, return index of pin
   */
  pinIndexFromComponent(component, pin) {
    for (let i = 0; i < component.pins.length; i++) {
      if (component.pins[i] === pin) {
        return i;
      }
    }
    return -1;
  }
  // used for loading a circuit
  pinIndexFromComponentWithXY(component, pin) {
    for (let i = 0; i < component.pins.length; i++) {
      if (component.pins[i].x === pin.x && component.pins[i].y === pin.y) {
        return i;
      }
    }
    return -1;
  }

  /**
   * @returns filter function by special attribut
   */
  // getflagConversionComponents() {
  //   return this.components.filter((item) => item.flagConversion);
  // }
  getSelectedComponents() {
    return this.components.filter((item) => item.selected);
  }

  setAsVisited(comp) {
    this.components
      .filter((c) => c.uniqueID === comp.uniqueID)
      .map((comp) => {
        comp.visited = true;
      });
    log('set visited', comp.symbol, comp.visited);
  }

  setOnPath(comp, bool) {
    this.components
      .filter((c) => c.uniqueID === comp.uniqueID)
      .map((comp) => {
        comp.onPath = bool;
      });
    log('set onPath', comp.symbol, comp.onPath);
  }

  setForPermutation(comp, rotation, x, y) {
    this.components
      .filter((c) => c.uniqueID === comp.uniqueID)
      .map((comp) => {
        comp.rotation = rotation;
        comp.x = x;
        comp.y = y;
      });
  }

  setValueR(comp, valueR) {
    this.components
      .filter((c) => c.uniqueID === comp.uniqueID)
      .map((comp) => {
        comp.valueR = valueR;
      });
  }

  /**
   * @param {Object if only one OR Array if multiple like MultiComp} pins
   * @returns neighbor(s) as an Array of One Comp based on the given pin(s)
   */
  getNeighborsOfOneComp(pins) {
    const compsToReturn = [];
    if (!(pins instanceof Array)) {
      pins = [pins];
    }
    for (const pin of pins) {
      for (const wire of this.wires) {
        if (pin === wire.from) {
          const compTo = this.componentFromPin(wire.to);
          compsToReturn.push(compTo);
        }
        if (pin === wire.to) {
          const compFrom = this.componentFromPin(wire.from);
          compsToReturn.push(compFrom);
        }
      }
    }
    return compsToReturn;
  }

  getCountConnection(comp) {
    let count = 0;
    for (let wire of this.wires) {
      var compFrom = this.componentFromPin(wire.from);
      var compTo = this.componentFromPin(wire.to);
      if (
        comp.uniqueID === compFrom.uniqueID ||
        comp.uniqueID === compTo.uniqueID
      ) {
        count++;
      }
    }
    return count;
  }

  /**
   * @returns a deep project on which we can work (add/remove comp) without to change original circuit
   */
  project() {
    const components = this.components.map((c) =>
      Object.assign(Object.create(Object.getPrototypeOf(c)), c)
    ); //Deep copy
    const wires = this.wires.map((w) => Object.assign({}, w));

    const eq = new Circuit(components, wires); //ShadowCircuit (wird vom Original abgeleitet)

    return eq; // manipulate circuit eq that is a projection
  }

  checkAndSolveCircuit() {
    //STEP 1
    log('STEP 1 started');
    /**
     * purpose: check that all 2-Pins-components have their main value
     * => Already done before calling checkAndSolveCircuit
     */
    try {
      this.isCircuitOpen();
    } catch (e) {
      throw new Error('ERROR by STEP 1: ' + e.message);
    }
    log('STEP 1 finished');
    //STEP 2
    log('STEP 2 started');
    this.verifyOneKnotenBetweenTwo2PinsKomp();
    log('STEP 2 finished');
    //STEP 3
    log('STEP 3 started');
    this.getSubCircuit(this.components[0]);
    log('Number of Subcircuit(s) :', this.listOfSubCircuit.length); //projection.components is now empty !!!
    log('STEP 3 finished');

    //STEP 4
    log('STEP 4 started');
    this.verifyPotential();
    log('STEP 4 finished');

    //STEP 5
    log('STEP 5 started');
    this.addOneWireBetweenTwoMultiPinKomp();
    log('STEP 5 finished');

    //Knotenpotentialverfahren
    log('---!!!---Ready for Knotenpotentialverfahren---!!!---');
    try {
      this.createAndSolveMatrix();
    } catch (e) {
      // throw new Error("ERROR by Knotenpotentialverfahren: " + e.message);

      if (e instanceof InconsistentMatrixError) {
        throw new InconsistentMatrixError(
          'ERROR by Knotenpotentialverfahren: ' + e.message
        );
      }
      if (e instanceof ConsistentMatrixInfiniteError) {
        throw new ConsistentMatrixInfiniteError(
          'ERROR by Knotenpotentialverfahren: ' + e.message
        );
      }
    }
    log('SOLVED');
  }

  /*---------------Knotenpotentialverfahren---------------*/

  getNumberMultiPin_and_2PinsComp(nb) {
    let countMultiPin = 0;
    let count2Pins = 0;
    this.listOfSubCircuit[nb].forEach((comp) => {
      if (comp.isMultiPin) {
        countMultiPin++;
        if (comp.valuePotentialSource !== undefined) {
          count2Pins++;
        }
      }
      if (!comp.isMultiPin) {
        count2Pins++;
      }
    });
    return { countMultiPin: countMultiPin, count2Pins: count2Pins };
  }

  createAndSolveMatrix() {
    //every Sub-Circuit will have his own matrix
    this.A = [];
    this.b = [];
    this.listModel = [];
    this.result = [];

    for (let i = 0; i < this.listOfSubCircuit.length; i++) {
      const { countMultiPin, count2Pins } =
        this.getNumberMultiPin_and_2PinsComp(i);
      log('multiPin:', countMultiPin, 'and 2Pins:', count2Pins);
      let cols = countMultiPin + count2Pins * 2;
      let rows = countMultiPin + count2Pins * 2;
      log('rows:', rows, ' cols:', cols);
      this.A[i] = new Matrix({ row: rows, column: cols });
      this.b[i] = new Matrix({ row: rows, column: 1 });
      this.listModel[i] = []; //contain all value name -> will be used with result matrix (same order)

      this.A[i].print('A');
      this.b[i].print('b');
      log('------KnotenGleichungen------', i);
      this.knotenEquation(i);
      log('------BauteilGleichungen------', i);
      this.bauteilEquation(i);
      log('------PotenzialGleichungen------', i);
      this.potenzialEquation(i);
      log('------END Gleichung Sammlung------', i);

      const cc = this.A[i].deepCopy();
      cc.toReducedRowEchelonForm();
      this.A[i].rank = cc.rank;

      const Aug = this.A[i].deepCopy();
      Aug.makeAug(this.b[i]);
      Aug.print('AUG');
      Aug.toReducedRowEchelonForm();

      log('rank of Aug from subC', i, ':', Aug.rank);
      log('rank of A[', i, '] :', this.A[i].rank);
      log('dim (col) :', this.A[i].column);

      if (this.A[i].rank === Aug.rank) {
        if (this.A[i].rank === this.A[i].column) {
          this.result[i] = this.A[i].solve(this.b[i]);
          this.result[i].print('result');
        } else {
          this.result[i] = undefined;
          throw new ConsistentMatrixInfiniteError(
            'on SubCircuit ' +
              i +
              ' matrix consistent but infinite solutions (ex. two voltage sources parallel with same value)'
          );
        }
      } else {
        this.result[i] = undefined;
        throw new InconsistentMatrixError(
          'on SubCircuit ' +
            i +
            ' matrix inconsistent (see possible causes in help)'
        );
      }
    }
  }

  /**
   * all the components of the original circuit take the values they have obtained in the projection
   * @param {original} circuit
   */
  attributionToOriginal(circuit) {
    for (let i = 0; i < this.listOfSubCircuit.length; i++) {
      log('---TEST attribution projection nb', i, '-> original---');
      if (this.result[i] === undefined) {
        throw new Error('subCircuit ' + i + ' is not available');
      }
      log(this.result[i]);
      log(this.listModel[i]);
      circuit.components.forEach((comp) => {
        let booleanValue = this.contains(comp, i);
        if (booleanValue === true) {
          if (comp.isMultiPin) {
            comp.valuePhi = this.result[i].get(
              this.listModel[i].indexOf('valuePhi' + comp.uniqueID),
              0
            );
          }
          if (!comp.isMultiPin || comp.valuePotentialSource !== undefined) {
            comp.valueI = this.result[i].get(
              this.listModel[i].indexOf('valueI' + comp.uniqueID),
              0
            );
            comp.valueU = this.result[i].get(
              this.listModel[i].indexOf('valueU' + comp.uniqueID),
              0
            );
          }
        }
      });
      circuit.components.forEach((comp) => {
        if (!comp.isMultiPin) {
          this.findNeighbor(comp, i); //2 Potentials from every 2-Pins-Comp
        }
      });
    }
  }
  contains(comp, nb) {
    let booleanValue = false;
    this.listOfSubCircuit[nb].forEach((c) => {
      if (c.uniqueID == comp.uniqueID) {
        booleanValue = true;
      }
    });
    return booleanValue;
  }
  findNeighbor(c, nb) {
    this.wires.forEach((wire) => {
      const compTo = this.componentFromPinInSubC(wire.to, nb);
      const compFrom = this.componentFromPinInSubC(wire.from, nb);
      if (compFrom && compTo) {
        if (c.uniqueID === compFrom.uniqueID) {
          this.attributeValuePhi(c, wire.from, compTo, nb);
        }
        if (c.uniqueID === compTo.uniqueID) {
          this.attributeValuePhi(c, wire.to, compFrom, nb);
        }
      }
    });
  }
  attributeValuePhi(theComp, theCompPin, otherComp, nb) {
    this.pinIndexFromComponent(theComp, theCompPin) === 0
      ? (theComp.potentialPin0 = this.result[nb].get(
          this.listModel[nb].indexOf('valuePhi' + otherComp.uniqueID),
          0
        ))
      : (theComp.potentialPin1 = this.result[nb].get(
          this.listModel[nb].indexOf('valuePhi' + otherComp.uniqueID),
          0
        ));
  }

  /**
   * this function will be use by the equivalent source
   * @param {will be an Ampermeter or Voltmeter} comp
   */
  attributeUItoOne2PinsComponent(comp) {
    for (let i = 0; i < this.listOfSubCircuit.length; i++) {
      let booleanValue = this.contains(comp, i);
      if (booleanValue === true) {
        comp.valueI = this.result[i].get(
          this.listModel[i].indexOf('valueI' + comp.uniqueID),
          0
        );
        comp.valueU = this.result[i].get(
          this.listModel[i].indexOf('valueU' + comp.uniqueID),
          0
        );
      }
    }
  }
}

Circuit.prototype.deleteOneWire = deleteOneWire;
Circuit.prototype.createOneWire = createOneWire;
Circuit.prototype.deleteOneComponent = deleteOneComponent;
Circuit.prototype.deleteCompAndSetWireInstead = deleteCompAndSetWireInstead;
Circuit.prototype.deleteMultiPinCompAndSetWireInstead =
  deleteMultiPinCompAndSetWireInstead;
Circuit.prototype.dropComp = dropComp;

Circuit.prototype.isCircuitOpen = isCircuitOpen;
Circuit.prototype.verifyOneKnotenBetweenTwo2PinsKomp =
  verifyOneKnotenBetweenTwo2PinsKomp;
Circuit.prototype.getSubCircuit = getSubCircuit;
Circuit.prototype.getOneSubCircuit = getOneSubCircuit;
Circuit.prototype.verifyPotential = verifyPotential;
Circuit.prototype.addOneWireBetweenTwoMultiPinKomp =
  addOneWireBetweenTwoMultiPinKomp;

Circuit.prototype.knotenEquation = knotenEquation;
Circuit.prototype.bauteilEquation = bauteilEquation;
Circuit.prototype.potenzialEquation = potenzialEquation;

Circuit.prototype.loadNewCircuit = loadNewCircuit;
