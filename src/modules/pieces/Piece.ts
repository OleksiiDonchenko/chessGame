import logo from '../../assets/black_king.png'
import { Square } from '../board/Square';
import { Colors } from "../Colors";

export enum FigureNames {
  FIGURE = 'Figure',
  KING = 'King',
  QUEEN = 'Queen',
  ROOK = 'Rook',
  BISHOP = 'Bishop',
  KNIGHT = 'Knight',
  PAWN = 'Pawn',
}

export class Figure {
  color: Colors;
  logo: typeof logo | null;
  square: Square;
  name: FigureNames;
  id: number;
  value: number;
  isItPromotionFigure: boolean;

  constructor(color: Colors, square: Square) {
    this.color = color;
    this.square = square;
    this.square.figure = this;
    this.logo = null;
    this.name = FigureNames.FIGURE;
    this.id = Math.random();
    this.value = 0;
    this.isItPromotionFigure = false;
  }

  canMove(target: Square): boolean {
    if (target.figure?.color === this.color && this.name !== 'King')
      return false;
    return true;
  }

  moveFigure(target: Square) {
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

  getCopy(): Figure {
    const copy = new Figure(this.color, this.square);
    copy.isItPromotionFigure = this.isItPromotionFigure;
    copy.id = this.id;
    return copy;
  };
}