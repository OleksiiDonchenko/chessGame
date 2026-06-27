import { Colors } from '../../modules/Colors';
import { DrawButtonProps } from './types';

const DrawButton = ({ handleDraw, snapshotBoard, gameIsOn, currentPlayer, board }: DrawButtonProps) => {

  function draw(color: Colors) {
    handleDraw(color);
    snapshotBoard(board);
  }

  function callbackDraw() {
    if (!currentPlayer) return;
    return draw(currentPlayer.color);
  }

  return (
    <button onClick={callbackDraw}
      disabled={!gameIsOn || !currentPlayer}
      className='btn draw-btn'
      title='Draw' />
  );
};

export default DrawButton;