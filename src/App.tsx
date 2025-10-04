// import { useState } from 'react';
import './App.css';
import BoardComponent from './components/BoardComponent';
// import { Board } from './modules/Board';
// import SidebarComponent from './components/SidebarComponent';
import { ChessProvider } from './context/ChessContext';

function App() {
  // const [board, setBoard] = useState(new Board());

  return (
    <ChessProvider>
      <main className='main'>
        {/* board={board} setBoard={setBoard} */}
        <BoardComponent />
        {/* <SidebarComponent /> */}
      </main>
    </ChessProvider>
  )
}

export default App
