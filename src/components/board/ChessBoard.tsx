import React, { useState } from 'react';
import { useChessContext } from '../../context/ChessContext';
import GameControls from '../controls/GameControls';
import CapturedPieces from './CapturedPieces';
import PromotionModal from '../promotion/PromotionModal';
import GameSidebar from '../sidebar/GameSidebar';
import Clock from '../../assets/icons/clock.svg?react';
import { DndContext } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import DroppableSquare from './DroppableSquare';
import DraggablePiece from './DraggablePiece';
import { useBoardDrag } from '../../hooks/useBoardDrag';
import { useGameTimers } from '../../hooks/useGameTimers';
import { useGameControls } from '../../hooks/useGameControls';
import { useChessGame } from '../../hooks/useChessGame';

function ChessBoard() {

  const [whitePoints, setWhitePoints] = useState(0);
  const [blackPoints, setBlackPoints] = useState(0);
  const [whoLeads, setWholeads] = useState(0);

  // useChessContext
  const { board, gameIsOn, gameWasStarted, isAnalysis } = useChessContext();

  // useChessGame
  const { boardRef, clickOnBoard, setClickOnBoard, promotionSquare, setPromotionSquare, mouseDown, handlePromotion, swapPlayer, currentPlayer, setCurrentPlayer, selectedSquare, setSelectedSquare, restart, clickOnTheBoard, whitePlayer, blackPlayer, } = useChessGame({ setWhitePoints, setBlackPoints, setWholeads });

  // useGameTimers
  const { blackFormattedTime, whiteFormattedTime, resetTimers } = useGameTimers({ gameIsOn, isAnalysis, currentPlayer, setCurrentPlayer, setSelectedSquare });

  // useGameControls
  const { handleRestart, handleStartGame, handleAnalysis, handleStopGame, handleDraw } = useGameControls({ setCurrentPlayer, setSelectedSquare, restart, resetTimers, whitePlayer });

  // useBoardDrag
  const { handleDragStart, handleDragEnd, handleDragCancel } = useBoardDrag({ setClickOnBoard, currentPlayer, setPromotionSquare, swapPlayer, setSelectedSquare });

  return (
    <>
      <div className='wrapper'>
        <div className='wrapper-board'>
          <GameControls handleRestart={handleRestart}
            handleStartGame={handleStartGame}
            handleAnalysis={handleAnalysis}
            handleStopGame={handleStopGame}
            handleDraw={handleDraw}
            gameIsOn={gameIsOn}
            gameWasStarted={gameWasStarted}
            currentPlayer={currentPlayer} />
          <div className='capturedPiecesAndTime'>
            <CapturedPieces
              color='white'
              pieces={board.lostWhitePieces}
              whoLeads={whoLeads}
              setWholeads={setWholeads}
              whitePoints={whitePoints}
              setWhitePoints={setWhitePoints}
              blackPoints={blackPoints}
              setBlackPoints={setBlackPoints} />
            <div className={['time', 'blackTime', currentPlayer === blackPlayer && !isAnalysis ? 'goes' : ''].join(' ')}>
              <Clock fill='white' />
              <span>
                {blackFormattedTime}
              </span>
            </div>
          </div>
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
          <div className='capturedPiecesAndTime'>
            <CapturedPieces
              color='black'
              pieces={board.lostBlackPieces}
              whoLeads={whoLeads}
              setWholeads={setWholeads}
              whitePoints={whitePoints}
              setWhitePoints={setWhitePoints}
              blackPoints={blackPoints}
              setBlackPoints={setBlackPoints} />
            <div className={['time', 'whiteTime', currentPlayer === whitePlayer && !isAnalysis ? 'goes' : ''].join(' ')}>
              <Clock fill='black' />
              <span>
                {whiteFormattedTime}
              </span>
            </div>
          </div>
        </div>
        <GameSidebar boardRef={boardRef} clickOnBoard={clickOnBoard} setClickOnBoard={setClickOnBoard}
          swapPlayer={swapPlayer} isAnalysis={isAnalysis} setSelectedSquare={setSelectedSquare} currentPlayer={currentPlayer} />
      </div>
    </>
  );
}

export default ChessBoard;