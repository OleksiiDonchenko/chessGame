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
  return (
    <div className={['cell', cell.color,
      selected ? 'selected' : '',
      cell.available && cell.figure ? 'attacked' : ''].join(' ')}
      onClick={() => click(cell)}
    >
      <span className='index'>{x};{y}</span>
      {cell.available && !cell.figure && <div className={'available'} />}
      {cell.figure?.logo && <img src={cell.figure.logo} alt="" />}
    </div>
  );
};

export default CellComponent;