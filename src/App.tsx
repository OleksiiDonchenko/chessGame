import './App.css';
import BoardComponent from './components/BoardComponent';
import { ChessProvider } from './context/ChessContext';

function App() {

  return (
    <ChessProvider>
      <main className='main'>
        <BoardComponent />
      </main>
    </ChessProvider>
  )
}

export default App
