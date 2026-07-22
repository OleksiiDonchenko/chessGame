import { RefObject, useEffect } from "react";
import { Square } from "../modules/board/Square";

interface UseGameSidebarParams {
  isAnalysis: boolean;
  currentMove: number;
  goToPreviousMove: () => void;
  goToNextMove: () => void;
  boardRef: RefObject<HTMLDivElement>;
  clickOnBoard: boolean;
  setClickOnBoard: (b: boolean) => void;
  setSelectedSquare: (s: Square | null) => void;
  swapPlayer: () => void;
}

export function useGameSidebar({ isAnalysis, currentMove, goToPreviousMove, goToNextMove, boardRef, clickOnBoard, setClickOnBoard, setSelectedSquare, swapPlayer }: UseGameSidebarParams) {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!clickOnBoard) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        goToPreviousMove();
        if (isAnalysis && currentMove > 0)
          swapPlayer();
        setSelectedSquare(null);
      } else if (e.key === 'ArrowRight') {
        goToNextMove();
        if (isAnalysis && currentMove < history.length - 1)
          swapPlayer();
        setSelectedSquare(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToPreviousMove, goToNextMove, boardRef, clickOnBoard]);

  function nextMove() {
    setClickOnBoard(true);
    goToNextMove();
    if (isAnalysis)
      swapPlayer();
    setSelectedSquare(null);
  }

  function previousMove() {
    setClickOnBoard(true);
    goToPreviousMove();
    if (isAnalysis)
      swapPlayer();
    setSelectedSquare(null);
  }

  return { nextMove, previousMove };
}