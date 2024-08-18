import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Context/SocketContext";
import UserFeedPlayer from "../Components/UserFeedPlayer";

const Room: React.FC = () => {
    const { id } = useParams();
    const { socket, user, stream, peers } = useContext(SocketContext);

    useEffect(() => {
        if (user) {
            console.log("New user with id: ", user._id, "has joined room with id: ", id);
            socket.emit('joined-room', { roomId: id, peerId: user._id });
        }
    }, [id, socket, user]);

    return (
        <main className="flex flex-col items-center justify-center gap-5">
            <div className="md:text-3xl md:font-semibold mt-[1rem]">Video Meet</div>
            

            <div className="flex flex-col items-center justify-center mx-5">
                <div className="w-full flex items-center justify-center md:w-[600px] h-auto"> {/* Adjust this width to make your feed larger */}
                    <UserFeedPlayer stream={stream} />
                </div>
                <p className="text-[1.5rem]">You</p>
            </div>


            <div className="flex items-center justify-center gap-2 flex-wrap mx-8">
                {Object.keys(peers).map((peerId) => (
                    <div key={peerId} className="w-full md:w-[200px] h-auto"> 
                        <UserFeedPlayer stream={peers[peerId].stream} />
                        <p className="text-center text-[0.7rem] md:text-[1rem]">{peerId.substring(0, 5)}</p>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default Room;
