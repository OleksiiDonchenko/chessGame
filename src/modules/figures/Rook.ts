import { Figure, FigureNames } from "./Figure"
import { Colors } from "../Colors";
import { Cell } from "../Cell";
import blackLogo from '../../assets/black_rook.png';
import whiteLogo from '../../assets/white_rook.png';

export class Rook extends Figure {
  longCastle: boolean;
  shortCastle: boolean;
  firstMove: boolean;
  castleMove: boolean;

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.ROOK;
    this.value = 5;
    this.longCastle = true;
    this.shortCastle = true;
    this.firstMove = false;
    this.castleMove = false;
  }

  canMove(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    const movesOfRook = (this.cell.isEmptyVertical(target, this.color) || this.cell.isEmptyHorizontal(target, this.color));
    const canBlockCheck: boolean = this.cell.board.canBlockCheck(target, this.color);
    const canMoveWithoutCheck: boolean = this.cell.board.canMoveWithoutCheck(this.cell, target, this.color);
    const attackerCellOnKing: boolean = this.cell.board.attackerCellOnKing(target, this.color);

    if (!this.cell.board.findKing(this.color)?.isKingInCheck) {
      if (movesOfRook && canMoveWithoutCheck)
        return true;
    } else {
      if (movesOfRook && canBlockCheck && canMoveWithoutCheck)
        return true;
      if (movesOfRook && attackerCellOnKing && canMoveWithoutCheck)
        return true;
    }
    return false;
  }

  moveFigure(target: Cell): void {
    // Do the basic figure movement
    super.moveFigure(target);

    if (this.cell.x === 0 && this.cell.y === 0 && this.color === Colors.BLACK
      || this.cell.x === 0 && this.cell.y === 7 && this.color === Colors.WHITE) {
      this.shortCastle = false;
      this.longCastle = false;
    } else if (this.cell.x === 7 && this.cell.y === 0 && this.color === Colors.BLACK
      || this.cell.x === 7 && this.cell.y === 7 && this.color === Colors.WHITE) {
      this.shortCastle = false;
      this.longCastle = false;
    }
  }

  canAttack(target: Cell): boolean {
    if (!super.canAttack(target))
      return false;
    if (this.cell.isEmptyVertical(target, this.color) || this.cell.isEmptyHorizontal(target, this.color))
      return this.cell.isPathClear(target, this.color);
    return false;
  }
}