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
      if (this.cell.isEmptyDiagonal(target) && this.cell.board.canMoveWithoutCheck(this.cell, this.color))
        return true;
    } else {
      if (this.cell.isEmptyDiagonal(target) && this.cell.board.canBlockCheck(target, this.color))
        return true;
      if (this.cell.isEmptyDiagonal(target) && this.cell.board.attackerCellOnKing(target, this.color))
        return true;
    }
    return false; 0
  }

  canAttack(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    if (this.cell.isEmptyDiagonal(target))
      return this.cell.isPathClear(target);
    return false;
  }
}