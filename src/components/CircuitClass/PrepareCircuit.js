import WireAsComp from '@/components/jsFolder/constructorComponent/jsComponents/WireAsComp.js';

import { isKnotenWithPotential } from '@/components/instanceofFunction.js';

import log from '@/consoleLog';

/*--------------------STEP 1--------------------*/

function isCircuitOpen() {
  this.components.forEach((comp) => {
    if (comp.isMultiPin) {
      if (this.getCountConnection(comp) === 0) {
        log('ADD A KNOTEN', kn1.symbol);
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

/*--------------------STEP 2--------------------*/

/**
 * purpose: check that there is a Knoten between two 2-Pins-components. If not add one
 */
function verifyOneKnotenBetweenTwo2PinsKomp() {
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
          log(
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
          log(
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
function getSubCircuit(startComp) {
  log('DEBUG SESSION');
  this.getOneSubCircuit(startComp);
}

function getOneSubCircuit(startComp) {
  log('\n-----SESSION-----\n');

  this.setAsVisited(startComp);
  log('START with:', startComp.symbol);

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

  log('\n----------add in SubCircuit----------\n');
  let subCircuit = [];
  for (let c = this.components.length - 1; c >= 0; c--) {
    const comp = this.components[c];
    log('inside', comp.symbol, comp);
    if (comp.visited) {
      log(comp.symbol);
      subCircuit.push(comp);
      this.components.splice(c, 1);
    } else {
      log('not', comp.symbol);
    }
  }
  log('\n----------use rest----------\n');
  this.listOfSubCircuit.push(subCircuit);
  for (let sc of this.listOfSubCircuit[this.listOfSubCircuit.length - 1]) {
    log('register : ', sc.symbol);
  }
  for (let c of this.components) {
    log('rest     : ', c.symbol);
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
function verifyPotential() {
  for (let i = 0; i < this.listOfSubCircuit.length; i++) {
    log('---SubCircuit---', i);

    let hasOnePotential = this.listOfSubCircuit[i].some((c) =>
      isKnotenWithPotential(c)
    );
    if (!hasOnePotential) {
      log('-------Warning: MISSING Potential, ADD one to 0');
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
function addOneWireBetweenTwoMultiPinKomp() {
  for (let i = 0; i < this.listOfSubCircuit.length; i++) {
    log('---SubCircuit---', i);
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
              log('add WireAsComp btw', compFrom.symbol, 'and', compTo.symbol);
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

export {
  isCircuitOpen,
  verifyOneKnotenBetweenTwo2PinsKomp,
  getSubCircuit,
  getOneSubCircuit,
  verifyPotential,
  addOneWireBetweenTwoMultiPinKomp
};
