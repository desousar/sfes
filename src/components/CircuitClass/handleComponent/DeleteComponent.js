/**
 * this function delete just 1 component at the time
 * @param {*} componentToDelete
 * @param {index of comp in circuit.components array} index
 */
function deleteOneComponent(componentToDelete) {
  let index = undefined; // used for graphical
  this.components.forEach((comp, i) => {
    if (componentToDelete.uniqueID === comp.uniqueID) {
      index = i;
    }
  });
  for (let wireIndex = this.wires.length - 1; wireIndex >= 0; wireIndex -= 1) {
    let wireUnderTest = this.wires[wireIndex];
    const fromComp = this.componentFromPin(wireUnderTest.from);
    const fromPin = this.pinIndexFromComponent(fromComp, wireUnderTest.from);
    const toComp = this.componentFromPin(wireUnderTest.to);
    const toPin = this.pinIndexFromComponent(toComp, wireUnderTest.to);
    if (componentToDelete.uniqueID === fromComp.uniqueID) {
      if (toComp.isMultiPin === false) {
        toPin === 0 ? (toComp.showPin1 = true) : (toComp.showPin2 = true);
      }
      this.wires.splice(wireIndex, 1);
    } else if (componentToDelete.uniqueID === toComp.uniqueID) {
      if (fromComp.isMultiPin === false) {
        fromPin === 0 ? (fromComp.showPin1 = true) : (fromComp.showPin2 = true);
      }
      this.wires.splice(wireIndex, 1);
    }
  }
  //graphical suppression
  this.components.splice(index, 1);
  this.components.forEach((comp) => {
    comp.resetCalculatedValues();
  });
}

// only for comp with exacly 2 neighbors
function deleteCompAndSetWireInstead(compToDelete) {
  if (this.getNeighborsOfOneComp(compToDelete.pins).length !== 2) {
    return;
  }
  let n1 = undefined;
  let n1_pinA_pinIndex = undefined;
  let n2 = undefined;
  let n2_pinA_pinIndex = undefined;

  for (let index = this.wires.length - 1; index >= 0; index--) {
    let wire = this.wires[index];
    const fromComp = this.componentFromPin(wire.from);
    const toComp = this.componentFromPin(wire.to);

    if (fromComp.uniqueID === compToDelete.uniqueID) {
      const pinOfComp0 = this.pinIndexFromComponent(compToDelete, wire.from);
      if (pinOfComp0 === 0) {
        //case MultiPin
        if (!n1) {
          n1_pinA_pinIndex = this.pinIndexFromComponent(toComp, wire.to);
          n1 = toComp;
        } else {
          n2_pinA_pinIndex = this.pinIndexFromComponent(toComp, wire.to);
          n2 = toComp;
        }
      } else {
        n2_pinA_pinIndex = this.pinIndexFromComponent(toComp, wire.to);
        n2 = toComp;
      }
    }

    if (toComp.uniqueID === compToDelete.uniqueID) {
      const pinOfComp0 = this.pinIndexFromComponent(compToDelete, wire.to);
      if (pinOfComp0 === 0) {
        //case MultiPin
        if (!n1) {
          n1_pinA_pinIndex = this.pinIndexFromComponent(fromComp, wire.from);
          n1 = fromComp;
        } else {
          n2_pinA_pinIndex = this.pinIndexFromComponent(fromComp, wire.from);
          n2 = fromComp;
        }
      } else {
        n2_pinA_pinIndex = this.pinIndexFromComponent(fromComp, wire.from);
        n2 = fromComp;
      }
    }
  }
  this.deleteOneComponent(compToDelete);
  this.createOneWire(n1, n1_pinA_pinIndex, n2, n2_pinA_pinIndex);
}

export { deleteOneComponent, deleteCompAndSetWireInstead };
