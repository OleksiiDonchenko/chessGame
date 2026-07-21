import './App.css';
import GameControls from './components/controls/GameControls';
import CapturedPieces from './components/board/CapturedPieces';
import Clock from './components/board/Clock';
import ChessBoard from './components/board/ChessBoard';
import GameSidebar from './components/sidebar/GameSidebar';

function App() {

  return (
    <main className='main'>
      <div className='wrapper-board'>
        <GameControls />
        <div className='capturedPiecesAndClock'>
          <CapturedPieces color='white' />
          <Clock color='blackTime' colorClockSVG='white' />
        </div>
        <ChessBoard />
        <div className='capturedPiecesAndClock'>
          <CapturedPieces color='black' />
          <Clock color='whiteTime' colorClockSVG='black' />
        </div>
      </div>
      <GameSidebar />
    </main>
  )
}

export default App
