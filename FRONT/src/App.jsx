import { Routes, Route } from "react-router-dom"

import Landing from "./PAGES/landing"
import Login from "./PAGES/login"
import Home from "./PAGES/CONNECTED/home"
import Profile from "./PAGES/CONNECTED/profile"
import FilesList from "./PAGES/CONNECTED/files"

import Logout from "./COMPONENTS/Logout"

import './App.css'

function App() {

  return (

    <Routes>

      <Route path="/" element={<Landing />} />,
      <Route path="/login" element={<Login />} />,
      <Route path="/nova" element={<Home />}/>,
      <Route path="/profile" element={<Profile />}/>
      <Route path="/logout" element={<Logout />}/>
      <Route path="/files" element={<FilesList />} />

    </Routes>

  )
}

export default App
