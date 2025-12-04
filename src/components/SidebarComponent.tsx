import { FC, useEffect } from 'react';
import { Board } from '../modules/Board';
import { Cell } from '../modules/Cell';
import { Player } from '../modules/Player';

interface SidebarComponentProps {
  history: Board[];
  currentMove: number;
  goToPreviousMove: () => void;
  goToNextMove: () => void;
  boardRef: React.RefObject<HTMLDivElement>;
  clickOnBoard: boolean;
  setClickOnBoard: (arg: boolean) => void;
  swapPlayer: () => void;
  isAnalysis: boolean;
  setSelectedCell: (cell: Cell | null) => void;
  currentPlayer: Player | null;
}

const SidebarComponent: FC<SidebarComponentProps> = ({ history, currentMove, goToPreviousMove, goToNextMove, boardRef, clickOnBoard, setClickOnBoard, swapPlayer, isAnalysis, setSelectedCell, currentPlayer }) => {

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!clickOnBoard) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        goToPreviousMove();
        if (isAnalysis && currentMove > 0)
          swapPlayer();
        setSelectedCell(null);
      } else if (e.key === 'ArrowRight') {
        goToNextMove();
        if (isAnalysis && currentMove < history.length - 1)
          swapPlayer();
        setSelectedCell(null);
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
    setSelectedCell(null);
  }

  function previousMove() {
    setClickOnBoard(true);
    goToPreviousMove();
    if (isAnalysis)
      swapPlayer();
    setSelectedCell(null);
  }

  return (
    <div className='sidebar'>
      <div className='sidebar-moves'>
        <h1>Moves</h1>
        <p>Number of moves: {history.length - 1}</p>
        <p>Current move: {currentMove + 1}</p>
        <p>Current player: {currentPlayer ? currentPlayer.color : 'You must start the game!'}</p>
      </div>
      <div className='sidebar-buttons'>
        <button className="sidebar-button angle-left"
          onClick={() => previousMove()}
          disabled={currentMove === 0}
        ></button>
        <button className="sidebar-button angle-right"
          onClick={() => nextMove()}
          disabled={currentMove === history.length - 1}
        ></button>
      </div>
    </div>
  );
};

export default SidebarComponent;