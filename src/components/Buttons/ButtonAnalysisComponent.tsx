import { ButtonAnalysisProps } from './types';

const ButtonAnalysisComponent = ({ handleAnalysis, gameIsOn, gameWasStarted }: ButtonAnalysisProps) => {
  
  return (
    <button onClick={handleAnalysis}
      disabled={gameIsOn || gameWasStarted}
      className='btn analysis-btn'
      title='Analysis' />
  );
};

export default ButtonAnalysisComponent;