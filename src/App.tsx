import { useState } from 'react'
import './App.css'
import BoardComponent from './components/BoardComponent'
import { Board } from './modules/Board'

function App() {
  const [board, setBoard] = useState(new Board());

  return (
    <>
      <main className='main'>
        <BoardComponent
          board={board}
          setBoard={setBoard}
        />
      </main>

    </>
  )
}

export default App
