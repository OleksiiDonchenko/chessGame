import { Colors } from '../../modules/Colors';
import { ButtonResignProps } from './types';

const ButtonResignComponent = ({ handleStopGame, snapshotBoard, gameIsOn, currentPlayer, board }: ButtonResignProps) => {

  function resign(color: Colors) {
    handleStopGame(color);
    snapshotBoard(board);
  }

  function callbackResign() {
    if (!currentPlayer) return;
    return resign(currentPlayer.color);
  }

  return (
    <button onClick={callbackResign}
      disabled={!gameIsOn || !currentPlayer}
      className='btn resign-btn'
      title='Resign' />
  );
};

export default ButtonResignComponent;