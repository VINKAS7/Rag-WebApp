import Lottie from "lottie-react";
import animationData from "../assets/lottie_file.json";

function SimpleChat(){
    return(
        <div className="flex-1 overflow-y-auto p-4">
            <div className="flex justify-center align-center">
                <Lottie 
                    animationData={animationData}
                    loop={true}
                    style={{ height: 600, width: 500 }}
                />
            </div>
        </div>
    )
}

export default SimpleChat;