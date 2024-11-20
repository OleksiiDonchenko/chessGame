import { Figure, FigureNames } from "./Figure"
import { Colors } from "../Colors";
import { Cell } from "../Cell";
import blackLogo from '../../assets/black_rook.png';
import whiteLogo from '../../assets/white_rook.png';

export class Rook extends Figure {

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.ROOK;
  }

  canMove(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    if (this.cell.isEmptyVertical(target) || this.cell.isEmptyHorizontal(target))
      return true;
    return false;
  }

  canAttack(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    if (this.cell.isEmptyVertical(target) || this.cell.isEmptyHorizontal(target))
      return this.cell.isPathClear(target);
    return false;
  }
}