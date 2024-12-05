import { React } from "react"
import { Route , Routes } from "react-router-dom"
import Home from "./pages/home"

const App = () => {
  return (
    <div>
        <Routes>
          <Route path="/home" element={<Home />} />
        </Routes>
    </div >
  )
}

export default App