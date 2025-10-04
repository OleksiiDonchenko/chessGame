import { FC } from 'react';
import { Player } from '../modules/Player';
import { Colors } from '../modules/Colors';
import { Board } from '../modules/Board';

interface ButtonsProps {
  handleRestart: () => void;
  handleStartGame: () => void;
  handleAnalysis: () => void;
  handleStopGame: (color?: Colors) => void;
  handleDraw: (color: Colors) => void;
  gameIsOn: boolean;
  gameWasStarted: boolean;
  currentPlayer: Player | null;
  board: Board;
  snapshotBoard: (newBoard: Board) => void;
}

const Buttons: FC<ButtonsProps> = ({ handleRestart, handleStartGame, handleAnalysis, handleStopGame, handleDraw, gameIsOn, gameWasStarted, currentPlayer, board, snapshotBoard }) => {
  function draw(color: Colors) {
    handleDraw(color);
    snapshotBoard(board);
  }

  function resign(color: Colors) {
    handleStopGame(color);
    snapshotBoard(board);
  }

  return (
    <div className="buttons">
      <div>
        <button onClick={handleRestart}
          disabled={!gameIsOn && gameWasStarted ? false : true}
          className='btn restart-game-btn'
          title='Restart game'
        >
        </button>
      </div>
      <div>
        <button onClick={handleStartGame}
          disabled={gameIsOn ? true : false || gameWasStarted ? true : false}
          className='btn play-btn'
          title='Play'
        >
        </button>
      </div>
      <div>
        <button onClick={handleAnalysis}
          disabled={gameIsOn ? true : false || gameWasStarted ? true : false}
          className='btn analysis-btn'
          title='Analysis'
        >
        </button>
      </div>
      <div>
        <button onClick={currentPlayer ? () => draw(currentPlayer.color) : () => { }}
          disabled={!gameIsOn ? true : false}
          className='btn draw-btn'
          title='Draw'
          >
        </button>
      </div>
      <div>
        <button onClick={currentPlayer ? () => resign(currentPlayer.color) : () => { }}
          disabled={!gameIsOn ? true : false}
          className=' btn resign-btn'
          title='Resign'
        >
        </button>
      </div>
    </div>
  );
};

export default Buttons;