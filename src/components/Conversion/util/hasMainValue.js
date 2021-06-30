export { hasMainVal };

const hasMainVal = selectedComp => {
  let errorString = [];
  selectedComp.forEach(comp => {
    if (comp.isMultiPin === false) {
      const result = comp.assertMainValueStr();
      if (result) {
        errorString.push(result);
      }
    }
  });
  if (errorString.length !== 0) {
    let string = 'WARNING:\n';
    errorString.forEach(eS => {
      string += eS + '\n';
    });
    string += '';
    alert(string);
  } else {
    return true;
  }
};
