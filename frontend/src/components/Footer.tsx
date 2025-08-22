import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedCollection, setProvider } from "../features/footerSlice";
import type { RootState } from "../app/store";

function Footer(){
    const [modelListOpen, setmodelListOpen] = useState(false);
    const [collectionOpen, setCollectionOpen] = useState(false);
    const [collections, setCollections] = useState([]);
    const dispatch = useDispatch();
    const selectedCollection = useSelector((state: RootState) => state.footer.selectedCollection);
    const provider = useSelector((state: RootState) => state.footer.provider)
    useEffect(() => {
        const getCollections = async () => {
            const res = await fetch("http://localhost:3000/api/get_collections");
            const c = await res.json();
            setCollections(c.collections);
        }
        getCollections();
    }, []);
    return(
        <div className="flex">
            <div className="relative inline-block">
                <button
                    onClick={() => setmodelListOpen(!modelListOpen)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    {provider}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                </button>
                {modelListOpen && (
                    <ul className="absolute bottom-full mb-2 w-40 bg-white shadow-lg rounded-lg border">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => dispatch(setProvider("ChatGPT"))}>ChatGPT</li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => dispatch(setProvider("Gemini"))}>Gemini</li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => dispatch(setProvider("Claude"))}>Claude</li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => dispatch(setProvider("Ollama"))}>Ollama</li>
                    </ul>
                )}
            </div>
            <div className="relative inline-block">
                <button
                    onClick={() =>{
                        setCollectionOpen(!collectionOpen);
                    } }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                    {selectedCollection}
                </button>
                {collectionOpen && (
                    <ul className="absolute bottom-full mb-2 w-40 bg-white shadow-lg rounded-lg border">
                        {
                            collections.map((c) => {
                                return(
                                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => setSelectedCollection(c)}>{c}</li>
                                )
                            })
                        }
                    </ul>
                )}
            </div>
            <input />
            <button></button>
            <button></button>
        </div>
    )
}

export default Footer;