export class Point {
  constructor({ x, y, size, rightEdge, bottomEdge, index, blockIndex }) {
    this.x = Math.floor(x);
    this.y = Math.floor(y);
    this.index = index;
    this.size = Math.floor(size);
    this.halfSize = Math.floor(size / 2);
    this.blockIndex = blockIndex;

    this.isOnLeftEdge = x === 0;
    this.isOnTopEdge = y === 0;
    this.isOnRightEdge = x === rightEdge;
    this.isOnBottomEdge = y === bottomEdge;

    this.isTopLeftCorner = this.isOnLeftEdge && this.isOnTopEdge;
    this.isTopRightCorner = this.isOnRightEdge && this.isOnTopEdge;
    this.isBottomLeftCorner = this.isOnLeftEdge && this.isOnBottomEdge;
    this.isBottomRightCorner = this.isOnRightEdge && this.isOnBottomEdge;

    this.isCorner =
      this.isTopLeftCorner ||
      this.isTopRightCorner ||
      this.isBottomLeftCorner ||
      this.isBottomRightCorner;
  }

  draw(ctx, colour) {
    if (colour) {
      ctx.fillStyle = colour;
    } else {
      ctx.fillStyle = "white";
      if (this.isCorner) {
        ctx.fillStyle = "blue";
      } else if (this.isOnLeftEdge) {
        ctx.fillStyle = "red";
      } else if (this.isOnTopEdge) {
        ctx.fillStyle = "green";
      } else if (this.isOnRightEdge) {
        ctx.fillStyle = "pink";
      } else if (this.isOnBottomEdge) {
        ctx.fillStyle = "purple";
      }
    }

    ctx.fillRect(
      this.x - this.halfSize,
      this.y - this.halfSize,
      this.size,
      this.size
    );
  }
}
