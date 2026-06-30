import { useDroppable } from '@dnd-kit/core';
import { FC, ReactNode, useEffect } from 'react';
import { Square } from '../../modules/board/Square';

interface DroppableSquareProps {
  square: Square;
  id: string;
  children?: ReactNode;
  color: string;
  selected: boolean;
  isAvailable: boolean;
  isKingInCheck: boolean;
  isCheckmate: boolean;
  resign: boolean;
  losingByTime: boolean;
  isVictory: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  handleStopGame: () => void;
  coordinates: { x: number; y: number };
  mouseDown: (square: Square) => void;
}

const DroppableSquare: FC<DroppableSquareProps> = ({ square, id, children, color, selected, isAvailable, isKingInCheck, isCheckmate, resign, losingByTime, isVictory, isStalemate, isDraw, handleStopGame, coordinates, mouseDown }) => {
  const { setNodeRef, isOver, active } = useDroppable({ id, });
  const numbers = [8, 7, 6, 5, 4, 3, 2, 1];
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  useEffect(() => {
    if (isCheckmate || isStalemate) {
      handleStopGame();
    }
  }, [isCheckmate, isStalemate]);

  return (
    <div
      ref={setNodeRef}
      className={[
        'square',
        color,
        selected && square.piece ? 'selected' : '',
        isAvailable && !square.piece ? 'available' : '',
        isAvailable && isOver ? 'over-available-square' : '',
        isAvailable && square.piece ? 'attacked' : '',
        isKingInCheck ? 'check' : '',
        isVictory ? 'victoriousKing' : '',
        isCheckmate && square.piece?.color === 'white' ? 'defeatedWhiteKing' : isCheckmate && square.piece?.color === 'black' ? 'defeatedBlackKing' : '',
        losingByTime && square.piece?.color === 'white' ? 'losingByTime' : losingByTime && square.piece?.color === 'black' ? 'losingByTime' : '',
        isStalemate ? 'stalemate' : '',
        isDraw ? 'stalemate' : '',
        resign ? 'resign' : '',
      ].filter(Boolean).join(' ')}
      onMouseDown={() => mouseDown(square)}
    >
      {square.piece && square.piece.logo && active &&
        <img
          className='background-piece'
          src={square.piece.logo}
          alt='background-piece'
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

export default DroppableSquare;