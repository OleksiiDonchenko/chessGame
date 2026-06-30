import { Piece, PieceNames } from "./Piece";
import { Colors } from "../Colors";
import { Square } from "../board/Square";
import blackLogo from '../../assets/black_queen.png';
import whiteLogo from '../../assets/white_queen.png';

export class Queen extends Piece {
  isItPromotionPiece: boolean;

  constructor(color: Colors, square: Square) {
    super(color, square);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = PieceNames.QUEEN;
    this.value = 9;
    this.isItPromotionPiece = false;
  }

  canMove(target: Square): boolean {
    if (!super.canMove(target))
      return false;
    const movesOfQueen = (this.square.isEmptyVertical(target, this.color) || this.square.isEmptyHorizontal(target, this.color) || this.square.isEmptyDiagonal(target, this.color));
    const canBlockCheck: boolean = this.square.board.canBlockCheck(target, this.color);
    const canMoveWithoutCheck: boolean = this.square.board.canMoveWithoutCheck(this.square, target, this.color);
    const attackerSquareOnKing: boolean = this.square.board.attackerSquareOnKing(target, this.color);

    if (!this.square.board.findKing(this.color)?.isKingInCheck) {
      if (movesOfQueen && canMoveWithoutCheck)
        return true;
    } else {
      if (movesOfQueen && canBlockCheck && canMoveWithoutCheck)
        return true;
      if (movesOfQueen && attackerSquareOnKing && canMoveWithoutCheck) {
        return true;
      }
    }
    return false;
  }

  canAttack(target: Square): boolean {
    if (!super.canAttack(target))
      return false;

    if (this.square.isEmptyVertical(target, this.color) || this.square.isEmptyHorizontal(target, this.color) || this.square.isEmptyDiagonal(target, this.color)) {
      return this.square.isPathClear(target, this.color);
    }

    return false;
  }

  getCopy(): Queen {
    const copy = new Queen(this.color, this.square);
    copy.isItPromotionPiece = this.isItPromotionPiece;
    return copy;
  }
}