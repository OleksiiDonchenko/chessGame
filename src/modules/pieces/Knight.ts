import { Figure, FigureNames } from "./Piece";
import { Colors } from "../Colors";
import { Square } from "../board/Square";
import blackLogo from '../../assets/black_knight.png';
import whiteLogo from '../../assets/white_knight.png';

export class Knight extends Figure {
  isItPromotionFigure: boolean;

  constructor(color: Colors, square: Square) {
    super(color, square);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.KNIGHT;
    this.value = 3;
    this.isItPromotionFigure = false;
  }

  canMove(target: Square): boolean {
    if (!super.canMove(target))
      return false;
    const dx = Math.abs(this.square.x - target.x);
    const dy = Math.abs(this.square.y - target.y);
    const canBlockCheck: boolean = this.square.board.canBlockCheck(target, this.color);
    const canMoveWithoutCheck: boolean = this.square.board.canMoveWithoutCheck(this.square, target, this.color);
    const attackerSquareOnKing: boolean = this.square.board.attackerSquareOnKing(target, this.color);

    if (!this.square.board.findKing(this.color)?.isKingInCheck) {
      if (canMoveWithoutCheck) {
        return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
      }
    } else {
      if (attackerSquareOnKing && canMoveWithoutCheck || canBlockCheck && canMoveWithoutCheck) {
        return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
      }
    }
    return false;
  }

  canAttack(target: Square): boolean {
    if (!super.canAttack(target))
      return false;
    const dx = Math.abs(this.square.x - target.x);
    const dy = Math.abs(this.square.y - target.y);

    return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
  }

  getCopy(): Knight {
    const copy = new Knight(this.color, this.square);
    copy.isItPromotionFigure = this.isItPromotionFigure;
    return copy;
  }
}