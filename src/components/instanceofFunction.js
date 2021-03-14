export {
  isResistor,
  isCurrentSource,
  isVoltageSource,
  isAmpermeter,
  isVoltmeter,
  isKnoten,
  isKlemme,
};

import Ampermeter from "./jsFolder/constructorComponent/jsComponents/Ampermeter";
import CurrentSource from "./jsFolder/constructorComponent/jsComponents/CurrentSource";
import Klemme from "./jsFolder/constructorComponent/jsComponents/Klemme";
import Knoten from "./jsFolder/constructorComponent/jsComponents/Knoten";
import Resistor from "./jsFolder/constructorComponent/jsComponents/Resistor";
import VoltageSource from "./jsFolder/constructorComponent/jsComponents/VoltageSource";
import Voltmeter from "./jsFolder/constructorComponent/jsComponents/Voltmeter";

const isResistor = (comp) => {
  return comp instanceof Resistor;
};
const isCurrentSource = (comp) => {
  return comp instanceof CurrentSource;
};
const isVoltageSource = (comp) => {
  return comp instanceof VoltageSource;
};
const isAmpermeter = (comp) => {
  return comp instanceof Ampermeter;
};
const isVoltmeter = (comp) => {
  return comp instanceof Voltmeter;
};
const isKnoten = (comp) => {
  return comp instanceof Knoten;
};
const isKlemme = (comp) => {
  return comp instanceof Klemme;
};
