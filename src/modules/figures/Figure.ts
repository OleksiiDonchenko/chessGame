import logo from '../../assets/black_king.png'
import { Cell } from '../Cell';
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
  cell: Cell;
  name: FigureNames;
  id: number;
  value: number;
  isItPromotionFigure: boolean;

  constructor(color: Colors, cell: Cell) {
    this.color = color;
    this.cell = cell;
    this.cell.figure = this;
    this.logo = null;
    this.name = FigureNames.FIGURE;
    this.id = Math.random();
    this.value = 0;
    this.isItPromotionFigure = false;
  }

  canMove(target: Cell): boolean {
    if (target.figure?.color === this.color && this.name !== 'King')
      return false;
    return true;
  }

  moveFigure(target: Cell) {
    target;
    this.cell.board.enPassantTarget = null;
    const kingCell = this.cell.board.findKing(this.color);
    if (kingCell?.isKingInCheck) {
      kingCell.isKingInCheck = false;
    }
  }

  canAttack(target: Cell): boolean {
    target;
    return true;
  }

  getCopy(): Figure {
    const copy = new Figure(this.color, this.cell);
    copy.isItPromotionFigure = this.isItPromotionFigure;
    copy.id = this.id;
    return copy;
  };
}