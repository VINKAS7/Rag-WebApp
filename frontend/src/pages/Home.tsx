import Header from "../components/Header";
import Footer from "../components/Footer";
import SimpleChat from "../components/SimpleChat";
import SideBar from "../components/SideBar";

function Home() {
    return (
        <div className="flex min-h-screen">
            <SideBar />
            <div className="flex flex-col flex-1">
                <Header />
                <SimpleChat />
                <Footer />
            </div>
        </div>
    );
}


export default Home;