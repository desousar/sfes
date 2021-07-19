import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';

export default class Permutation {
  /**
   * Situation
   * neighborA*neighborAPin--futurePinInB*compB*futurePinOutB--simpleKnoten--futurePinOutA*compA*futurePinInA--neighborBPin*neighborB
   */
  constructor() {
    this.neighborA = undefined;
    this.neighborAPin = undefined;
    this.futurePinInA = undefined;
    this.compA = undefined;
    this.futurePinOutA = undefined;
    this.simpleKnoten = undefined;
    this.futurePinOutB = undefined;
    this.compB = undefined;
    this.futurePinInB = undefined;
    this.neighborB = undefined;
    this.neighborBPin = undefined;
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
   * -isInSerieWithKn()
   */
  isPossible(selectedComp_array, circuit) {
    console.log('---------Permutation---------');
    if (selectedComp_array.length !== 2) {
      return false;
    }
    let isInSerie_bool = false;
    isInSerie_bool = this.isInSerieWithKn(selectedComp_array, circuit);
    return isInSerie_bool;
  }

  isInSerieWithKn(selectedComp_array, circuit) {
    const compA = selectedComp_array[0];
    console.log('start on compA', compA.symbol);
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (
        compA.uniqueID === fromComp.uniqueID &&
        this.isClassicKnoten(toComp)
      ) {
        this.nextJump(circuit, toComp, fromComp, w.from);
      }
      if (
        compA.uniqueID === toComp.uniqueID &&
        this.isClassicKnoten(fromComp)
      ) {
        this.nextJump(circuit, fromComp, toComp, w.to);
      }
    }
    if (this.simpleKnoten === undefined) {
      return false;
    }

    console.log(
      this.futurePinInA,
      this.compA.symbol,
      this.futurePinOutA,
      this.simpleKnoten.symbol,
      this.futurePinOutB,
      this.compB.symbol,
      this.futurePinInB
    );
    if (this.neighborA) {
      console.log(this.neighborA.symbol, this.neighborAPin);
    }
    if (this.neighborB) {
      console.log(this.neighborB.symbol, this.neighborBPin);
    }
    return true;
  }

  isClassicKnoten(comp) {
    return comp instanceof KnotenJS && comp.valuePotentialSource === undefined;
  }

  /**
   *
   * @param {*} circuit
   * @param {simpleKnoten} fromComp
   * @param {compA} parentComp
   * @param {*} coordParentPin
   * @returns
   */
  nextJump(circuit, fromComp, parentComp, coordParentPin) {
    for (let w2 of circuit.wires) {
      const fromComp2 = circuit.componentFromPin(w2.from);
      const toComp2 = circuit.componentFromPin(w2.to);
      if (
        fromComp.uniqueID === fromComp2.uniqueID &&
        parentComp.uniqueID !== toComp2.uniqueID &&
        toComp2.selected
      ) {
        this.assignAttributes(
          circuit,
          fromComp2,
          parentComp,
          coordParentPin,
          toComp2,
          w2.to
        );
        return;
      }
      if (
        fromComp.uniqueID === toComp2.uniqueID &&
        parentComp.uniqueID !== fromComp2.uniqueID &&
        fromComp2.selected
      ) {
        this.assignAttributes(
          circuit,
          toComp2,
          parentComp,
          coordParentPin,
          fromComp2,
          w2.from
        );

        return;
      }
    }
  }

  assignAttributes(
    circuit,
    simpleKnoten,
    compA,
    coordCompAPinIn,
    compB,
    coordCompBPinIn
  ) {
    this.simpleKnoten = simpleKnoten;

    this.compA = compA;
    this.futurePinOutA = circuit.pinIndexFromComponent(compA, coordCompAPinIn);
    if (compA.isMultiPin) {
      this.futurePinInA = 0;
    } else {
      this.futurePinOutA === 0
        ? (this.futurePinInA = 1)
        : (this.futurePinInA = 0);
    }

    this.compB = compB;
    this.futurePinOutB = circuit.pinIndexFromComponent(compB, coordCompBPinIn);
    if (compB.isMultiPin) {
      this.futurePinInB = 0;
    } else {
      this.futurePinOutB === 0
        ? (this.futurePinInB = 1)
        : (this.futurePinInB = 0);
    }

    for (let w3 of circuit.wires) {
      const fromComp3 = circuit.componentFromPin(w3.from);
      const toComp3 = circuit.componentFromPin(w3.to);
      if (
        fromComp3.uniqueID === compA.uniqueID &&
        w3.from === compA.pins[this.futurePinInA] &&
        toComp3 !== simpleKnoten
      ) {
        this.neighborA = toComp3;
        this.neighborAPin = circuit.pinIndexFromComponent(toComp3, w3.to);
      }
      if (
        toComp3.uniqueID === compA.uniqueID &&
        w3.to === compA.pins[this.futurePinInA] &&
        fromComp3 !== simpleKnoten
      ) {
        this.neighborA = fromComp3;
        this.neighborAPin = circuit.pinIndexFromComponent(fromComp3, w3.from);
      }

      if (
        fromComp3.uniqueID === compB.uniqueID &&
        w3.from === compB.pins[this.futurePinInB] &&
        toComp3 !== simpleKnoten
      ) {
        this.neighborB = toComp3;
        this.neighborBPin = circuit.pinIndexFromComponent(toComp3, w3.to);
      }
      if (
        toComp3.uniqueID === compB.uniqueID &&
        w3.to === compB.pins[this.futurePinInB] &&
        fromComp3 !== simpleKnoten
      ) {
        this.neighborB = fromComp3;
        this.neighborBPin = circuit.pinIndexFromComponent(fromComp3, w3.from);
      }
    }
  }

  /**
   * permutation
   */
  conversion(selectedComp_array, circuit) {
    this.isInSerieWithKn(selectedComp_array, circuit);
    //STEP 1) delete 4 Wires : neighborA--compA--simpleKnoten--compB--neighborB
    for (let index = circuit.wires.length - 1; index >= 0; index--) {
      let wire = circuit.wires[index];
      const fromComp = circuit.componentFromPin(wire.from);
      const toComp = circuit.componentFromPin(wire.to);
      if (this.neighborA) {
        if (
          (fromComp.uniqueID === this.neighborA.uniqueID &&
            toComp.uniqueID === this.compA.uniqueID) ||
          (toComp.uniqueID === this.neighborA.uniqueID &&
            fromComp.uniqueID === this.compA.uniqueID)
        ) {
          //neighborA--compA
          circuit.deleteOneWire(wire, index);
        }
      }
      if (
        (fromComp.uniqueID === this.compA.uniqueID &&
          toComp.uniqueID === this.simpleKnoten.uniqueID) ||
        (toComp.uniqueID === this.compA.uniqueID &&
          fromComp.uniqueID === this.simpleKnoten.uniqueID)
      ) {
        //compA--simpleKnoten
        circuit.deleteOneWire(wire, index);
      }
      if (
        (fromComp.uniqueID === this.simpleKnoten.uniqueID &&
          toComp.uniqueID === this.compB.uniqueID) ||
        (toComp.uniqueID === this.simpleKnoten.uniqueID &&
          fromComp.uniqueID === this.compB.uniqueID)
      ) {
        //simpleKnoten--compB
        circuit.deleteOneWire(wire, index);
      }
      if (this.neighborB) {
        if (
          (fromComp.uniqueID === this.compB.uniqueID &&
            toComp.uniqueID === this.neighborB.uniqueID) ||
          (toComp.uniqueID === this.compB.uniqueID &&
            fromComp.uniqueID === this.neighborB.uniqueID)
        ) {
          //compB--neighborB
          circuit.deleteOneWire(wire, index);
        }
      }
    }
    //STEP 2) swap coord (top and left) btw compA and compB
    const compAx = this.compA.x;
    const compAy = this.compA.y;
    const compBx = this.compB.x;
    const compBy = this.compB.y;
    this.compA.x = compBx;
    this.compA.y = compBy;
    this.compB.x = compAx;
    this.compB.y = compAy;
    //reset selected
    this.compA.selected = false;
    this.compB.selected = false;
    circuit.components.map(c => c.recalculatePins());

    //STEP 3) create deleted Wires again : neighborA--compB--simpleKnoten--compA--neighborB
    //model: neighborA*neighborAPin--futurePinOutB*compB*futurePinInB--simpleKnoten--futurePinInA*compA*futurePinOutA--neighborBPin*neighborB

    circuit.createOneWire(this.compB, this.futurePinInB, this.simpleKnoten, 0);
    circuit.createOneWire(this.simpleKnoten, 0, this.compA, this.futurePinInA);

    if (this.neighborA && this.neighborB) {
      if (
        this.neighborA.uniqueID === this.compB.uniqueID &&
        this.neighborB.uniqueID === this.compA.uniqueID
      ) {
        circuit.createOneWire(
          this.compA,
          this.futurePinOutA,
          this.compB,
          this.futurePinOutB
        );
        return;
      }
    }

    if (this.neighborA) {
      circuit.createOneWire(
        this.neighborA,
        this.neighborAPin,
        this.compB,
        this.futurePinOutB
      );
    }
    if (this.neighborB) {
      circuit.createOneWire(
        this.compA,
        this.futurePinOutA,
        this.neighborB,
        this.neighborBPin
      );
    }
  }
}
