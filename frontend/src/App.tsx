import { BrowserRouter, Routes, Route } from "react-router-dom";
import Conversation from "./pages/Conversation";
import Home from "./pages/Home";

function App(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<Home />}/>
                <Route path={"/conversation/:id"} element={<Conversation />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App;