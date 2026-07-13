import React, { createContext, useContext, useEffect, useState } from 'react';
import { Board } from '../modules/board/Board';

interface ChessContextType {
  gameIsOn: boolean;
  gameWasStarted: boolean;
  isAnalysis: boolean;
  setGameIsOn: (b: boolean) => void;
  setGameWasStarted: (b: boolean) => void;
  setIsAnalysis: (b: boolean) => void;
  board: Board;
  setBoard: (board: Board) => void;
  history: Board[];
  setHistory: (history: Board[]) => void;
  currentMove: number;
  setCurrentMove: (currentMove: number) => void;
  makeMove: (newBoard: Board) => void;
  goToPreviousMove: () => void;
  goToNextMove: () => void;
  snapshotBoard: (newBoard: Board) => void;
  whitePoints: number;
  setWhitePoints: (n: number) => void;
  blackPoints: number;
  setBlackPoints: (n: number) => void;
  whoLeads: number;
  setWholeads: (n: number) => void;
}

const ChessContext = createContext<ChessContextType | undefined>(undefined);

export const useChessContext = () => {
  const context = useContext(ChessContext);
  if (!context) {
    throw new Error('useChessContext must be used within a ChessProvider');
  }
  return context;
}

export const ChessProvider = ({ children }: { children: React.ReactNode }) => {
  const initialBoard = new Board();
  const [history, setHistory] = useState<Board[]>([initialBoard.getDeepCopyBoard()]);
  const [board, setBoard] = useState<Board>(history[history.length - 1].getDeepCopyBoard());
  const [currentMove, setCurrentMove] = useState(0);

  const [gameIsOn, setGameIsOn] = useState(false);
  const [gameWasStarted, setGameWasStarted] = useState(false);
  const [isAnalysis, setIsAnalysis] = useState(false);

  const [whitePoints, setWhitePoints] = useState(0);
  const [blackPoints, setBlackPoints] = useState(0);
  const [whoLeads, setWholeads] = useState(0);

  function makeMove(newBoard: Board) {
    newBoard.squares.forEach(row => {
      row.forEach(square => {
        square.available = false;
      });
    });
    const newHistory = [...history.slice(0, currentMove + 1), newBoard];
    setHistory(newHistory);
    setCurrentMove(newHistory.length - 1);
  }

  function goToPreviousMove() {
    if (currentMove > 0) {
      setCurrentMove((prevIndex) => prevIndex - 1);
    } else {
      setCurrentMove(0);
    }
  }

  function goToNextMove() {
    if (currentMove < history.length - 1) {
      setCurrentMove((prevIndex) => Math.min(prevIndex + 1, history.length - 1));
    }
  }

  function snapshotBoard(newBoard: Board) {
    const newHistory = [...history.slice(0, currentMove), newBoard.getDeepCopyBoard()];
    setHistory(newHistory);
  }

  function setNewBoard() {
    setBoard(history[currentMove].getDeepCopyBoard());
  }

  useEffect(() => {
    setNewBoard();
  }, [currentMove, history]);


  return (
    <ChessContext.Provider value={{
      board, setBoard, history, setHistory, currentMove, setCurrentMove, makeMove, goToPreviousMove, goToNextMove, snapshotBoard, gameIsOn, setGameIsOn, gameWasStarted, setGameWasStarted, isAnalysis, setIsAnalysis, whitePoints, setWhitePoints, blackPoints, setBlackPoints, whoLeads, setWholeads,
    }}>
      {children}
    </ChessContext.Provider>
  );
};