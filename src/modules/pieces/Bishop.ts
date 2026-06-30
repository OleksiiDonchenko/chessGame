import { Square } from "../board/Square";
import { Colors } from "../Colors";
import { Piece, PieceNames } from "./Piece";
import blackLogo from '../../assets/black_bishop.png';
import whiteLogo from '../../assets/white_bishop.png';

export class Bishop extends Piece {
  isItPromotionPiece: boolean;

  constructor(color: Colors, square: Square) {
    super(color, square);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = PieceNames.BISHOP;
    this.value = 3.2;
    this.isItPromotionPiece = false;
  }

  canMove(target: Square): boolean {
    if (!super.canMove(target))
      return false;
    const movesOfBishop = this.square.isEmptyDiagonal(target, this.color);
    const canMoveWithoutCheck: boolean = this.square.board.canMoveWithoutCheck(this.square, target, this.color);
    if (!this.square.board.findKing(this.color)?.isKingInCheck) {
      if (movesOfBishop && canMoveWithoutCheck)
        return true;
    } else {
      if (movesOfBishop && this.square.board.canBlockCheck(target, this.color) && canMoveWithoutCheck)
        return true;
      if (movesOfBishop && this.square.board.attackerSquareOnKing(target, this.color) && canMoveWithoutCheck)
        return true;
    }
    return false;
  }

  canAttack(target: Square): boolean {
    if (!super.canAttack(target))
      return false;
    if (this.square.isEmptyDiagonal(target, this.color))
      return this.square.isPathClear(target, this.color);
    return false;
  }

  getCopy(): Bishop {
    const copy = new Bishop(this.color, this.square);
    copy.isItPromotionPiece = this.isItPromotionPiece;
    return copy;
  }
}