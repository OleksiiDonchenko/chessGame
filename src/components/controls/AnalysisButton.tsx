import { AnalysisButtonProps } from './types';

const AnalysisButton = ({ handleAnalysis, gameIsOn, gameWasStarted }: AnalysisButtonProps) => {
  
  return (
    <button onClick={handleAnalysis}
      disabled={gameIsOn || gameWasStarted}
      className='btn analysis-btn'
      title='Analysis' />
  );
};

export default AnalysisButton;