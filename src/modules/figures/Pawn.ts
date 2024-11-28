import { Figure, FigureNames } from "./Figure";
import { Cell } from "../Cell";
import { Colors } from "../Colors";
import blackLogo from '../../assets/black_pawn.png';
import whiteLogo from '../../assets/white_pawn.png';

export class Pawn extends Figure {

  isFirstStep: boolean = true;

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.PAWN;
  }

  canMove(target: Cell): boolean {
    if (!super.canMove(target))
      return false;
    const direction = this.cell.figure?.color === Colors.BLACK ? 1 : -1;
    const firstStepDirection = this.cell.figure?.color === Colors.BLACK ? 2 : -2;
    const canMoveWithoutCheck: boolean = this.cell.board.canMoveWithoutCheck(this.cell, this.color);
    const moveForward: boolean = target.y === this.cell.y + direction
      && target.x === this.cell.x
      && this.cell.board.getCell(target.x, target.y).isEmpty()
      && target.figure?.name !== 'King';
    const moveForward2Cells: boolean = this.isFirstStep
      && target.y === this.cell.y + firstStepDirection
      && target.x === this.cell.x
      && this.cell.board.getCell(target.x, target.y).isEmpty()
      && this.cell.board.getCell(target.x, this.cell.y + direction).isEmpty();
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
      if (attack && attackerCellOnKing) {
        return true;
      }
    }

    // The hit in passing
    if (this.cell.y === 3 && this.cell.figure?.color === 'white'
      || this.cell.y === 4 && this.cell.figure?.color === 'black') {
      if (this.cell.board.inPassingTarget
        && target.x === this.cell.board.inPassingTarget?.x
        && target.y === this.cell.board.inPassingTarget?.y) {
        return true;
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
      this.cell.board.inPassingTarget = this.cell.board.getCell(this.cell.x, this.cell.y + direction);
    } else {
      this.cell.board.inPassingTarget = null;
    }

    // Checking whether hit was in passing
    if (this.cell.board.inPassingTarget && target.x === this.cell.board.inPassingTarget?.x && target.y === this.cell.board.inPassingTarget?.y) {
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
}