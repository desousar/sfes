export { distanceBtw2Points, middle3Points, centerBtw2Points };

import {
  centerX2PinsComp,
  centerY2PinsComp
} from '../../jsFolder/constructorComponent/Component';

/**
 *
 * @param {pinObject with x and y value} pointA
 * @param {pinObject with x and y value} pointB
 * @returns
 */
const distanceBtw2Points = (pointA, pointB) => {
  return Math.abs(
    Math.sqrt(
      Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)
    )
  );
};

/**
 *
 * @param {pinObject with x and y value} pointA
 * @param {pinObject with x and y value} pointB
 * @returns
 */
const centerBtw2Points = (pointA, pointB) => {
  let x = (pointA.x + pointB.x) / 2;
  let y = (pointA.y + pointB.y) / 2;
  return [x, y];
};

//only with 3 2-Pins-Components
const middle3Points = (pointA, pointB, pointC) => {
  let x = (pointA.x + pointB.x + pointC.x) / 3 + centerX2PinsComp;
  let y = (pointA.y + pointB.y + pointC.y) / 3 + centerY2PinsComp;
  return [x, y];
};
