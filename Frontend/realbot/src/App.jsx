import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./App.css"

import Chat from "./Pages/Chat"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App