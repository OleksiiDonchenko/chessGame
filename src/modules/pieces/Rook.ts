import { Figure, FigureNames } from "./Piece"
import { Colors } from "../Colors";
import { Square } from "../board/Square";
import blackLogo from '../../assets/black_rook.png';
import whiteLogo from '../../assets/white_rook.png';

export class Rook extends Figure {
  longCastle: boolean;
  shortCastle: boolean;
  firstMove: boolean;
  castleMove: boolean;
  isItPromotionFigure: boolean;

  constructor(color: Colors, square: Square) {
    super(color, square);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.ROOK;
    this.value = 5;
    this.longCastle = true;
    this.shortCastle = true;
    this.firstMove = false;
    this.castleMove = false;
    this.isItPromotionFigure = false;
  }

  canMove(target: Square): boolean {
    if (!super.canMove(target))
      return false;
    const movesOfRook = (this.square.isEmptyVertical(target, this.color) || this.square.isEmptyHorizontal(target, this.color));
    const canBlockCheck: boolean = this.square.board.canBlockCheck(target, this.color);
    const canMoveWithoutCheck: boolean = this.square.board.canMoveWithoutCheck(this.square, target, this.color);
    const attackerSquareOnKing: boolean = this.square.board.attackerSquareOnKing(target, this.color);

    if (!this.square.board.findKing(this.color)?.isKingInCheck) {
      if (movesOfRook && canMoveWithoutCheck)
        return true;
    } else {
      if (movesOfRook && canBlockCheck && canMoveWithoutCheck)
        return true;
      if (movesOfRook && attackerSquareOnKing && canMoveWithoutCheck)
        return true;
    }
    return false;
  }

  moveFigure(target: Square): void {
    // Do the basic figure movement
    super.moveFigure(target);

    if (this.square.x === 0 && this.square.y === 0 && this.color === Colors.BLACK
      || this.square.x === 0 && this.square.y === 7 && this.color === Colors.WHITE) {
      this.shortCastle = false;
      this.longCastle = false;
    } else if (this.square.x === 7 && this.square.y === 0 && this.color === Colors.BLACK
      || this.square.x === 7 && this.square.y === 7 && this.color === Colors.WHITE) {
      this.shortCastle = false;
      this.longCastle = false;
    }
  }

  canAttack(target: Square): boolean {
    if (!super.canAttack(target))
      return false;
    if (this.square.isEmptyVertical(target, this.color) || this.square.isEmptyHorizontal(target, this.color))
      return this.square.isPathClear(target, this.color);
    return false;
  }

  getCopy(): Rook {
    const copy = new Rook(this.color, this.square);
    copy.longCastle = this.longCastle;
    copy.shortCastle = this.shortCastle;
    copy.firstMove = this.firstMove;
    copy.castleMove = this.castleMove
    copy.isItPromotionFigure = this.isItPromotionFigure;
    return copy;
  }
}