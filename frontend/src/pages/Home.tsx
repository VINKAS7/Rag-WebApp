import Header from "../components/Header";
import Footer from "../components/Footer";
import Chat from "../components/Chat";

function Home(){
    return(
        <div className="flex flex-col min-h-screen">
            <Header />
            <Chat />
            <Footer />
        </div>
    )
}

export default Home;