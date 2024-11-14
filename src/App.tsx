import { useEffect, useState } from 'react'
import './App.css'
import BoardComponent from './components/BoardComponent'
import { Board } from './modules/Board'

function App() {
  const [board, setBoard] = useState(new Board());

  useEffect(() => {
    restart();
  }, [])

  function restart() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
  }

  return (
    <>
      <h1>Chess game</h1>
      <BoardComponent board={board} setBoard={setBoard} />
    </>
  )
}

export default App
