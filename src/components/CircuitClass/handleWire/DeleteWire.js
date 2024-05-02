export default function deleteOneWire(wireToDelete) {
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
    if (fromComp.uniqueID === compUnderTest.uniqueID) {
      if (compUnderTest.isMultiPin === false) {
        fromPinNB === 0
          ? (compUnderTest.showPin1 = true)
          : (compUnderTest.showPin2 = true);
      }
    } else if (toComp.uniqueID === compUnderTest.uniqueID) {
      if (compUnderTest.isMultiPin === false) {
        toPinNB === 0
          ? (compUnderTest.showPin1 = true)
          : (compUnderTest.showPin2 = true);
      }
    }
  }
  let index = -1;
  this.wires.forEach((wire, i) => {
    if (wireToDelete === wire) {
      index = i;
    }
  });
  this.wires.splice(index, 1); //delete line graphical
  this.components.forEach((comp) => {
    comp.resetCalculatedValues();
  });
}
