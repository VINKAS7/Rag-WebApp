import Chat from "../components/Chat";
import Header from "../components/Header";
import SideBar from "../components/SideBar";
import Footer from "../components/Footer";

function Conversation(){
    return (
        <div className="flex h-screen overflow-hidden bg-[#36353f]">
            <SideBar />
            <div className="flex flex-col flex-1">
                <Header />
                <div className="flex-1 overflow-y-auto">
                    <Chat />
                </div>
                <Footer />
            </div>
        </div>
    );
}

export default Conversation;