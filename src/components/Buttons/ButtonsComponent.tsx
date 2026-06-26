import { ButtonsProps } from './types';
import ButtonRestartComponent from './ButtonRestartComponent';
import ButtonStartComponent from './ButtonStartComponent';
import ButtonAnalysisComponent from './ButtonAnalysisComponent';
import ButtonDrawComponent from './ButtonDrawComponent';
import ButtonResignComponent from './ButtonResignComponent';

const Buttons = ({ handleRestart, handleStartGame, handleAnalysis, handleStopGame, handleDraw, gameIsOn, gameWasStarted, currentPlayer, board, snapshotBoard }: ButtonsProps) => {

  return (
    <div className="buttons">
      <ButtonRestartComponent handleRestart={handleRestart} gameIsOn={gameIsOn} gameWasStarted={gameWasStarted} />
      <ButtonStartComponent handleStartGame={handleStartGame} gameIsOn={gameIsOn} gameWasStarted={gameWasStarted} />
      <ButtonAnalysisComponent handleAnalysis={handleAnalysis} gameIsOn={gameIsOn} gameWasStarted={gameWasStarted} />
      <ButtonDrawComponent handleDraw={handleDraw} snapshotBoard={snapshotBoard} board={board} currentPlayer={currentPlayer} gameIsOn={gameIsOn} />
      <ButtonResignComponent handleStopGame={handleStopGame} snapshotBoard={snapshotBoard} board={board} currentPlayer={currentPlayer} gameIsOn={gameIsOn} />
    </div>
  );
};

export default Buttons;