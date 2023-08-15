"use client";
import { Client } from "@/client/client";
import { Message } from "@/client/message";
import { Room } from "@/client/room";
import dotenv from "dotenv";
import { createContext, useCallback, useEffect, useState } from "react";
dotenv.config();

export const PS_context = createContext<
  {
    client: Client | null;
    selectedRoom: string | null;
    setRoom: (room: string | 1 | -1) => void;
    messages: Message[];
    user?: string; // Will be an object with user info
    rooms: Room[];
  }
>({
  client: null,
  selectedRoom: null,
  setRoom: () => {},
  messages: [],
  user: undefined,
  rooms: [],
});

export default function PS_contextProvider(props: any) {
  const [client, setClient] = useState<Client | null>(null);
  const [user, setUser] = useState<string | undefined>();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [previousRooms, setPreviousRooms] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [updateMessages, setUpdateMessages] = useState<number>(0);

  const lastRooms = () => {
    const rooms = localStorage.getItem("rooms");
    const defaultRooms = ["lobby", "help", "overused"];
    if (rooms) {
      return JSON.parse(rooms);
    }
    return defaultRooms;
  };

  /* --- Room handling --- */

  const setRoom = useCallback((room: string | 1 | -1) => {
    if (typeof room === "number") {
      if (rooms) {
        if (!selectedRoom) return;
        const roomNames = rooms.map((r) => r.ID);
        console.log(roomNames);
        console.log(selectedRoom);
        const index = roomNames.indexOf(selectedRoom);
        console.log(index);
        const newIndex = index + room;
        if (newIndex >= roomNames.length) room = roomNames[0];
        else if (newIndex < 0) room = roomNames[roomNames.length - 1];
        else room = roomNames[newIndex];
      } else {
        console.log("No rooms found");
        return;
      }
    }
    if (client?.room(room)) {
      const tmpPR = previousRooms;
      if (tmpPR.includes(room)) {
        const index = previousRooms.indexOf(room);
        tmpPR.splice(index, 1);
      }
      tmpPR.push(room);
      if (tmpPR.length > 5) tmpPR.shift();
      setPreviousRooms(tmpPR);
      setSelectedRoom(room);
    } else {
      console.log("Trying to set room that does not exist (" + room + ")");
    }
  }, [client, rooms, selectedRoom, previousRooms]);

  useEffect(() => {
    if (!client) {
      return;
    }
    const eventListener = () => {
      setRooms(client.rooms);
      localStorage.setItem("rooms", JSON.stringify(client.rooms.map((r) => r.ID)));
      if (!selectedRoom && client.rooms.length > 0) {
        setRoom(client.rooms[0].ID);
      }
    };

    client.events.addEventListener("room", eventListener);
    client.events.addEventListener("leaveroom", eventListener);

    return () => {
      client.events.removeEventListener("room", eventListener);
      client.events.removeEventListener("leaveroom", eventListener);
    };
  }, [client, setRooms, selectedRoom, setRoom])

  useEffect(() => {
    if (!client) return;
    client.events.addEventListener("leaveroom", (_) => {
      // if the current room was deleted, go to the last room
      if (selectedRoom && !client.room(selectedRoom)) {
        const lastRoom = previousRooms[previousRooms.length - 2];
        if (lastRoom) {
          setRoom(lastRoom);
        }
      }
    });
  }, [client, previousRooms, selectedRoom, setRoom]);

  useEffect(() => {
    if (!client) return;
    client.join(lastRooms());
    // client.login({username, password});
  }, [client]);

  /* --- End room handling --- */

  /* --- Message handling --- */
  const handleMsgEvent = async (setMessages: any) => {
    if (!client) {
      return;
    }
    if (!selectedRoom) {
      return;
    }
    const msgs = client.room(selectedRoom)?.messages ?? [];
    console.log("msgs", msgs.length);
    setMessages(msgs);
  };

  useEffect(() => {
    if (!client) {
      return;
    }
    if (!selectedRoom) {
      return;
    }

    setMessages(client.room(selectedRoom)?.messages ?? []);

    const eventListener = () => {
      // handleMsgEvent();
      setUpdateMessages(updateMessages + 1);
    };

    client.events.addEventListener("message", eventListener);

    return () => {
      // Clean up the event listener when the component unmounts
      client.events.removeEventListener("message", eventListener);
    };
  }, [client, selectedRoom, setMessages, updateMessages]);

  useEffect(() => {
    handleMsgEvent(setMessages);
  }, [handleMsgEvent, setMessages]);

  /* --- End message handling --- */

  useEffect(() => {
    const client = new Client();
    client.socket.onopen = () => {
      setClient(client);
    };
    client.events.addEventListener("login", (username) => {
      console.log("logged in as", username);
      setUser((username as CustomEvent).detail);
    });
  }, []);

  /* --- End user handling --- */

  return (
    <PS_context.Provider
      value={{
        client: client,
        selectedRoom,
        setRoom,
        user,
        messages,
        rooms,
      }}
    >
      {props.children}
    </PS_context.Provider>
  );
}
