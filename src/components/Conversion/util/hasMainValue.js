export { hasMainVal };

const hasMainVal = selectedComp => {
  if (selectedComp.length < 2) {
    return false;
  } else {
    let errorString = [];
    selectedComp.forEach(comp => {
      const result = comp.assertMainValueStr();
      if (result) {
        errorString.push(result);
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
  }
};
