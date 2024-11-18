import { useEffect, useState } from 'react'
import './App.css'
import BoardComponent from './components/BoardComponent'
import { Board } from './modules/Board'
import { Player } from './modules/Player';
import { Colors } from './modules/Colors';
import LostFigures from './components/LostFigures';

function App() {
  const [board, setBoard] = useState(new Board());
  const [whitePlayer, setWhitePlayer] = useState(new Player(Colors.WHITE));
  const [blackPlayer, setBlackPlayer] = useState(new Player(Colors.BLACK));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)

  useEffect(() => {
    restart();
    setCurrentPlayer(whitePlayer);
  }, [])

  function restart() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
  }

  function gameRestart() {
    setCurrentPlayer(whitePlayer);
    restart();
  }

  function swapPlayer() {
    setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer);
  }

  return (
    <>
      <h1>Chess game</h1>
      <main className='main'>
        <BoardComponent
          board={board}
          setBoard={setBoard}
          currentPlayer={currentPlayer}
          swapPlayer={swapPlayer}
          gameRestart={gameRestart}
        />
        <div>
          <LostFigures title='White figures' figures={board.lostWhiteFigures} />
          <LostFigures title='Black figures' figures={board.lostBlackFigures} />
        </div>
      </main>

    </>
  )
}

export default App
