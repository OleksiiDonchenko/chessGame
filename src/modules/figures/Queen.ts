import { Figure, FigureNames } from "./Figure";
import { Colors } from "../Colors";
import { Cell } from "../Cell";
import blackLogo from '../../assets/black_queen.png';
import whiteLogo from '../../assets/white_queen.png';

export class Queen extends Figure {

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.QUEEN;
  }

  canMove(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    const movesOfQueen = (this.cell.isEmptyVertical(target) || this.cell.isEmptyHorizontal(target) || this.cell.isEmptyDiagonal(target));
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

    if (this.cell.isEmptyVertical(target) || this.cell.isEmptyHorizontal(target) || this.cell.isEmptyDiagonal(target)) {
      return this.cell.isPathClear(target);
    }

    return false;
  }
}