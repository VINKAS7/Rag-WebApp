import Header from "../components/Header";
import Footer from "../components/Footer";
import SideBar from "../components/SideBar";

function Home() {
    return (
        <div className="flex min-h-screen bg-[#36353f]">
            <SideBar />
            <div className="flex flex-col flex-1 relative">
                <Header />
                <div className="flex-1 relative">
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default Home;