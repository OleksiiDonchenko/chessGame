import { Cell } from "../Cell";
import { Colors } from "../Colors";
import { Figure, FigureNames } from "./Figure";
import blackLogo from '../../assets/black_bishop.png';
import whiteLogo from '../../assets/white_bishop.png';

export class Bishop extends Figure {
  isItPromotionFigure: boolean;

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.BISHOP;
    this.value = 3.2;
    this.isItPromotionFigure = false;
  }

  canMove(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    const movesOfBishop = this.cell.isEmptyDiagonal(target, this.color);
    const canMoveWithoutCheck: boolean = this.cell.board.canMoveWithoutCheck(this.cell, target, this.color);
    if (!this.cell.board.findKing(this.color)?.isKingInCheck) {
      if (movesOfBishop && canMoveWithoutCheck)
        return true;
    } else {
      if (movesOfBishop && this.cell.board.canBlockCheck(target, this.color) && canMoveWithoutCheck)
        return true;
      if (movesOfBishop && this.cell.board.attackerCellOnKing(target, this.color) && canMoveWithoutCheck)
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

  getCopy(): Bishop {
    const copy = new Bishop(this.color, this.cell);
    copy.isItPromotionFigure = this.isItPromotionFigure;
    return copy;
  }
}