import RestartButton from './RestartButton';
import StartButton from './StartButton';
import AnalysisButton from './AnalysisButton';
import DrawButton from './DrawButton';
import ResignButton from './ResignButton';
import { useChessContext } from '../../context/ChessContext';

const GameControls = () => {

  // useChessContext
  const { board, snapshotBoard, gameIsOn, gameWasStarted, currentPlayer, handleRestart, handleStartGame, handleAnalysis, handleStopGame, handleDraw } = useChessContext();

  return (
    <div className="buttons">
      <RestartButton handleRestart={handleRestart} gameIsOn={gameIsOn} gameWasStarted={gameWasStarted} />
      <StartButton handleStartGame={handleStartGame} gameIsOn={gameIsOn} gameWasStarted={gameWasStarted} />
      <AnalysisButton handleAnalysis={handleAnalysis} gameIsOn={gameIsOn} gameWasStarted={gameWasStarted} />
      <DrawButton handleDraw={handleDraw} snapshotBoard={snapshotBoard} board={board} currentPlayer={currentPlayer} gameIsOn={gameIsOn} />
      <ResignButton handleStopGame={handleStopGame} snapshotBoard={snapshotBoard} board={board} currentPlayer={currentPlayer} gameIsOn={gameIsOn} />
    </div>
  );
};

export default GameControls;