import { useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate();
    return (
    <div className="flex justify-center items-center py-6 sticky top-0 z-20 backdrop-blur-md cursor-pointer select-none bg-[#36353f]"
        onClick={() => navigate("/")}
    >
        <span className="relative group mr-3 italic text-3xl leading-[3rem] font-extrabold transition-transform duration-300 hover:scale-110">
            <span className="block group-hover:hidden bg-gradient-to-r from-[#5645ee] to-[#7a6cf5] bg-clip-text text-transparent">
                Rag
            </span>
            <span className="hidden group-hover:block text-black">[100]</span>
        </span>

        <span className="relative group text-3xl font-extrabold transition-transform duration-300 hover:scale-110">
        <span className="block group-hover:hidden bg-gradient-to-r from-[#5645ee] to-[#7a6cf5] bg-clip-text text-transparent">
            WebApp
        </span>
        <span className="hidden group-hover:block text-black">[200]</span>
        </span>
    </div>
    );
}

export default Header;