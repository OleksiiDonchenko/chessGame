import { FC } from 'react';
import { Cell } from '../modules/Cell';

interface CellProps {
  cell: Cell;
  selected: boolean;
  click: (cell: Cell) => void;
  y: number;
  x: number;
}

const CellComponent: FC<CellProps> = ({ cell, selected, click, y, x }) => {
  const numbers = [8, 7, 6, 5, 4, 3, 2, 1];
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className={['cell', cell.color,
      selected ? 'selected' : '',
      cell.available && cell.figure ? 'attacked' : '',
      cell.isKingInCheck ? 'check' : ''].join(' ')}
      onClick={() => click(cell)}
    >
      {numbers.map((number, i) => {
        if (x === 7 && y === i) {
          return <span key={i} className={['number', cell.color === 'black' ? '_white' : '_black'].join(' ')}>{number}</span>
        }
      })}
      {letters.map((letter, i) => {
        if (y === 7 && x === i) {
          return <span key={i} className={['letter', cell.color === 'black' ? '_white' : '_black'].join(' ')}>{letter}</span>
        }
      })}
      {cell.available && !cell.figure && <div className={'available'} />}
      {cell.figure?.logo && <img src={cell.figure.logo} alt="" />}
    </div>
  );
};

export default CellComponent;