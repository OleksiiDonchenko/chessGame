import { Figure, FigureNames } from "./Figure";
import { Cell } from "../Cell";
import { Colors } from "../Colors";
import blackLogo from '../../assets/black_pawn.png';
import whiteLogo from '../../assets/white_pawn.png';

export class Pawn extends Figure {

  isFirstStep: boolean;
  isItCapture: boolean;

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.PAWN;
    this.value = 1;
    this.isFirstStep = true;
    this.isItCapture = false;
  }

  canMove(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    const direction = this.cell.figure?.color === Colors.BLACK ? 1 : -1;
    const firstStepDirection = this.cell.figure?.color === Colors.BLACK ? 2 : -2;
    const canMoveWithoutCheck: boolean = this.cell.board.canMoveWithoutCheck(this.cell, target, this.color);
    const moveForward: boolean = target.y === this.cell.y + direction
      && target.x === this.cell.x
      && this.cell.board.getCell(target.x, target.y).isEmpty(true, this.color)
      && target.figure?.name !== 'King';
    const moveForward2Cells: boolean = this.isFirstStep
      && target.y === this.cell.y + firstStepDirection
      && target.x === this.cell.x
      && this.cell.board.getCell(target.x, target.y).isEmpty(true, this.color)
      && this.cell.board.getCell(target.x, this.cell.y + direction).isEmpty(true, this.color);
    const attack: boolean = target.y === this.cell.y + direction
      && (target.x === this.cell.x + 1 || target.x === this.cell.x - 1)
      && this.cell.isEnemy(target);
    const canBlockCheck: boolean = this.cell.board.canBlockCheck(target, this.color);
    const attackerCellOnKing: boolean = this.cell.board.attackerCellOnKing(target, this.color);

    if (!this.cell.board.findKing(this.color)?.isKingInCheck) {
      if (moveForward && canMoveWithoutCheck) {
        return true;
      }
      if (moveForward2Cells && canMoveWithoutCheck) {
        return true;
      }
      if (attack && canMoveWithoutCheck) {
        return true;
      }
    } else {
      if (moveForward && canBlockCheck) {
        return true;
      }
      if (moveForward2Cells && canBlockCheck) {
        return true;
      }
      if (attack && attackerCellOnKing && canMoveWithoutCheck) {
        return true;
      }
    }

    // The hit in passing
    if (this.cell.y === 3 && this.cell.figure?.color === 'white'
      || this.cell.y === 4 && this.cell.figure?.color === 'black') {
      if (this.cell.figure?.color === 'white') {
        if (this.cell.board.enPassantTarget
          && target.x === this.cell.board.enPassantTarget?.x && this.cell.board.enPassantTarget?.x === this.cell.x + 1
          && target.y === this.cell.board.enPassantTarget?.y && this.cell.board.enPassantTarget?.y === 2 ||
          this.cell.board.enPassantTarget
          && target.x === this.cell.board.enPassantTarget?.x && this.cell.board.enPassantTarget?.x === this.cell.x - 1
          && target.y === this.cell.board.enPassantTarget?.y && this.cell.board.enPassantTarget?.y === 2) {
          return true;
        }
      } else if (this.cell.figure?.color === 'black') {
        if (this.cell.board.enPassantTarget
          && target.x === this.cell.board.enPassantTarget?.x && this.cell.board.enPassantTarget?.x === this.cell.x + 1
          && target.y === this.cell.board.enPassantTarget?.y && this.cell.board.enPassantTarget?.y === 5 ||
          this.cell.board.enPassantTarget
          && target.x === this.cell.board.enPassantTarget?.x && this.cell.board.enPassantTarget?.x === this.cell.x - 1
          && target.y === this.cell.board.enPassantTarget?.y && this.cell.board.enPassantTarget?.y === 5) {
          return true;
        }
      }
    }

    return false;
  }

  moveFigure(target: Cell): void {
    // Do the basic figure movement
    super.moveFigure(target);
    // Pawn did first step
    this.isFirstStep = false;

    const direction = this.color === Colors.BLACK ? 1 : -1;

    // Checking whether a move of 2 cells
    if (Math.abs(target.y - this.cell.y) === 2) {
      this.cell.board.enPassantTarget = this.cell.board.getCell(this.cell.x, this.cell.y + direction);
    } else {
      this.cell.board.enPassantTarget = null;
    }

    // Checking whether hit was in passing
    if (this.cell.board.enPassantTarget && target.x === this.cell.board.enPassantTarget?.x && target.y === this.cell.board.enPassantTarget?.y) {
      const enemyCell = this.cell.board.getCell(target.x, target.y - direction);
      if (enemyCell.figure instanceof Pawn && enemyCell.figure.color !== this.color) {
        enemyCell.figure = null;
      }
    }
  }

  canAttack(target: Cell): boolean {
    const direction = this.color === Colors.BLACK ? 1 : -1;

    return (target.y === this.cell.y + direction && (target.x === this.cell.x + 1 || target.x === this.cell.x - 1));
  }

  getCopy(): Pawn {
    const copy = new Pawn(this.color, this.cell);
    copy.isFirstStep = this.isFirstStep;
    copy.isItCapture = this.isItCapture;
    return copy;
  }
}