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

    // Move forward
    if (target.y === this.cell.y + direction && target.x === this.cell.x && this.cell.board.getCell(target.x, target.y).isEmpty()) {
      return true;
    }

    // Move forward 2 cells
    if (this.isFirstStep
      && target.y === this.cell.y + firstStepDirection
      && target.x === this.cell.x
      && this.cell.board.getCell(target.x, target.y).isEmpty() && this.cell.board.getCell(target.x, this.cell.y + direction).isEmpty()) {
      return true;
    }

    // Attack
    if (target.y === this.cell.y + direction
      && (target.x === this.cell.x + 1 || target.x === this.cell.x - 1)
      && this.cell.isEnemy(target)) {
      return true;
    }

    // The hit in passing
    if (this.cell.board.inPassingTarget && target.x === this.cell.board.inPassingTarget?.x && target.y === this.cell.board.inPassingTarget?.y &&
      Math.abs(this.cell.x - target.x) === 1 && this.cell.board.getCell(target.x, this.cell.y).figure?.color !== this.color) {
      return true;
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