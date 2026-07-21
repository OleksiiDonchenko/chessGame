import React, { createContext, useContext, useEffect } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import { ChessContextType } from './types';

const ChessContext = createContext<ChessContextType | undefined>(undefined);

export const useChessContext = () => {
  const context = useContext(ChessContext);
  if (!context) {
    throw new Error('useChessContext must be used within a ChessProvider');
  }
  return context;
}

export const ChessProvider = ({ children }: { children: React.ReactNode }) => {

  // useChessGame
  const {
    gameIsOn, setGameIsOn, gameWasStarted, setGameWasStarted, isAnalysis, setIsAnalysis,

    whitePoints, setWhitePoints, blackPoints, setBlackPoints, whoLeads, setWholeads,

    boardRef, clickOnBoard, setClickOnBoard, promotionSquare, selectedSquare, setSelectedSquare, currentPlayer, setCurrentPlayer, whitePlayer, blackPlayer,

    board, history, currentMove, goToPreviousMove, goToNextMove, snapshotBoard, setNewBoard,

    mouseDown, handlePromotion, swapPlayer, restart, clickOnTheBoard,

    blackFormattedTime, whiteFormattedTime, resetTimers,

    handleRestart, handleStartGame, handleAnalysis, handleStopGame, handleDraw,

    handleDragStart, handleDragEnd, handleDragCancel,
  } = useChessGame();

  useEffect(() => {
    setNewBoard();
  }, [currentMove, history]);

  return (
    <ChessContext.Provider value={{
      gameIsOn, setGameIsOn, gameWasStarted, setGameWasStarted, isAnalysis, setIsAnalysis,

      whitePoints, setWhitePoints, blackPoints, setBlackPoints, whoLeads, setWholeads,

      boardRef, clickOnBoard, setClickOnBoard, promotionSquare, selectedSquare, setSelectedSquare, currentPlayer, setCurrentPlayer, whitePlayer, blackPlayer,

      board, history, currentMove, goToPreviousMove, goToNextMove, snapshotBoard,

      mouseDown, handlePromotion, swapPlayer, restart, clickOnTheBoard,

      blackFormattedTime, whiteFormattedTime, resetTimers,

      handleRestart, handleStartGame, handleAnalysis, handleStopGame, handleDraw,

      handleDragStart, handleDragEnd, handleDragCancel,
    }}>
      {children}
    </ChessContext.Provider>
  );
};