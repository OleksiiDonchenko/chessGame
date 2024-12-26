import { Cell } from "../Cell";
import { Colors } from "../Colors";
import { Figure, FigureNames } from "./Figure";
import blackLogo from '../../assets/black_king.png';
import whiteLogo from '../../assets/white_king.png';

export class King extends Figure {
  hasMoved = false;

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
    const x = target.x - this.cell.x;

    const standardMoves = target.isEmpty() && !this.cell.board.isUnderAttack(target, this.color);

    const whiteRookShortCastle = this.cell.board.findRook(this.color, 7, 7);
    const whiteRookLongCastle = this.cell.board.findRook(this.color, 0, 7);
    const blackRookShortCastle = this.cell.board.findRook(this.color, 7, 0);
    const blackRookLongCastle = this.cell.board.findRook(this.color, 0, 0);

    const whiteShortCastleMove = (x === 2 && dy === 0) && !this.hasMoved
      && whiteRookShortCastle ? this.cell.isPathClear(whiteRookShortCastle?.cell) : false;
    const blackShortCastleMove = (x === 2 && dy === 0) && !this.hasMoved
      && blackRookShortCastle ? this.cell.isPathClear(blackRookShortCastle?.cell) : false;
    const whiteLongCastleMove = (x === -2 && dy === 0) && !this.hasMoved
      && whiteRookLongCastle ? this.cell.isPathClear(whiteRookLongCastle?.cell) : false;
    const blackLongCastleMove = (x === -2 && dy === 0) && !this.hasMoved
      && blackRookLongCastle ? this.cell.isPathClear(blackRookLongCastle?.cell) : false;

    if (this.color === Colors.WHITE) {
      const isWhiteShortCastlePossibleCell = this.cell.board.findCellForKingCastle(5, 7);
      const isWhiteLongCastlePossibleCellOne = this.cell.board.findCellForKingCastle(2, 7);
      const isWhiteLongCastlePossibleCellTwo = this.cell.board.findCellForKingCastle(3, 7);

      if (isWhiteShortCastlePossibleCell && isWhiteLongCastlePossibleCellOne && isWhiteLongCastlePossibleCellTwo)
        if ((dx === 1 && dy <= 1) || (dy === 1 && dx <= 1)
          || whiteShortCastleMove && whiteRookShortCastle?.shortCastle && !this.cell.isKingInCheck
          && !this.cell.board.isUnderAttack(isWhiteShortCastlePossibleCell, this.color)
          || whiteLongCastleMove && whiteRookLongCastle?.longCastle && !this.cell.isKingInCheck
          && !this.cell.board.isUnderAttack(isWhiteLongCastlePossibleCellOne, this.color)
          && !this.cell.board.isUnderAttack(isWhiteLongCastlePossibleCellTwo, this.color)) {
          if (standardMoves || this.cell.isEnemy(target)) {
            return true;
          }
        }
    } else {
      const isBlackShortCastlePossibleCell = this.cell.board.findCellForKingCastle(5, 0);
      const isBlackLongCastlePossibleCellOne = this.cell.board.findCellForKingCastle(2, 0);
      const isBlackLongCastlePossibleCellTwo = this.cell.board.findCellForKingCastle(3, 0);
      if (isBlackShortCastlePossibleCell && isBlackLongCastlePossibleCellOne && isBlackLongCastlePossibleCellTwo) {
        if ((dx === 1 && dy <= 1) || (dy === 1 && dx <= 1)
          || blackShortCastleMove && blackRookShortCastle?.shortCastle && !this.cell.isKingInCheck
          && !this.cell.board.isUnderAttack(isBlackShortCastlePossibleCell, this.color)
          || blackLongCastleMove && blackRookShortCastle?.longCastle && !this.cell.isKingInCheck
          && !this.cell.board.isUnderAttack(isBlackLongCastlePossibleCellOne, this.color)
          && !this.cell.board.isUnderAttack(isBlackLongCastlePossibleCellTwo, this.color)) {
          if (standardMoves || this.cell.isEnemy(target)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  moveFigure(target: Cell): void {
    // Do the basic figure movement
    super.moveFigure(target);
    this.hasMoved = true;

    const whiteRookShortCastle = this.cell.board.findRook(this.color, 7, 7);
    const whiteRookLongCastle = this.cell.board.findRook(this.color, 0, 7);
    const blackRookShortCastle = this.cell.board.findRook(this.color, 7, 0);
    const blackRookLongCastle = this.cell.board.findRook(this.color, 0, 0);

    let cellForRookCastle;

    if (this.color === Colors.WHITE) {
      if (target.x === 6 && target.y === 7 && this.hasMoved && whiteRookShortCastle?.shortCastle) {
        cellForRookCastle = this.cell.board.findCellForRookCastle(5, 7);
        if (cellForRookCastle)
          whiteRookShortCastle.cell.moveFigure(cellForRookCastle);
      }
      if (target.x === 2 && target.y === 7 && this.hasMoved && whiteRookLongCastle?.longCastle) {
        cellForRookCastle = this.cell.board.findCellForRookCastle(3, 7);
        if (cellForRookCastle)
          whiteRookLongCastle.cell.moveFigure(cellForRookCastle);
      }
    } else {
      if (target.x === 6 && target.y === 0 && this.hasMoved && blackRookShortCastle?.shortCastle) {
        cellForRookCastle = this.cell.board.findCellForRookCastle(5, 0);
        if (cellForRookCastle)
          blackRookShortCastle.cell.moveFigure(cellForRookCastle);
      }
      if (target.x === 2 && target.y === 0 && this.hasMoved && blackRookLongCastle?.longCastle) {
        cellForRookCastle = this.cell.board.findCellForRookCastle(3, 0);
        if (cellForRookCastle)
          blackRookLongCastle.cell.moveFigure(cellForRookCastle);
      }
    }
  }

  canAttack(target: Cell): boolean {
    const dx = Math.abs(target.x - this.cell.x);
    const dy = Math.abs(target.y - this.cell.y);

    return dx <= 1 && dy <= 1;
  }
}