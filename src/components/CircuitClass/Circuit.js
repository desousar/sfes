import Component from '../jsFolder/constructorComponent/Component.js';
import Knoten from '../jsFolder/constructorComponent/jsComponents/Knoten.js';
import CurrentSource from '../jsFolder/constructorComponent/jsComponents/CurrentSource.js';
import Resistor from '../jsFolder/constructorComponent/jsComponents/Resistor.js';
import VoltageSource from '../jsFolder/constructorComponent/jsComponents/VoltageSource.js';
import Ampermeter from '../jsFolder/constructorComponent/jsComponents/Ampermeter.js';
import Voltmeter from '../jsFolder/constructorComponent/jsComponents/Voltmeter.js';
import Klemme from '../jsFolder/constructorComponent/jsComponents/Klemme.js';
import WireAsComp from '../jsFolder/constructorComponent/jsComponents/WireAsComp.js';

import Matrix from '../jsFolder/Matrix.js';

import ConsistentMatrixInfiniteError from '../../CustomError/consistentMatrixInfiniteError.js';
import InconsistentMatrixError from '../../CustomError/inconsistentMatrixError.js';

import log from '@/consoleLog';

import deleteOneWire from './handleWire/DeleteWire.js';
import createOneWire from './handleWire/CreateWire.js';
import {
  deleteOneComponent,
  deleteCompAndSetWireInstead,
  deleteMultiPinCompAndSetWireInstead
} from './handleComponent/DeleteComponent.js';
import { dropComp } from './handleComponent/CreateComponent.js';

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
    console.log('STEP 1 started');
    /**
     * purpose: check that all 2-Pins-components have their main value
     * => Already done before calling checkAndSolveCircuit
     */
    try {
      this.isCircuitOpen();
    } catch (e) {
      throw new Error('ERROR by STEP 1: ' + e.message);
    }
    console.log('STEP 1 finished');
    //STEP 2
    console.log('STEP 2 started');
    this.verifyOneKnotenBetweenTwo2PinsKomp();
    console.log('STEP 2 finished');
    //STEP 3
    console.log('STEP 3 started');
    this.getSubCircuit(this.components[0]);
    console.log('Number of Subcircuit(s) :', this.listOfSubCircuit.length); //projection.components is now empty !!!
    console.log('STEP 3 finished');

    //STEP 4
    console.log('STEP 4 started');
    this.verifyPotential();
    console.log('STEP 4 finished');

    //STEP 5
    console.log('STEP 5 started');
    this.addOneWireBetweenTwoMultiPinKomp();
    console.log('STEP 5 finished');

    //Knotenpotentialverfahren
    console.log('---!!!---Ready for Knotenpotentialverfahren---!!!---');
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
    console.log('SOLVED');
  }

  /*--------------------STEP 1--------------------*/

  isCircuitOpen() {
    this.components.forEach((comp) => {
      if (comp.isMultiPin) {
        if (this.getCountConnection(comp) === 0) {
          console.log('ADD A KNOTEN', kn1.symbol);
          const kn1 = this.dropComp({
            c_id: 'Knoten'
          });
          this.createOneWire(comp, 0, kn1, 0);
        }
      } else {
        if (comp.showPin1 === true && comp.showPin2 === true) {
          // bind R to one Knoten on both pins to enable the solve process
          const kn1 = this.dropComp({
            c_id: 'Knoten'
          });
          this.createOneWire(comp, 0, kn1, 0);
          this.createOneWire(comp, 1, kn1, 0);
        } else if (comp.showPin1 === true || comp.showPin2 === true) {
          throw new Error('circuit is open on ' + comp.symbol);
        }
      }
    });
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

  /*--------------------STEP 2--------------------*/

  /**
   * purpose: check that there is a Knoten between two 2-Pins-components. If not add one
   */
  verifyOneKnotenBetweenTwo2PinsKomp() {
    this.components.forEach((comp) => {
      if (!comp.isMultiPin) {
        for (const wire of this.wires) {
          const compFrom = this.componentFromPin(wire.from);
          const pinFrom = this.pinIndexFromComponent(compFrom, wire.from);
          const compTo = this.componentFromPin(wire.to);
          const pinTo = this.pinIndexFromComponent(compTo, wire.to);
          if (comp.uniqueID === compFrom.uniqueID && !compTo.isMultiPin) {
            //add a Knoten
            const index = this.wires.indexOf(wire);
            this.wires.splice(index, 1);
            const kSTEP2 = this.dropComp({
              c_id: 'Knoten'
            });
            console.log(
              'add kSTEP2',
              kSTEP2.symbol,
              'btw',
              compFrom.symbol,
              'and',
              compTo.symbol
            );
            this.createOneWire(compFrom, pinFrom, kSTEP2, 0);
            this.createOneWire(kSTEP2, 0, compTo, pinTo);
          }
          if (comp.uniqueID === compTo.uniqueID && !compFrom.isMultiPin) {
            //add a Knoten
            const index = this.wires.indexOf(wire);
            this.wires.splice(index, 1);
            const kSTEP2 = this.dropComp({
              c_id: 'Knoten'
            });
            console.log(
              'add kSTEP2',
              kSTEP2.symbol,
              'btw',
              compFrom.symbol,
              'and',
              compTo.symbol
            );
            this.createOneWire(compFrom, pinFrom, kSTEP2, 0);
            this.createOneWire(kSTEP2, 0, compTo, pinTo);
          }
        }
      }
    });
  }

  /*--------------------STEP 3--------------------*/

  /**
   * purpose: split global components array into multiples SubCircuits
   * a the end: components array is empty
   */
  getSubCircuit(startComp) {
    console.log('DEBUG SESSION');
    this.getOneSubCircuit(startComp);
  }

  getOneSubCircuit(startComp) {
    console.log('\n-----SESSION-----\n');

    this.setAsVisited(startComp);
    console.log('START with:', startComp.symbol);

    /*
    I know the circuit is not open, so I annotate the component as visited
    => use an arrow function explore to explore circuits 
    */
    const explore = (nComp) => {
      log('EXPLORE', nComp.symbol);
      const comps = this.getNeighborsOfOneComp(nComp.pins);

      log('comps', comps);
      for (const icomp of comps) {
        log('icomp', icomp.symbol, icomp.visited);

        if (icomp.visited) {
          continue;
        }

        this.setAsVisited(icomp);
        explore(icomp);
      }
    };

    explore(startComp);

    console.log('\n----------add in SubCircuit----------\n');
    let subCircuit = [];
    for (let c = this.components.length - 1; c >= 0; c--) {
      const comp = this.components[c];
      console.log('inside', comp.symbol, comp);
      if (comp.visited) {
        console.log(comp.symbol);
        subCircuit.push(comp);
        this.components.splice(c, 1);
      } else {
        console.log('not', comp.symbol);
      }
    }
    console.log('\n----------use rest----------\n');
    this.listOfSubCircuit.push(subCircuit);
    for (let sc of this.listOfSubCircuit[this.listOfSubCircuit.length - 1]) {
      console.log('register : ', sc.symbol);
    }
    for (let c of this.components) {
      console.log('rest     : ', c.symbol);
    }
    if (this.components.length > 0) {
      this.getOneSubCircuit(this.components[0]); //Recursion
    }

    // there's no need to reset the visited attribute to false, as checkAndSolveCircuit is called on a projection
  }

  /*--------------------STEP 4--------------------*/

  /**
   * purpose: check that there is at least one Knoten per SubCircuit that has a Potential value. If not add one equals 0 to the first Knoten
   */
  verifyPotential() {
    for (let i = 0; i < this.listOfSubCircuit.length; i++) {
      console.log('---SubCircuit---', i);

      let hasOnePotential = this.listOfSubCircuit[i].some(
        (c) => c instanceof Knoten && c.valuePotentialSource !== undefined
      );
      if (!hasOnePotential) {
        console.log('-------Warning: MISSING Potential, ADD one to 0');
        for (let sc of this.listOfSubCircuit[i]) {
          if (sc.isMultiPin) {
            sc.valuePotentialSource = 0;
            break; //to get just first Knoten
          }
        }
      }
    }
  }

  /*--------------------STEP 5--------------------*/

  /**
   * purpose: check that there is a Wire between two Knoten. If not add one
   */
  addOneWireBetweenTwoMultiPinKomp() {
    for (let i = 0; i < this.listOfSubCircuit.length; i++) {
      console.log('---SubCircuit---', i);
      this.listOfSubCircuit[i].forEach((comp) => {
        if (comp.isMultiPin) {
          for (let wire of this.wires) {
            const compFrom = this.componentFromPinInSubC(wire.from, i);
            const compTo = this.componentFromPinInSubC(wire.to, i);
            if (compFrom && compTo) {
              if (
                (comp.uniqueID === compFrom.uniqueID ||
                  comp.uniqueID === compTo.uniqueID) &&
                compFrom.isMultiPin &&
                compTo.isMultiPin
              ) {
                //add a WireAsComp
                let index = this.wires.indexOf(wire);
                this.wires.splice(index, 1);
                const wAsCSTEP5 = new WireAsComp({
                  symbol: 'wAsCSTEP5'
                });
                this.listOfSubCircuit[i].push(wAsCSTEP5);
                console.log(
                  'add WireAsComp btw',
                  compFrom.symbol,
                  'and',
                  compTo.symbol
                );
                const pinFrom = this.pinIndexFromComponent(compFrom, wire.from);
                const pinTo = this.pinIndexFromComponent(compTo, wire.to);
                this.createOneWire(compFrom, pinFrom, wAsCSTEP5, 0);
                this.createOneWire(wAsCSTEP5, 1, compTo, pinTo);
              }
            }
          }
        }
      });
    }
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
      console.log('multiPin:', countMultiPin, 'and 2Pins:', count2Pins);
      let cols = countMultiPin + count2Pins * 2;
      let rows = countMultiPin + count2Pins * 2;
      console.log('rows:', rows, ' cols:', cols);
      this.A[i] = new Matrix({ row: rows, column: cols });
      this.b[i] = new Matrix({ row: rows, column: 1 });
      this.listModel[i] = []; //contain all value name -> will be used with result matrix (same order)

      this.A[i].print('A');
      this.b[i].print('b');
      console.log('------KnotenGleichungen------', i);
      this.knotenEquation(i);
      console.log('------BauteilGleichungen------', i);
      this.bauteilEquation(i);
      console.log('------PotenzialGleichungen------', i);
      this.potenzialEquation(i);
      console.log('------END Gleichung Sammlung------', i);

      const cc = this.A[i].deepCopy();
      cc.toReducedRowEchelonForm();
      this.A[i].rank = cc.rank;

      const Aug = this.A[i].deepCopy();
      Aug.makeAug(this.b[i]);
      Aug.print('AUG');
      Aug.toReducedRowEchelonForm();

      console.log('rank of Aug from subC', i, ':', Aug.rank);
      console.log('rank of A[', i, '] :', this.A[i].rank);
      console.log('dim (col) :', this.A[i].column);

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

  /*-------------------StepA: KnotenGleichungen----------------------*/
  knotenEquation(nb) {
    //by KnotenEquation all equations are always equal to 0, thus the default value for matrix b
    let rowCounter = 0;
    this.listOfSubCircuit[nb].forEach((comp) => {
      if (comp.isMultiPin) {
        if (comp.valuePotentialSource !== undefined) {
          let indexI = comp.addValueIinListModelANDgetIndex(this.listModel, nb);
          this.A[nb].set(rowCounter, indexI, -1);
        }
        for (let wire of this.wires) {
          const compFrom = this.componentFromPinInSubC(wire.from, nb);
          const compTo = this.componentFromPinInSubC(wire.to, nb);
          if (compFrom && compTo) {
            if (comp.uniqueID === compFrom.uniqueID) {
              const pinTo = this.pinIndexFromComponent(compTo, wire.to);
              let indexI = compTo.addValueIinListModelANDgetIndex(
                this.listModel,
                nb
              );
              if (pinTo === 0) {
                if (compTo.directionI === Component.PIN0_TO_PIN1) {
                  this.A[nb].set(rowCounter, indexI, -1); //-1*valueI
                } else if (compTo.directionI === Component.PIN1_TO_PIN0) {
                  this.A[nb].set(rowCounter, indexI, 1); //+1*valueI
                }
              } else if (pinTo === 1) {
                if (compTo.directionI === Component.PIN0_TO_PIN1) {
                  this.A[nb].set(rowCounter, indexI, 1); //+1*valueI
                } else if (compTo.directionI === Component.PIN1_TO_PIN0) {
                  this.A[nb].set(rowCounter, indexI, -1); //-1*valueI
                }
              }
            }
            if (comp.uniqueID === compTo.uniqueID) {
              const pinFrom = this.pinIndexFromComponent(compFrom, wire.from);
              let indexI = compFrom.addValueIinListModelANDgetIndex(
                this.listModel,
                nb
              );
              if (pinFrom === 0) {
                if (compFrom.directionI === Component.PIN0_TO_PIN1) {
                  this.A[nb].set(rowCounter, indexI, -1); //-1*valueI
                } else if (compFrom.directionI === Component.PIN1_TO_PIN0) {
                  this.A[nb].set(rowCounter, indexI, 1); //+1*valueI
                }
              } else if (pinFrom === 1) {
                if (compFrom.directionI === Component.PIN0_TO_PIN1) {
                  this.A[nb].set(rowCounter, indexI, 1); //+1*valueI
                } else if (compFrom.directionI === Component.PIN1_TO_PIN0) {
                  this.A[nb].set(rowCounter, indexI, -1); //-1*valueI
                }
              }
            }
          }
        }
        rowCounter++;
      }
    });
    this.A[nb].print('A');
    this.b[nb].print('b');
  }
  /*-------------------StepB: BauteilGleichungen----------------------*/
  bauteilEquation(nb) {
    const { countMultiPin } = this.getNumberMultiPin_and_2PinsComp(nb);
    let rowCounter = countMultiPin;
    console.log(nb, this.listOfSubCircuit);
    this.listOfSubCircuit[nb].forEach((comp) => {
      if (!comp.isMultiPin || comp.valuePotentialSource !== undefined) {
        comp.bauteilEqu(this.A, this.b, this.listModel, nb, rowCounter);
        rowCounter++;
      }
    });
    this.A[nb].print('A');
    this.b[nb].print('b');
  }
  /*-------------------StepC: PotenzialGleichungen----------------------*/
  potenzialEquation(nb) {
    const { countMultiPin, count2Pins } =
      this.getNumberMultiPin_and_2PinsComp(nb);
    let rowCounter = countMultiPin + count2Pins;
    this.listOfSubCircuit[nb].forEach((comp) => {
      if (!comp.isMultiPin || comp.valuePotentialSource !== undefined) {
        if (comp.valuePotentialSource !== undefined) {
          //U+(-1)*valuePHI=(-1)*valuePotential
          let indexU = comp.addValueUinListModelANDgetIndex(this.listModel, nb);
          this.A[nb].set(rowCounter, indexU, 1); //-> 1*U
          let indexPHI = comp.addValuePHIinListModelANDgetIndex(
            this.listModel,
            nb
          );
          this.A[nb].set(rowCounter, indexPHI, -1); //-> (-1)*valuePHI
          this.b[nb].set(rowCounter, 0, -1 * comp.valuePotentialSource); //-> -1*value of src
          rowCounter++;
        } else {
          //if directionU = 0     => 1*U  + (-1)*kOFpin[0] + 1*kOFpin[1]
          //if directionU = 1     => 1*U  + (-1)*kOFpin[1] + 1*kOFpin[0]
          let indexU = comp.addValueUinListModelANDgetIndex(this.listModel, nb);
          this.A[nb].set(rowCounter, indexU, 1); //-> 1*U
          for (let wire of this.wires) {
            const compFrom = this.componentFromPinInSubC(wire.from, nb);
            const compTo = this.componentFromPinInSubC(wire.to, nb);
            if (compFrom && compTo) {
              if (comp.uniqueID === compFrom.uniqueID) {
                let indexPHI = compTo.addValuePHIinListModelANDgetIndex(
                  this.listModel,
                  nb
                );
                if (comp.pins[0] === wire.from) {
                  //Knoten connected on comp.pin[0]
                  if (comp.directionU === Component.PIN0_TO_PIN1) {
                    this.A[nb].set(rowCounter, indexPHI, -1); //-> (-1)*kOFpin[0]
                  } else if (comp.directionU === Component.PIN1_TO_PIN0) {
                    this.A[nb].set(rowCounter, indexPHI, 1); //-> 1*kOFpin[0]
                  }
                } else if (comp.pins[1] === wire.from) {
                  //Knoten connected on comp.pin[1]
                  if (comp.directionU === Component.PIN0_TO_PIN1) {
                    this.A[nb].set(rowCounter, indexPHI, 1); //-> 1*kOFpin[0]
                  } else if (comp.directionU === Component.PIN1_TO_PIN0) {
                    this.A[nb].set(rowCounter, indexPHI, -1); //-> (-1)*kOFpin[0]
                  }
                }
              }
              if (comp.uniqueID === compTo.uniqueID) {
                let indexPHI = compFrom.addValuePHIinListModelANDgetIndex(
                  this.listModel,
                  nb
                );
                if (comp.pins[0] === wire.to) {
                  //Knoten connected on comp.pin[0]
                  if (comp.directionU === Component.PIN0_TO_PIN1) {
                    this.A[nb].set(rowCounter, indexPHI, -1); //-> (-1)*kOFpin[0]
                  } else if (comp.directionU === Component.PIN1_TO_PIN0) {
                    this.A[nb].set(rowCounter, indexPHI, 1); //-> 1*kOFpin[0]
                  }
                } else if (comp.pins[1] === wire.to) {
                  //Knoten connected on comp.pin[1]
                  if (comp.directionU === Component.PIN0_TO_PIN1) {
                    this.A[nb].set(rowCounter, indexPHI, 1); //-> 1*kOFpin[0]
                  } else if (comp.directionU === Component.PIN1_TO_PIN0) {
                    this.A[nb].set(rowCounter, indexPHI, -1); //-> (-1)*kOFpin[0]
                  }
                }
              }
            }
          }
          rowCounter++;
        }
      }
    });
    this.A[nb].print('A');
    this.b[nb].print('b');
  }

  /**
   * all the components of the original circuit take the values they have obtained in the projection
   * @param {original} circuit
   */
  attributionToOriginal(circuit) {
    for (let i = 0; i < this.listOfSubCircuit.length; i++) {
      console.log('---TEST attribution projection nb', i, '-> original---');
      if (this.result[i] === undefined) {
        throw new Error('subCircuit ' + i + ' is not available');
      }
      console.log(this.result[i]);
      console.log(this.listModel[i]);
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

  loadNewCircuit(obj) {
    this.components = undefined;
    console.log('obj before comp:', obj);
    obj.components.forEach((comp) => {
      /**
       * for every components
       * set the Prototype by checking comp.name
       */
      if (comp.name === 'Resistor') {
        Object.setPrototypeOf(comp, Resistor.prototype);
        //because comp needs recalculatePins() (when move) who is in Component.js (parent)
      }
      if (comp.name === 'VoltageSource') {
        Object.setPrototypeOf(comp, VoltageSource.prototype);
      }
      if (comp.name === 'CurrentSource') {
        Object.setPrototypeOf(comp, CurrentSource.prototype);
      }
      if (comp.name === 'Ampermeter') {
        Object.setPrototypeOf(comp, Ampermeter.prototype);
      }
      if (comp.name === 'Voltmeter') {
        Object.setPrototypeOf(comp, Voltmeter.prototype);
      }
      if (comp.name === 'Knoten') {
        Object.setPrototypeOf(comp, Knoten.prototype);
      }
      if (comp.name === 'Klemme') {
        Object.setPrototypeOf(comp, Klemme.prototype);
      }
    });
    this.components = obj.components;
  }
  loadWireOfNewCircuit(obj) {
    this.wires = [];
    obj.wires.forEach((w) => {
      const fromComp = this.componentFromPinWithXY(w.from);
      const fromPinNB = this.pinIndexFromComponentWithXY(fromComp, w.from);
      const toComp = this.componentFromPinWithXY(w.to);
      const toPinNB = this.pinIndexFromComponentWithXY(toComp, w.to);
      w.from = fromComp.pins[fromPinNB];
      w.to = toComp.pins[toPinNB];
      this.wires.push(w);
    });
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
