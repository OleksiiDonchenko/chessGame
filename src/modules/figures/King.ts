import { Cell } from "../Cell";
import { Colors } from "../Colors";
import { Figure, FigureNames } from "./Figure";
import blackLogo from '../../assets/black_king.png';
import whiteLogo from '../../assets/white_king.png';

export class King extends Figure {

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.KING;
  }

  canMove(target: Cell): boolean {
    if (!super.canMove(target))
      return false;

    const dx = Math.abs(target.x - this.cell.x);
    const dy = Math.abs(target.y - this.cell.y);

    if ((dx === 1 && dy <= 1) || (dy === 1 && dx <= 1)) {
      if (target.isEmpty() || this.cell.isEnemy(target)) {
        if (!this.cell.board.isUnderAttack(target, this.color)) {
          return true;
        }
      }
    }

    return false;
  }

  canAttack(target: Cell): boolean {
    const dx = Math.abs(target.x - this.cell.x);
    const dy = Math.abs(target.y - this.cell.y);

    return dx <= 1 && dy <= 1;
  }
}