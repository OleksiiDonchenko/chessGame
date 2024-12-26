import { Figure, FigureNames } from "./Figure";
import { Colors } from "../Colors";
import { Cell } from "../Cell";
import blackLogo from '../../assets/black_knight.png';
import whiteLogo from '../../assets/white_knight.png';

export class Knight extends Figure {

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.KNIGHT;
  }

  canMove(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    const dx = Math.abs(this.cell.x - target.x);
    const dy = Math.abs(this.cell.y - target.y);
    const canBlockCheck: boolean = this.cell.board.canBlockCheck(target, this.color);
    const canMoveWithoutCheck: boolean = this.cell.board.canMoveWithoutCheck(this.cell, target, this.color);
    const attackerCellOnKing: boolean = this.cell.board.attackerCellOnKing(target, this.color);

    if (!this.cell.board.findKing(this.color)?.isKingInCheck) {
      return (dx === 1 && dy === 2) && canMoveWithoutCheck || (dx === 2 && dy === 1 && canMoveWithoutCheck);
    } else {
      if (attackerCellOnKing) {
        return (dx === 1 && dy === 2) && attackerCellOnKing || (dx === 2 && dy === 1) && attackerCellOnKing;
      }
      return (dx === 1 && dy === 2) && canBlockCheck && canMoveWithoutCheck || (dx === 2 && dy === 1) && canBlockCheck && canMoveWithoutCheck;
    }
  }

  canAttack(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    const dx = Math.abs(this.cell.x - target.x);
    const dy = Math.abs(this.cell.y - target.y);

    return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
  }
}