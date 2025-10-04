import { FC, useEffect } from 'react';
import { Board } from '../modules/Board';
// import { useChess } from '../context/ChessContext';

interface SidebarComponentProps {
  history: Board[];
  currentMove: number;
  goToPreviousMove: () => void;
  goToNextMove: () => void;
  boardRef: React.RefObject<HTMLDivElement>;
  clickOnBoard: boolean;
  setClickOnBoard: (arg: boolean) => void;
}

const SidebarComponent: FC<SidebarComponentProps> = ({ history, currentMove, goToPreviousMove, goToNextMove, boardRef, clickOnBoard, setClickOnBoard }) => {

  useEffect(() => {
    const hnadleKeyDown = (e: KeyboardEvent) => {
      if (!clickOnBoard) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        goToPreviousMove();
      } else if (e.key === 'ArrowRight') {
        goToNextMove();
      }
    };
    document.addEventListener('keydown', hnadleKeyDown);
    return () => {
      document.removeEventListener('keydown', hnadleKeyDown);
    };
  }, [goToPreviousMove, goToNextMove, boardRef, clickOnBoard]);

  function nextMove() {
    setClickOnBoard(true);
    goToNextMove();
  }

  function previousMove() {
    setClickOnBoard(true);
    goToPreviousMove();
  }

  return (
    <div className='sidebar'>
      <div className='sidebar-moves'>
        <h1>Moves</h1>
        <p>Number of moves: {history.length - 1}</p>
        <p>Current move: {currentMove + 1}</p>
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