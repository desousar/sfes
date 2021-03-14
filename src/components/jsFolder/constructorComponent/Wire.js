export default class Wire {
  static FROM_TO_TO = 0;
  static To_TO_FROM = 1;

  constructor({ from, to }) {
    this.from = from;
    this.to = to;
  }
}
