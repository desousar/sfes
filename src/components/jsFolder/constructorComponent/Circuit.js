import Component from './Component.js';
import Knoten from './jsComponents/Knoten.js';
import CurrentSource from './jsComponents/CurrentSource.js';
import Resistor from './jsComponents/Resistor.js';
import VoltageSource from './jsComponents/VoltageSource.js';
import Ampermeter from './jsComponents/Ampermeter.js';
import Voltmeter from './jsComponents/Voltmeter.js';
import Klemme from './jsComponents/Klemme.js';
import WireAsComp from './jsComponents/WireAsComp.js';
import Wire from './Wire.js';

import Matrix from './../Matrix.js';

import ConsistentMatrixInfiniteError from '../../../CustomError/consistentMatrixInfiniteError.js';
import InconsistentMatrixError from '../../../CustomError/inconsistentMatrixError.js';

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
    return this.components.find(c => c.pins.some(p => p === pin));
  }
  componentFromPinWithXY(pin) {
    return this.components.find(c =>
      c.pins.some(p => p.x === pin.x && p.y === pin.y)
    );
  }
  /*
   * very important method: given pin, return component in specific SubCircuit Array
   */
  componentFromPinInSubC(pin, nb) {
    return this.listOfSubCircuit[nb].find(c => c.pins.some(p => p === pin));
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
    return this.components.filter(item => item.selected);
  }

  /**
   * this function delete just 1 component at the time
   * @param {*} componentToDelete
   * @param {index of comp in circuit.components array} index
   */
  deleteOneComponent(componentToDelete) {
    let index = undefined; // used for graphical
    this.components.forEach((comp, i) => {
      if (componentToDelete === comp) {
        index = i;
      }
    });
    for (
      let wireIndex = this.wires.length - 1;
      wireIndex >= 0;
      wireIndex -= 1
    ) {
      let wireUnderTest = this.wires[wireIndex];
      const fromComp = this.componentFromPin(wireUnderTest.from);
      const fromPin = this.pinIndexFromComponent(fromComp, wireUnderTest.from);
      const toComp = this.componentFromPin(wireUnderTest.to);
      const toPin = this.pinIndexFromComponent(toComp, wireUnderTest.to);
      if (componentToDelete === fromComp) {
        if (toComp.isMultiPin === false) {
          toPin === 0 ? (toComp.showPin1 = true) : (toComp.showPin2 = true);
        }
        this.wires.splice(wireIndex, 1);
      } else if (componentToDelete === toComp) {
        if (fromComp.isMultiPin === false) {
          fromPin === 0
            ? (fromComp.showPin1 = true)
            : (fromComp.showPin2 = true);
        }
        this.wires.splice(wireIndex, 1);
      }
    }
    //graphical suppression
    this.components.splice(index, 1);
    this.components.forEach(comp => {
      comp.resetCalculatedValues();
    });
  }

  deleteOneWire(wireToDelete, index) {
    for (
      let compIndex = this.components.length - 1;
      compIndex >= 0;
      compIndex -= 1
    ) {
      let compUnderTest = this.components[compIndex];
      const fromComp = this.componentFromPin(wireToDelete.from);
      const fromPinNB = this.pinIndexFromComponent(fromComp, wireToDelete.from);
      const toComp = this.componentFromPin(wireToDelete.to);
      const toPinNB = this.pinIndexFromComponent(toComp, wireToDelete.to);
      if (fromComp === compUnderTest) {
        if (compUnderTest.isMultiPin === false) {
          fromPinNB === 0
            ? (compUnderTest.showPin1 = true)
            : (compUnderTest.showPin2 = true);
        }
      } else if (toComp === compUnderTest) {
        if (compUnderTest.isMultiPin === false) {
          toPinNB === 0
            ? (compUnderTest.showPin1 = true)
            : (compUnderTest.showPin2 = true);
        }
      }
    }
    this.wires.splice(index, 1); //delete line graphical
    this.components.forEach(comp => {
      comp.resetCalculatedValues();
    });
  }

  /**
   * @returns a deep project on which we can work (add/remove comp) without to change original circuit
   */
  project() {
    const components = this.components.map(c =>
      Object.assign(Object.create(Object.getPrototypeOf(c)), c)
    ); //Deep copy
    const wires = this.wires.map(w => Object.assign({}, w));

    const eq = new Circuit(components, wires); //ShadowCircuit (wird vom Original abgeleitet)

    return eq; // manipulate circuit eq that is a projection
  }

  /*--------------------STEP 1--------------------*/

  /**
   * purpose: check that all 2-Pins-components have their main value
   */
  assertMainValues() {
    this.components.forEach(comp => {
      if (!comp.isMultiPin) {
        comp.assertMainValue();
      }
      /* if you run test-circuit in command line comment following if-statement */
      // if (comp.showPin1 === true || comp.showPin2 === true) {
      //   throw new Error('circuit is open on ' + comp.symbol);
      // }
    });
  }

  /*--------------------STEP 2--------------------*/

  /**
   * purpose: check that there is a Knoten between two 2-Pins-components. If not add one
   */
  verifyOneKnotenBetweenTwo2PinsKomp() {
    this.components.forEach(comp => {
      for (let wire of this.wires) {
        const compFrom = this.componentFromPin(wire.from);
        const pinFrom = this.pinIndexFromComponent(compFrom, wire.from);
        const compTo = this.componentFromPin(wire.to);
        const pinTo = this.pinIndexFromComponent(compTo, wire.to);
        if (comp === compFrom && !comp.isMultiPin) {
          if (!compTo.isMultiPin) {
            //add a Knoten
            let index = this.wires.indexOf(wire);
            this.wires.splice(index, 1);
            const kSTEP2 = new Knoten({
              symbol: 'kSTEP2'
            });
            this.components.push(kSTEP2);
            console.log(
              'add kSTEP2 btw',
              compFrom.symbol,
              'and',
              compTo.symbol
            );
            const wSTEP21 = new Wire({
              from: compFrom.pins[pinFrom],
              to: kSTEP2.pins[0]
            });
            const wSTEP22 = new Wire({
              from: kSTEP2.pins[0],
              to: compTo.pins[pinTo]
            });
            this.wires.push(wSTEP21, wSTEP22);
          }
        }
        if (comp === compTo && !comp.isMultiPin) {
          if (!compFrom.isMultiPin) {
            //add a Knoten
            let index = this.wires.indexOf(wire);
            this.wires.splice(index, 1);
            const kSTEP2 = new Knoten({
              symbol: 'kSTEP2'
            });
            this.components.push(kSTEP2);
            console.log(
              'add kSTEP2 btw',
              compFrom.symbol,
              'and',
              compTo.symbol
            );
            const wSTEP21 = new Wire({
              from: compFrom.pins[pinFrom],
              to: kSTEP2.pins[0]
            });
            const wSTEP22 = new Wire({
              from: kSTEP2.pins[0],
              to: compTo.pins[pinTo]
            });
            this.wires.push(wSTEP21, wSTEP22);
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

    startComp.visitedPin0 = true;
    console.log('START 00:', startComp.symbol);
    console.log('\tvisitedPin0');

    /**
     * if the circuit is open, you have to browse the circuit from the 2 pins of the component
     */
    if (startComp.isMultiPin) {
      console.log('MULTIPIN OK', startComp.symbol);
      startComp.visitedPin0 = true;
      console.log(
        '\tvisitedPin0 Knoten OK',
        startComp.symbol,
        startComp.uniqueID,
        this.getCountConnection(startComp)
      );
      if (
        this.getCountConnection(startComp) === 1 &&
        this.getNextCompWith(startComp.pins[0]).visitedPin0 === true
      ) {
        console.log('\tvisitedPin0 EndOfWire MultiPin OK', startComp.symbol);
      } else {
        for (let wire of this.wires) {
          const compFrom = this.componentFromPin(wire.from);
          const compTo = this.componentFromPin(wire.to);
          if (compFrom !== undefined && compTo !== undefined) {
            if (startComp.uniqueID === compFrom.uniqueID) {
              console.log('ENTER 100: OK', compTo.symbol);
              if (!compTo.isMultiPin) {
                const index = this.pinIndexFromComponent(compTo, wire.to);
                compTo['visitedPin' + index] = true;
                console.log('\tvisitedPin' + index);
              }
              this.nextNeighbor(compFrom, compTo); //Recursion
            } else if (startComp.uniqueID === compTo.uniqueID) {
              console.log('ENTER 200: OK', compFrom.symbol);
              if (!compFrom.isMultiPin) {
                const index = this.pinIndexFromComponent(compFrom, wire.from);
                compFrom['visitedPin' + index] = true;
                console.log('\tvisitedPin' + index);
              }
              this.nextNeighbor(compTo, compFrom); //Recursion
            }
          }
        }
      }
    } else {
      const nextComp = this.getNextCompWith(startComp.pins[0]);
      this.nextNeighbor(startComp, nextComp); //Recursion
    }

    if (startComp.visitedPin1 === undefined && startComp.isMultiPin === false) {
      const nextComp = this.getNextCompWith(startComp.pins[1]);
      this.nextNeighbor(startComp, nextComp); //Recursion
    }

    console.log('\n----------add in SubCircuit----------\n');
    let subCircuit = [];
    for (let c = this.components.length - 1; c >= 0; c--) {
      console.log('inside', this.components[c].symbol, this.components[c]);
      if (
        this.components[c].visitedPin0 === true ||
        this.components[c].visitedPin1 === true
      ) {
        console.log(this.components[c].symbol);
        subCircuit.push(this.components[c]);
        this.components.splice(c, 1);
      } else {
        console.log('not', this.components[c].symbol);
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
  }

  getNextCompWith(pin) {
    for (let wire of this.wires) {
      const compFrom = this.componentFromPin(wire.from);
      const compTo = this.componentFromPin(wire.to);
      if (pin === wire.from) {
        console.log('ENTER 10:', compTo.symbol);
        if (!compTo.isMultiPin) {
          const index = this.pinIndexFromComponent(compTo, wire.to);
          compTo['visitedPin' + index] = true; //dynamic attribute name with half part String
          console.log('\tvisitedPin' + index);
        }
        return compTo;
      } else if (pin === wire.to) {
        console.log('ENTER 20:', compFrom.symbol);
        if (!compFrom.isMultiPin) {
          const index = this.pinIndexFromComponent(compFrom, wire.from);
          compFrom['visitedPin' + index] = true;
          console.log('\tvisitedPin' + index);
        }
        return compFrom;
      }
    }
  }

  nextNeighbor(origin, comp) {
    if (comp.isMultiPin === false && (!comp.visitedPin0 || !comp.visitedPin1)) {
      let pin;
      if (comp.visitedPin0) {
        pin = comp.pins[1];
        comp.visitedPin1 = true;
        console.log('\tvisitedPin1');
      } else if (comp.visitedPin1) {
        pin = comp.pins[0];
        comp.visitedPin0 = true;
        console.log('\tvisitedPin0');
      }
      const nextComp = this.getNextCompWith(pin);
      if (nextComp === undefined) {
        const kSTEP3 = new Knoten({
          symbol: 'kSTEP3',
          visitedPin0: true
        });
        console.log('-------Warning: Circuit open, ADD', kSTEP3.symbol);
        this.components.push(kSTEP3);
        kSTEP3.visitedPin0 = true;
        if (comp.visitedPin0) {
          const wSTEP3 = new Wire({
            from: comp.pins[1],
            to: kSTEP3.pins[0]
          });
          this.wires.push(wSTEP3);
        } else {
          const wSTEP3 = new Wire({
            from: comp.pins[0],
            to: kSTEP3.pins[0]
          });
          this.wires.push(wSTEP3);
        }
      } else {
        this.nextNeighbor(comp, nextComp); //Recursion
      }
    } else if (comp.isMultiPin) {
      console.log('MULTIPIN', comp.symbol);
      comp.visitedPin0 = true;
      console.log(
        '\tvisitedPin0 Knoten',
        comp.symbol,
        comp.uniqueID,
        this.getCountConnection(comp)
      );
      if (this.getCountConnection(comp) === 1) {
        console.log('\tvisitedPin0 EndOfWire MultiPin', comp.symbol);
      } else {
        for (let wire of this.wires) {
          const compFrom = this.componentFromPin(wire.from);
          const compTo = this.componentFromPin(wire.to);
          if (compFrom !== undefined && compTo !== undefined) {
            if (
              comp.uniqueID === compFrom.uniqueID &&
              origin.uniqueID !== compTo.uniqueID
            ) {
              console.log('ENTER 100:', compTo.symbol);
              if (!compTo.isMultiPin) {
                const index = this.pinIndexFromComponent(compTo, wire.to);
                compTo['visitedPin' + index] = true;
                console.log('\tvisitedPin' + index);
              }
              this.nextNeighbor(compFrom, compTo); //Recursion
            } else if (
              comp.uniqueID === compTo.uniqueID &&
              origin.uniqueID !== compFrom.uniqueID
            ) {
              console.log('ENTER 200:', compFrom.symbol);
              if (!compFrom.isMultiPin) {
                const index = this.pinIndexFromComponent(compFrom, wire.from);
                compFrom['visitedPin' + index] = true;
                console.log('\tvisitedPin' + index);
              }
              this.nextNeighbor(compTo, compFrom); //Recursion
            }
          }
        }
      }
    }
  }

  getCountConnection(comp) {
    let count = 0;
    for (let wire of this.wires) {
      var compFrom = this.componentFromPin(wire.from);
      var compTo = this.componentFromPin(wire.to);
      if (comp === compFrom || comp === compTo) {
        count++;
      }
    }
    return count;
  }

  /*--------------------STEP 4--------------------*/

  /**
   * purpose: check that there is at least one Knoten per SubCircuit that has a Potential value. If not add one equals 0 to the first Knoten
   */
  verifyPotential() {
    for (let i = 0; i < this.listOfSubCircuit.length; i++) {
      console.log('---SubCircuit---');

      let hasOnePotential = this.listOfSubCircuit[i].some(
        c => c instanceof Knoten && c.valuePotentialSource !== undefined
      );
      if (!hasOnePotential) {
        console.log('-------Warning: MISSING Potential, ADD one to 0');
        for (let sc of this.listOfSubCircuit[i]) {
          if (sc instanceof Knoten) {
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
      console.log('---SubCircuit---');
      this.listOfSubCircuit[i].forEach(comp => {
        if (comp.isMultiPin) {
          for (let wire of this.wires) {
            const compFrom = this.componentFromPinInSubC(wire.from, i);
            const compTo = this.componentFromPinInSubC(wire.to, i);
            if (compFrom !== undefined && compTo !== undefined) {
              if (
                (comp === compFrom || comp === compTo) &&
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
                  'add Wire btw',
                  compFrom.symbol,
                  'and',
                  compTo.symbol
                );
                const pinFrom = this.pinIndexFromComponent(compFrom, wire.from);
                const pinTo = this.pinIndexFromComponent(compTo, wire.to);
                const wSTEP51 = new Wire({
                  from: compFrom.pins[pinFrom],
                  to: wAsCSTEP5.pins[0]
                });
                const wSTEP52 = new Wire({
                  from: wAsCSTEP5.pins[1],
                  to: compTo.pins[pinTo]
                });
                this.wires.push(wSTEP51, wSTEP52);
              }
            }
          }
        }
      });
    }
  }

  /*---------------Knotenpotentialverfahren---------------*/
  numberMultiPinKomp(nb) {
    let count = 0;
    this.listOfSubCircuit[nb].forEach(comp => {
      if (comp.isMultiPin) {
        count++;
      }
    });
    return count;
  }
  number2PinsKomp(nb) {
    let count = 0;
    this.listOfSubCircuit[nb].forEach(comp => {
      if (!comp.isMultiPin) {
        count++;
      } else if (comp.valuePotentialSource !== undefined) {
        count++;
      }
    });
    return count;
  }
  createAndSolveMatrix() {
    //every Sub-Circuit will have his own matrix
    this.A = [];
    this.b = [];
    this.listModel = [];
    this.result = [];

    for (let i = 0; i < this.listOfSubCircuit.length; i++) {
      console.log('multiPin:', this.numberMultiPinKomp(i));
      console.log('2Pins:', this.number2PinsKomp(i));
      let cols = this.numberMultiPinKomp(i) + this.number2PinsKomp(i) * 2;
      let rows = this.numberMultiPinKomp(i) + this.number2PinsKomp(i) * 2;
      console.log('rows:', rows, ' cols:', cols);
      this.A[i] = new Matrix({ row: rows, column: cols });
      this.b[i] = new Matrix({ row: rows, column: 1 });
      this.listModel[i] = []; //contain all value name -> will be used with result matrix (same order)

      this.A[i].print('A');
      this.b[i].print('b');
      console.log('------KnotenGleichungen------');
      this.knotenEquation(i);
      console.log('------BauteilGleichungen------');
      this.bauteilEquation(i);
      console.log('------PotenzialGleichungen------');
      this.potenzialEquation(i);
      console.log('------END Gleichung Sammlung------');

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
    this.listOfSubCircuit[nb].forEach(comp => {
      if (comp.isMultiPin) {
        if (comp.valuePotentialSource !== undefined) {
          let indexI = comp.addValueIinListModelANDgetIndex(this.listModel, nb);
          this.A[nb].set(rowCounter, indexI, -1);
        }
        for (let wire of this.wires) {
          const compFrom = this.componentFromPinInSubC(wire.from, nb);
          const compTo = this.componentFromPinInSubC(wire.to, nb);
          if (comp === compFrom) {
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
          if (comp === compTo) {
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
        rowCounter++;
      }
    });
    this.A[nb].print('A');
    this.b[nb].print('b');
  }
  /*-------------------StepB: BauteilGleichungen----------------------*/
  bauteilEquation(nb) {
    let rowCounter = this.numberMultiPinKomp(nb);
    this.listOfSubCircuit[nb].forEach(comp => {
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
    let rowCounter = this.numberMultiPinKomp(nb) + this.number2PinsKomp(nb);
    this.listOfSubCircuit[nb].forEach(comp => {
      if (!comp.isMultiPin || comp.valuePotentialSource !== undefined) {
        if (comp instanceof Knoten && comp.valuePotentialSource !== undefined) {
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
            if (comp === compFrom) {
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
            if (comp === compTo) {
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
      circuit.components.forEach(comp => {
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
      circuit.components.forEach(comp => {
        if (!comp.isMultiPin) {
          this.findNeighbor(comp, i); //2 Potentials from every 2-Pins-Comp
        }
      });
    }
  }
  contains(comp, nb) {
    let booleanValue = false;
    this.listOfSubCircuit[nb].forEach(c => {
      if (c.uniqueID == comp.uniqueID) {
        booleanValue = true;
      }
    });
    return booleanValue;
  }
  findNeighbor(c, nb) {
    this.wires.forEach(wire => {
      const compTo = this.componentFromPinInSubC(wire.to, nb);
      const compFrom = this.componentFromPinInSubC(wire.from, nb);
      if (compFrom !== undefined || compTo !== undefined) {
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
    // TODO load circuit from String / JSON
    console.log('obj before comp:', obj);
    obj.components.forEach(comp => {
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
    obj.wires.forEach(w => {
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
  getOne2PinsComponent(comp) {
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
