function Header() {
    return (
    <div className="flex justify-center items-center py-6 sticky top-0 z-20 bg-white backdrop-blur-md cursor-pointer select-none">
      {/* First word */}
        <span className="relative group mr-3 italic text-3xl leading-[3rem] font-extrabold transition-transform duration-300 hover:scale-110">
            <span className="block group-hover:hidden bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Rag
            </span>
            <span className="hidden group-hover:block text-gray-700">[100]</span>
        </span>

      {/* Second word */}
        <span className="relative group text-3xl font-extrabold transition-transform duration-300 hover:scale-110">
        <span className="block group-hover:hidden bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
            WebApp
        </span>
        <span className="hidden group-hover:block text-gray-700">[200]</span>
        </span>
    </div>
    );
}

export default Header;