
enum OrderType {
  movePallet = 1,
  moveForklift,
  charge,
}

export class Order {
  type: OrderType;
  forkliftId: string;
  palletId: string;
  startVertexId: string;
  endVertexId: string;
  
  constructor(type: OrderType, forkliftId: string, palletId: string, startVertexId: string, endVertexId: string) {
    this.type = type;
    this.forkliftId = forkliftId;
    this.palletId = palletId;
    this.startVertexId = startVertexId;
    this.endVertexId = endVertexId;
  }

}
