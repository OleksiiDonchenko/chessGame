// import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Board } from '../modules/Board';

interface ChessContextType {
  board: Board;
  setBoard: (board: Board) => void;
  history: Board[];
  sethistory: (history: Board[]) => void;
  currentMove: number;
  setCurrentMove: (currentMove: number) => void;
  makeMove: (newBoard: Board) => void;
  goToPreviousMove: () => void;
  goToNextMove: () => void;
  snapshotBoard:(newBoard: Board) => void;
}

const ChessContext = createContext<ChessContextType | undefined>(undefined);

export const useChess = () => {
  const context = useContext(ChessContext);
  if (!context) {
    throw new Error('useChess must be used within a ChessProvider');
  }
  return context;
}

export const ChessProvider = ({ children }: { children: React.ReactNode }) => {
  const initialBoard = new Board();
  // const [board, setBoard] = useState<Board>(initialBoard);
  const [history, sethistory] = useState<Board[]>([initialBoard.getDeepCopyBoard()]);
  const [board, setBoard] = useState<Board>(history[0].getDeepCopyBoard());
  const [currentMove, setCurrentMove] = useState(0);

  // const board = useMemo(() => history[currentMove].getDeepCopyBoard(), [history, currentMove]);
  // const board = history[currentMove];

  function makeMove(newBoard: Board) {
    newBoard.cells.forEach(row => {
      row.forEach(cell => {
        cell.available = false;
      });
    });
    const newHistory = [...history.slice(0, currentMove + 1), newBoard.getDeepCopyBoard()];
    sethistory(newHistory);
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
    sethistory(newHistory);
  }

  function setNewBoard() {
    setBoard(history[currentMove].getDeepCopyBoard());
  }

  useEffect(() => {
    // setBoard(history[currentMove].getDeepCopyBoard());
    setNewBoard();
  }, [currentMove, history]);


  return (
    <ChessContext.Provider value={{
      board, setBoard, history, sethistory, currentMove, setCurrentMove, makeMove, goToPreviousMove, goToNextMove, snapshotBoard
    }}>
      {children}
    </ChessContext.Provider>
  );
};