import React, { } from 'react';
import { useChessContext } from '../../context/ChessContext';
import PromotionModal from '../promotion/PromotionModal';
import { DndContext } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import DroppableSquare from './DroppableSquare';
import DraggablePiece from './DraggablePiece';

function ChessBoard() {

  // useChessContext
  const { board, boardRef, clickOnTheBoard, promotionSquare, handlePromotion, selectedSquare, mouseDown, handleStopGame, handleDragStart, handleDragEnd, handleDragCancel } = useChessContext();

  return (
    <>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel} modifiers={[restrictToWindowEdges]}>
        <div ref={boardRef} className={['board', promotionSquare ? 'eclipse' : ''].join(' ')} onClick={() => clickOnTheBoard()}>
          {promotionSquare && (
            <PromotionModal onSelect={handlePromotion} x={promotionSquare.x} color={promotionSquare.piece?.color}
              square={promotionSquare} />
          )}
          {board.squares.map((row, y) => <React.Fragment key={y}>
            {row.map((square) => <DroppableSquare
              key={square.id}
              id={`${square.x}-${square.y}`}
              color={square.color}
              selected={square.x === selectedSquare?.x && square.y === selectedSquare?.y}
              isAvailable={square.available}
              isKingInCheck={square.isKingInCheck}
              isCheckmate={square.isCheckmate}
              resign={square.resign}
              losingByTime={square.losingByTime}
              isVictory={square.isVictory}
              isStalemate={square.isStalemate}
              isDraw={square.isDraw}
              handleStopGame={handleStopGame}
              square={square}
              mouseDown={mouseDown}
              coordinates={{ x: square.x, y: square.y }}
            >
              {square.piece?.logo && (
                <DraggablePiece
                  id={`${square.x}-${square.y}`}
                  src={square.piece.logo} />
              )}
            </DroppableSquare>
            )}
          </React.Fragment>
          )}
        </div>
      </DndContext>
    </>
  );
}

export default ChessBoard;