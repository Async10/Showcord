"use client";
import { useContext } from "react";
import { PS_context } from "./PS_context";
import { useEffect, useState } from "react";
import HashtagIcon from "../../public/hashtag.svg";
import { Room } from "@/client/room";
import { debounce } from "lodash";

export default function Rooms({className}: {className: string}){
  const { client, room: selectRoom, setRoom} = useContext(PS_context);
  const [rooms, setRooms] = useState<Room[]>([]);
  useEffect(() => {
    if (!client) {
      return;
    }
    const handleRoomEvent = debounce(async (rooms: Room[]) => {
      setRooms(rooms);
      localStorage.setItem("rooms", JSON.stringify(rooms.map((e:Room) => e.name)))
    }, 200); // Not sure how long the debounce should be. Without it, we overlap events

    const eventListener = (room: any) => {
      const updatedRooms = [...client.rooms];
      handleRoomEvent(updatedRooms);
    };

    client.events.addEventListener("room", eventListener);

    return () => {
      // Clean up the event listener when the component unmounts
      client.events.removeEventListener("room", eventListener);
    };
  }, [client]);

  // select the first room by default
  useEffect(() => {
    if (rooms.length && !selectRoom) {
      setRoom(rooms[0].ID);
    }
  }, [rooms]);

  return (
    <div className={"bg-gray-600 h-full " + className}>
      {/** big fat text */}
      <div className="flex flex-row items-center p-2 text-white font-bold text-lg h-16 ">
        Pokémon Showdown!
      </div>
      {rooms.map((room, idx) => (
        <RoomComponent key={idx} name={room.name} ID={room.ID} />
      ))}
    </div>
  );
}

export function RoomComponent({ name, ID }: { name: string; ID: string }) {
  const { setRoom, room } = useContext(PS_context);
  const selectRoom = () => {
    setRoom(ID);
  };
  return (
    <div>
      <span className={'rounded p-1 flex flex-row items-center  w-auto h-auto mr-2 ml-2 ' + (ID === room ? "bg-gray-450 hover:bg-gray-450 text-white" : "hover:bg-gray-350 text-gray-150 ") } onClick={selectRoom}>
        <HashtagIcon height={16} width={16}/>
      <span className="ml-2">
        {name}
      </span>
      </span>
    </div>
  );
}
