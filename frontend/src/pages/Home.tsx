import Header from "../components/Header";
import Footer from "../components/Footer";
import Chat from "../components/Chat";
import SideBar from "../components/SideBar";

function Home(){
    return(
        <div className="flex w-full">
            <SideBar />
            <div className="flex flex-col min-h-screen">
                <Header />
                <Chat />
                <Footer />
            </div>
        </div>
        
    )
}

export default Home;