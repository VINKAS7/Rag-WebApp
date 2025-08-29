import { BrowserRouter, Routes, Route } from "react-router-dom";
import Conversation from "./pages/Conversation";
import Home from "./pages/Home";
import ErrorModal from "./components/ErrorModal";
import SuccessModal from "./components/SuccessModal";

function App(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<Home />}/>
                <Route path={"/conversation/:id"} element={<Conversation />}/>
            </Routes>
            <ErrorModal />
            <SuccessModal />
        </BrowserRouter>
    )
}

export default App;