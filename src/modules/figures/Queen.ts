import { Figure, FigureNames } from "./Figure";
import { Colors } from "../Colors";
import { Cell } from "../Cell";
import blackLogo from '../../assets/black_queen.png';
import whiteLogo from '../../assets/white_queen.png';

export class Queen extends Figure {
  isItPromotionFigure: boolean;

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.QUEEN;
    this.value = 9;
    this.isItPromotionFigure = false;
  }

  canMove(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    const movesOfQueen = (this.cell.isEmptyVertical(target, this.color) || this.cell.isEmptyHorizontal(target, this.color) || this.cell.isEmptyDiagonal(target, this.color));
    const canBlockCheck: boolean = this.cell.board.canBlockCheck(target, this.color);
    const canMoveWithoutCheck: boolean = this.cell.board.canMoveWithoutCheck(this.cell, target, this.color);
    const attackerCellOnKing: boolean = this.cell.board.attackerCellOnKing(target, this.color);

    if (!this.cell.board.findKing(this.color)?.isKingInCheck) {
      if (movesOfQueen && canMoveWithoutCheck)
        return true;
    } else {
      if (movesOfQueen && canBlockCheck && canMoveWithoutCheck)
        return true;
      if (movesOfQueen && attackerCellOnKing && canMoveWithoutCheck) {
        return true;
      }
    }
    return false;
  }

  canAttack(target: Cell): boolean {
    if (!super.canAttack(target))
      return false;

    if (this.cell.isEmptyVertical(target, this.color) || this.cell.isEmptyHorizontal(target, this.color) || this.cell.isEmptyDiagonal(target, this.color)) {
      return this.cell.isPathClear(target, this.color);
    }

    return false;
  }

  getCopy(): Queen {
    const copy = new Queen(this.color, this.cell);
    copy.isItPromotionFigure = this.isItPromotionFigure;
    return copy;
  }
}