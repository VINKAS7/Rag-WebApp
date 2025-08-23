import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

function Chat(){
    const location = useLocation();
    const {user} = location.state;
    return(
        <div className="flex-1">
            Hello
        </div>
    )
}

export default Chat;