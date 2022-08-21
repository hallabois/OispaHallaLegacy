export default class Tile {
  x: number;
  y: number;
  value: number;
  previousPosition: {x: number, y: number};
  mergedFrom: any;

  id: number;
  constructor(position, value, id = null) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;
    this.id = id;

    this.previousPosition = null;
    this.mergedFrom = null; // Tracks tiles that merged together
  }
  savePosition() {
    this.previousPosition = { x: this.x, y: this.y };
  }
  updatePosition(position) {
    this.x = position.x;
    this.y = position.y;
  }
  serialize() {
    return {
      position: {
        x: this.x,
        y: this.y
      },
      value: this.value
    };
  }
}




