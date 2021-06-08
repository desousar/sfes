export { distanceBtw2Points };

const distanceBtw2Points = (pointA, pointB) => {
  return Math.abs(
    Math.sqrt(
      Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)
    )
  );
};
