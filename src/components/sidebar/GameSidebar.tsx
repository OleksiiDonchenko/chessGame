import { useChessContext } from '../../context/ChessContext';

const GameSidebar = () => {

  // useChessContext
  const { history, currentMove, previousMove, nextMove, currentPlayer } = useChessContext();

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