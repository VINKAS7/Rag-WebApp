import Chat from "../components/Chat";
import Header from "../components/Header";
import SideBar from "../components/SideBar";
import Footer from "../components/Footer";

function Conversation(){
    return (
        <div className="flex min-h-screen">
            <SideBar />
            <div className="flex flex-col flex-1">
                <Header />
                <Chat />
                <Footer />
            </div>
        </div>
    );
}

export default Conversation;