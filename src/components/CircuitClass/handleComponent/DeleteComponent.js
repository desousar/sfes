/**
 * this function delete just 1 component at the time
 * @param {*} componentToDelete
 * @param {index of comp in circuit.components array} index
 */
export default function deleteOneComponent(componentToDelete) {
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
