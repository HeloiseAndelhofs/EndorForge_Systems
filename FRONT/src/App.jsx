import { Routes, Route } from "react-router-dom"
import Landing from "./PAGES/landing"
import Login from "./PAGES/login"
import Home from "./PAGES/CONNECTED/home"
import './App.css'

function App() {

  return (

    <Routes>

      <Route path="/" element={<Landing />} />,
      <Route path="/login" element={<Login />} />,
      <Route path="/nova" element={<Home />}/>

    </Routes>

  )
}

export default App
