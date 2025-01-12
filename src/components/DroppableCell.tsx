import { useDroppable } from '@dnd-kit/core';
import { FC, ReactNode } from 'react';
import { Cell } from '../modules/Cell';

interface DroppableCellProps {
  cell: Cell;
  click: (cell: Cell) => void;
  id: string;
  children?: ReactNode;
  color: string;
  selected: boolean;
  isAvailable: boolean;
  isKingInCheck: boolean;
  coordinates: { x: number; y: number };
  mouseDown: (cell: Cell) => void;
}

const DroppableCell: FC<DroppableCellProps> = ({ cell, click, id, children, color, selected, isAvailable, isKingInCheck, coordinates, mouseDown }) => {
  const { setNodeRef, isOver, active } = useDroppable({ id, });
  const numbers = [8, 7, 6, 5, 4, 3, 2, 1];
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div
      ref={setNodeRef}
      className={[
        'cell',
        color,
        selected ? 'selected' : '',
        isAvailable ? 'available' : '',
        isAvailable && isOver ? 'over-available-cell' : '',
        isAvailable && cell.figure && active || isAvailable && cell.figure ? 'attacked' : '',
        isKingInCheck ? 'check' : '',
      ].join(' ')}
      onClick={() => click(cell)}
      onMouseDown={() => mouseDown(cell)}
    >
      {cell.figure && cell.figure.logo && active &&
        <img
          className='background-figure'
          src={cell.figure.logo}
          alt='background-figure'
        />}
      {coordinates.x === 7 && (
        <span
          className={[
            'number',
            color === 'black' ? '_white' : '_black',
          ].join(' ')}
        >
          {numbers[coordinates.y]}
        </span>)}
      {coordinates.y === 7 && (
        <span
          className={[
            'letter',
            color === 'black' ? '_white' : '_black',
          ].join(' ')}
        >
          {letters[coordinates.x]}
        </span>)}
      {children}
    </div >
  );
};

export default DroppableCell;