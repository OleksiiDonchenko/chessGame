import logo from '../../assets/black_king.png'
import { Square } from '../board/Square';
import { Colors } from "../Colors";

export enum PieceNames {
  PIECE = 'Piece',
  KING = 'King',
  QUEEN = 'Queen',
  ROOK = 'Rook',
  BISHOP = 'Bishop',
  KNIGHT = 'Knight',
  PAWN = 'Pawn',
}

export class Piece {
  color: Colors;
  logo: typeof logo | null;
  square: Square;
  name: PieceNames;
  id: number;
  value: number;
  isItPromotionPiece: boolean;

  constructor(color: Colors, square: Square) {
    this.color = color;
    this.square = square;
    this.square.piece = this;
    this.logo = null;
    this.name = PieceNames.PIECE;
    this.id = Math.random();
    this.value = 0;
    this.isItPromotionPiece = false;
  }

  canMove(target: Square): boolean {
    if (target.piece?.color === this.color && this.name !== 'King')
      return false;
    return true;
  }

  movePiece(target: Square) {
    target;
    this.square.board.enPassantTarget = null;
    const kingSquare = this.square.board.findKing(this.color);
    if (kingSquare?.isKingInCheck) {
      kingSquare.isKingInCheck = false;
    }
  }

  canAttack(target: Square): boolean {
    target;
    return true;
  }

  getCopy(): Piece {
    const copy = new Piece(this.color, this.square);
    copy.isItPromotionPiece = this.isItPromotionPiece;
    copy.id = this.id;
    return copy;
  };
}