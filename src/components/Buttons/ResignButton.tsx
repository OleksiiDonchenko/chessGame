import { Colors } from '../../modules/Colors';
import { ResignButtonProps } from './types';

const ResignButton = ({ handleStopGame, snapshotBoard, gameIsOn, currentPlayer, board }: ResignButtonProps) => {

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

export default ResignButton;