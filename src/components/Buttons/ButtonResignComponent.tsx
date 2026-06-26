import { Colors } from '../../modules/Colors';
import { ButtonResignProps } from './types';

const ButtonResignComponent = ({ handleStopGame, snapshotBoard, gameIsOn, currentPlayer, board }: ButtonResignProps) => {

  function resign(color: Colors) {
    handleStopGame(color);
    snapshotBoard(board);
  }

  return (
    <button onClick={currentPlayer ? () => resign(currentPlayer.color) : () => { }}
      disabled={!gameIsOn ? true : false}
      className=' btn resign-btn'
      title='Resign' />
  );
};

export default ButtonResignComponent;