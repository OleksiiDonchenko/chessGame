import { FC } from 'react';
import { Player } from '../modules/Player';
import { Colors } from '../modules/Colors';

interface ButtonsProps {
  handleRestart: () => void;
  handleStartGame: () => void;
  handleStopGame: (color?: Colors) => void;
  handleDraw: (color: Colors) => void;
  gameIsOn: boolean;
  gameWasStarted: boolean;
  currentPlayer: Player | null;
}

const Buttons: FC<ButtonsProps> = ({ handleRestart, handleStartGame, handleStopGame, handleDraw, gameIsOn, gameWasStarted, currentPlayer }) => {
  return (
    <div className="buttons">
      <div>
        <button onClick={handleRestart}
          disabled={!gameIsOn && gameWasStarted ? false : true}
        >
          Restart game
        </button>
      </div>
      <div>
        <button onClick={handleStartGame}
          disabled={gameIsOn ? true : false || gameWasStarted ? true : false}
        >
          Start game
        </button>
      </div>
      <div>
        <button onClick={currentPlayer ? () => handleDraw(currentPlayer.color) : () => { }}
          disabled={!gameIsOn ? true : false}>
          Draw
        </button>
      </div>
      <div>
        <button onClick={currentPlayer ? () => handleStopGame(currentPlayer.color) : () => { }}
          disabled={!gameIsOn ? true : false}
        >
          Resign
        </button>
      </div>
    </div>
  );
};

export default Buttons;