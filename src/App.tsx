import { useState } from 'react'
import './App.css'
import BoardComponent from './components/BoardComponent'
import { Board } from './modules/Board'
import LostFigures from './components/LostFigures';

function App() {
  const [board, setBoard] = useState(new Board());

  return (
    <>
      <main className='main'>
        <BoardComponent
          board={board}
          setBoard={setBoard}
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
