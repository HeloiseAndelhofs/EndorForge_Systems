import { Routes, Route } from "react-router-dom"
import Landing from "./PAGES/landing"
import Login from "./PAGES/login"
import Home from "./PAGES/CONNECTED/home"
import Profile from "./PAGES/CONNECTED/profile"
import './App.css'

function App() {

  return (

    <Routes>

      <Route path="/" element={<Landing />} />,
      <Route path="/login" element={<Login />} />,
      <Route path="/nova" element={<Home />}/>,
      <Route path="/profile" element={<Profile />}/>

    </Routes>

  )
}

export default App
