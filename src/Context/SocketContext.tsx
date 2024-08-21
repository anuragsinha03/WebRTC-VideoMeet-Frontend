import SockerIoClient from "socket.io-client";
import Peer from 'peerjs'
import React, { createContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import {v4 as UUIDv4} from 'uuid'
import { peerReducer } from "../Reducers/peerReducers";
import { addPeerAction } from "../Actions/peerActions";
// const ws_server = "http://localhost:3001"; //local instance
const ws_server = "https://webrtc-videomeet-backend.onrender.com"

export const SocketContext = createContext<unknown | null>(null);

const socket = SockerIoClient(ws_server, {
	withCredentials: false,
	transports: ["polling", "websocket"]
});

interface Props {
	children: React.ReactNode;
}

export const SocketProvider: React.FC<Props> = ({ children }) => {

	const navigate = useNavigate() // This will gelp to programmatically handle navigation

	//state variable to store the userId
	const[user, setUser] = useState<Peer>() // New peer user
	const [stream, setStream] = useState<MediaStream>()

const [peers, dispatch] = useReducer(peerReducer, {}); // peers->state

	const fetchParticipantList = ({roomId, participants}: {roomId: string, participants: string[]}) =>{
		console.log("Fetched room participants")
		console.log(roomId, participants)
	}

	const fetchUserFeed = async ()=>{
		const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
		setStream(stream);
	}



	useEffect(()=>{
		const userId = UUIDv4()
		const newPeer = new Peer(userId, {
			host: "https://webrtc-videomeet-peerjs.onrender.com/",
			// host: "localhost",
			// port: 9000,
			// port: 443,
			path: "/myapp",
			secure: true, // uncomment this in local env because locally we have http not https
			config: {
				iceServers: [
      				{
        				urls: "stun:stun.relay.metered.ca:80",
      				},
      				{
        				urls: "turn:global.relay.metered.ca:80",
        				username: "2b1c86a68e3c292b8c0eefd0",
        				credential: "INF6Ptd4rhUJ+GUG",
      				},
      				{
        				urls: "turn:global.relay.metered.ca:80?transport=tcp",
        				username: "2b1c86a68e3c292b8c0eefd0",
        				credential: "INF6Ptd4rhUJ+GUG",
      				},
      				{
        				urls: "turn:global.relay.metered.ca:443",
        				username: "2b1c86a68e3c292b8c0eefd0",
        				credential: "INF6Ptd4rhUJ+GUG",
      				},
      				{
        				urls: "turns:global.relay.metered.ca:443?transport=tcp",
        				username: "2b1c86a68e3c292b8c0eefd0",
        				credential: "INF6Ptd4rhUJ+GUG",
      				},
  				],
			}
		})
		setUser(newPeer)

		fetchUserFeed()

		const enterRoom = ({roomId}: {roomId: string}) =>{
			navigate(`/room/${roomId}`)
		}

		// We will transfer the user to the room apge when we collet an event of room-created from the server
		socket.on("room-created", enterRoom)

		socket.on("get-users", fetchParticipantList)
	}, [])

	    useEffect(() => {
        if(!user || !stream) return;

        socket.on("user-joined", ({peerId}) => {
            const call = user.call(peerId, stream);
            console.log("Calling the new peer", peerId);
            call.on("stream", () => {
                dispatch(addPeerAction(peerId, stream));
            })
        })

        user.on("call", (call) => {
            // what to do when other peers on the group call you when u joined
            console.log("receiving a call");
            call.answer(stream);
            call.on("stream", () => {
                dispatch(addPeerAction(call.peer, stream));
            })
        })

        socket.emit("ready");
    }, [user, stream])

	return (
		<SocketContext.Provider value={{ socket, user, stream, peers }}>
			{children}
		</SocketContext.Provider>
	);
};

