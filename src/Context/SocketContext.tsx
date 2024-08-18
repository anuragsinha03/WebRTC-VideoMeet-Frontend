import SockerIoClient from "socket.io-client";
import Peer from 'peerjs'
import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {v4 as UUIDv4} from 'uuid'
const ws_server = "http://localhost:3000";

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
			host: "localhost",
			port: 9000,
			path: "/myapp"
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

	return (
		<SocketContext.Provider value={{ socket, user, stream }}>
			{children}
		</SocketContext.Provider>
	);
};
