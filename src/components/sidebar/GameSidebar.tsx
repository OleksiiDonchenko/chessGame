import { useEffect } from 'react';
import { useChessContext } from '../../context/ChessContext';

const GameSidebar = () => {

  // useChessContext
  const { isAnalysis, history, currentMove, goToPreviousMove, goToNextMove, boardRef, clickOnBoard, setClickOnBoard, currentPlayer, setSelectedSquare, swapPlayer } = useChessContext();

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

  return (
    <div className='sidebar'>
      <div className='sidebar-moves'>
        <h1>Moves</h1>
        <p>Number of moves: {history.length - 1}</p>
        <p>Current move: {currentMove + 1}</p>
        <p>Current move for: {currentPlayer ? `${currentPlayer.color} player` : 'You must start the game!'}</p>
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

export default GameSidebar;