import log from '@/consoleLog';

export default class Permutation {
  constructor(circuit) {
    // circuit will be use to update the circuit
    this.circuit = circuit;

    /*
      n1_pinA_pinIndex--pin0_comp0_pin1--n2_pinA_pinIndex 
      ...rest of circuit...
      n3_pinA_pinIndex--pin0_comp1_pin1--n4_pinA_pinIndex

      comp0 & comp1 <=> selected components => comp0 = selectedArray[0] & comp1 = selectedArray[1]
      n <=> a neighbor
      n1_pinA_pinIndex <=> on the pin (0 for pin[0] or 1 for pin[1]) of this neighboring component
      -- <=> a wire
    */

    this.n1_pinA_pinIndex = undefined; // on conversion will be connected to comp1_pin0
    this.n2_pinA_pinIndex = undefined; // on conversion will be connected to comp1_pin1
    this.n3_pinA_pinIndex = undefined; // on conversion will be connected to comp0_pin0
    this.n4_pinA_pinIndex = undefined; // on conversion will be connected to comp0_pin1

    this.n1 = undefined;
    this.n2 = undefined;
    this.n3 = undefined;
    this.n4 = undefined;
  }

  /**
   * every Conversion Class has at least 2 importants functions:
   * -isPossible()
   * -conversion()
   */

  /**
   * @param {just comp with attribut selected === true} selectedComp_array
   * @param {entire object} circuit
   * @returns true if condition is met :
   *  2 selected 2-pins-comps independently of their position can be permuted
   */
  isPossible() {
    log('---------Permutation---------');
    const selectedComp_array = this.circuit.getSelectedComponents();
    return (
      selectedComp_array.length === 2 && this.isAll2PinsComp(selectedComp_array)
    );
  }

  isAll2PinsComp(selectedComp_array) {
    return selectedComp_array.every((comp) => !comp.isMultiPin);
  }

  /*
    n1_pinA_pinIndex--pin0_comp0_pin1--n2_pinA_pinIndex
    ...rest of circuit...
    n3_pinA_pinIndex--pin0_comp1_pin1--n4_pinA_pinIndex

    comp0 & comp1 <=> selected components => comp0 = selectedArray[0] & comp1 = selectedArray[1]
    n <=> a neighbor
    n1_pinA_pinIndex <=> on the pin (0 or 1) of this neighboring component
    -- <=> a wire
  */

  // this.n1_pinA_pinIndex = undefined; // on conversion will be connected to comp1_pin0
  // this.n2_pinA_pinIndex = undefined; // on conversion will be connected to comp1_pin1
  // this.n3_pinA_pinIndex = undefined; // on conversion will be connected to comp0_pin0
  // this.n4_pinA_pinIndex = undefined; // on conversion will be connected to comp0_pin1

  /*
    after conversion swap comp0 and comp1:
    n1_pinA_pinIndex--pin0_comp1_pin1--n2_pinA_pinIndex .... n3_pinA_pinIndex--pin0_comp0_pin1--n4_pinA_pinIndex
  */
  conversion() {
    const selectedComp_array = this.circuit.getSelectedComponents();

    const comp0 = selectedComp_array[0];
    const comp1 = selectedComp_array[1];

    //STEP 1) find neighbors and pins & delete Wire
    for (let index = this.circuit.wires.length - 1; index >= 0; index--) {
      let wire = this.circuit.wires[index];
      const fromComp = this.circuit.componentFromPin(wire.from);
      const toComp = this.circuit.componentFromPin(wire.to);

      if (fromComp.uniqueID === comp0.uniqueID) {
        // find n1_pinA_pinIndex or n2_pinA_pinIndex
        const pinOfComp0 = this.circuit.pinIndexFromComponent(comp0, wire.from);
        if (pinOfComp0 === 0) {
          this.n1_pinA_pinIndex = this.circuit.pinIndexFromComponent(
            toComp,
            wire.to
          );
          this.n1 = toComp;
        } else {
          this.n2_pinA_pinIndex = this.circuit.pinIndexFromComponent(
            toComp,
            wire.to
          );
          this.n2 = toComp;
        }
        this.circuit.deleteOneWire(wire);
      }

      if (toComp.uniqueID === comp0.uniqueID) {
        // find n1_pinA_pinIndex or n2_pinA_pinIndex
        const pinOfComp0 = this.circuit.pinIndexFromComponent(comp0, wire.to);
        if (pinOfComp0 === 0) {
          this.n1_pinA_pinIndex = this.circuit.pinIndexFromComponent(
            fromComp,
            wire.from
          );
          this.n1 = fromComp;
        } else {
          this.n2_pinA_pinIndex = this.circuit.pinIndexFromComponent(
            fromComp,
            wire.from
          );
          this.n2 = fromComp;
        }
        this.circuit.deleteOneWire(wire);
      }

      if (fromComp.uniqueID === comp1.uniqueID) {
        // find n3_pinA_pinIndex and n4_pinA_pinIndex
        const pinOfComp0 = this.circuit.pinIndexFromComponent(comp1, wire.from);
        if (pinOfComp0 === 0) {
          this.n3_pinA_pinIndex = this.circuit.pinIndexFromComponent(
            toComp,
            wire.to
          );
          this.n3 = toComp;
        } else {
          this.n4_pinA_pinIndex = this.circuit.pinIndexFromComponent(
            toComp,
            wire.to
          );
          this.n4 = toComp;
        }
        this.circuit.deleteOneWire(wire);
      }

      if (toComp.uniqueID === comp1.uniqueID) {
        // find n3_pinA_pinIndex and n4_pinA_pinIndex
        const pinOfComp0 = this.circuit.pinIndexFromComponent(comp1, wire.to);
        if (pinOfComp0 === 0) {
          this.n3_pinA_pinIndex = this.circuit.pinIndexFromComponent(
            fromComp,
            wire.from
          );
          this.n3 = fromComp;
        } else {
          this.n4_pinA_pinIndex = this.circuit.pinIndexFromComponent(
            fromComp,
            wire.from
          );
          this.n4 = fromComp;
        }
        this.circuit.deleteOneWire(wire);
      }
    }
    log('step 1 done');

    //STEP 2) swap rotation and coord (top and left) btw comp0 and comp1
    const comp0rotation = comp0.rotation;
    const comp0x = comp0.x;
    const comp0y = comp0.y;
    const comp1rotation = comp1.rotation;
    const comp1x = comp1.x;
    const comp1y = comp1.y;
    this.circuit.setForPermutation(comp0, comp1rotation, comp1x, comp1y);
    this.circuit.setForPermutation(comp1, comp0rotation, comp0x, comp0y);
    this.circuit.components.map((c) => c.recalculatePins());
    log('step 2 done');

    //STEP 3) create deleted Wires again
    /*
      after conversion swap comp0 and comp1:
      n1_pinA_pinIndex--pin0_comp1_pin1--n2_pinA_pinIndex
      ...rest of circuit...
      n3_pinA_pinIndex--pin0_comp0_pin1--n4_pinA_pinIndex
    */

    if (this.n1) {
      this.circuit.createOneWire(this.n1, this.n1_pinA_pinIndex, comp1, 0);
    }
    if (this.n2) {
      this.circuit.createOneWire(this.n2, this.n2_pinA_pinIndex, comp1, 1);
    }
    if (this.n3) {
      this.circuit.createOneWire(this.n3, this.n3_pinA_pinIndex, comp0, 0);
    }
    if (this.n4) {
      this.circuit.createOneWire(this.n4, this.n4_pinA_pinIndex, comp0, 1);
    }
    log('step 3 done');
  }
}
