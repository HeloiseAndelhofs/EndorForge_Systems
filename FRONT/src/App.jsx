import { Routes, Route } from "react-router"
import Landing from "./PAGES/landing"
import './App.css'

function App() {

  return (

    <Routes>

      <Route path="/" element={<Landing />} />

    </Routes>

  )
}

export default App
