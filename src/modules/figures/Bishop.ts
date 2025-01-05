import { Cell } from "../Cell";
import { Colors } from "../Colors";
import { Figure, FigureNames } from "./Figure";
import blackLogo from '../../assets/black_bishop.png';
import whiteLogo from '../../assets/white_bishop.png';

export class Bishop extends Figure {

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.BISHOP;
  }

  canMove(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    if (!this.cell.board.findKing(this.color)?.isKingInCheck) {
      if (this.cell.isEmptyDiagonal(target, this.color) && this.cell.board.canMoveWithoutCheck(this.cell, target, this.color))
        return true;
    } else {
      if (this.cell.isEmptyDiagonal(target, this.color) && this.cell.board.canBlockCheck(target, this.color))
        return true;
      if (this.cell.isEmptyDiagonal(target, this.color) && this.cell.board.attackerCellOnKing(target, this.color))
        return true;
    }
    return false;
  }

  canAttack(target: Cell): boolean {
    if (!super.canAttack(target))
      return false;
    if (this.cell.isEmptyDiagonal(target, this.color))
      return this.cell.isPathClear(target, this.color);
    return false;
  }
}