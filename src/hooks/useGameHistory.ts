import { useState } from "react";
import { Board } from "../modules/board/Board";

export function useGameHistory() {
  const initialBoard = new Board();
  const [history, setHistory] = useState<Board[]>([initialBoard.getDeepCopyBoard()]);
  const [board, setBoard] = useState<Board>(history[history.length - 1].getDeepCopyBoard());
  const [currentMove, setCurrentMove] = useState(0);

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

  return {
    board, setBoard, history, setHistory, currentMove, setCurrentMove, makeMove, goToPreviousMove, goToNextMove, snapshotBoard, setNewBoard
  }
}