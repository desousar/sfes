export {
  isResistor,
  isCurrentSource,
  isVoltageSource,
  isAmpermeter,
  isVoltmeter,
  isKnoten,
  isSimpleKnoten,
  isKnotenWithPotential,
  isKlemme
};

import Ampermeter from '@/components/jsFolder/constructorComponent/jsComponents/Ampermeter';
import CurrentSource from '@/components/jsFolder/constructorComponent/jsComponents/CurrentSource';
import Klemme from '@/components/jsFolder/constructorComponent/jsComponents/Klemme';
import Knoten from '@/components/jsFolder/constructorComponent/jsComponents/Knoten';
import Resistor from '@/components/jsFolder/constructorComponent/jsComponents/Resistor';
import VoltageSource from '@/components/jsFolder/constructorComponent/jsComponents/VoltageSource';
import Voltmeter from '@/components/jsFolder/constructorComponent/jsComponents/Voltmeter';

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

const isSimpleKnoten = (comp) => {
  return isKnoten(comp) && comp.valuePotentialSource === undefined;
};

const isKnotenWithPotential = (comp) => {
  return isKnoten(comp) && comp.valuePotentialSource;
};

const isKlemme = (comp) => {
  return comp instanceof Klemme;
};
