import Chat from "../components/Chat";
import Header from "../components/Header";
import SideBar from "../components/SideBar";
import Footer from "../components/Footer";

function Conversation(){
    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar - fixed height full screen */}
            <SideBar />

            {/* Main area */}
            <div className="flex flex-col flex-1">
                {/* Header - fixed at top */}
                <Header />

                {/* Chat scrollable between header and footer */}
                <div className="flex-1 overflow-y-auto">
                    <Chat />
                </div>

                {/* Footer - fixed at bottom */}
                <Footer />
            </div>
        </div>
    );
}


export default Conversation;