
export enum OrderTypes {
  movePallet = 1,
  moveForklift,
  charge,
}

export class Order {
  static types = OrderTypes;
  type: OrderTypes;
  forkliftId: string;
  palletId: string;
  startVertexId: string;
  endVertexId: string;
  
  constructor(type: OrderTypes, forkliftId: string, palletId: string, startVertexId: string, endVertexId: string) {
    this.type = type;
    this.forkliftId = forkliftId;
    this.palletId = palletId;
    this.startVertexId = startVertexId;
    this.endVertexId = endVertexId;
  }

}
