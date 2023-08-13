"use client";
import IconProfile from "@/assets/profile";
import { FormEvent, useContext, useEffect, useState } from "react";
import { PS_context } from "./PS_context";
import { userColor } from "@/utils/namecolour";
import Modal from "./modal";

export default function UserPanel() {
  const [username, setUsername] = useState<string>(""); // [username, setUsername
  const [showModal, setShowModal] = useState<boolean>(false); // [username, setUsername
  const { client, loggedIn } = useContext(PS_context);

  useEffect(() => {
    if (!client) {
      return;
    }
    const handleUserEvent = async (username: string) => {
      setUsername(username);
      // localStorage.setItem("", JSON.stringify())
    };

    const eventListener = (room: any) => {
      const username = client.username;
      handleUserEvent(username);
    };

    client.events.addEventListener("room", eventListener);

    return () => {
      // Clean up the event listener when the component unmounts
      client.events.removeEventListener("room", eventListener);
    };
  }, [client, setUsername]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    console.log('submitted login')
    e.preventDefault();
    const formD = new FormData(e.currentTarget);
    const username = formD.get("username");
    const password = formD.get("password");
    if(client) client.login({username: username as string, password: password as string});
    else console.log('no client')
  }

  useEffect(() => {
    console.log('loggedIn was updated', loggedIn)
    if(loggedIn) setShowModal(false);
  }, [loggedIn, setShowModal])


  return (
    <div className="h-20 text-white p-3 flex items-center">
      {showModal &&
        (
          <Modal onClose={() => setShowModal(false)}>
            <form onSubmit={onSubmit}>
              <label className="text-white" htmlFor="username">Username</label>
              <input className="w-full" type="text" id="username" name="username" />
              <label className="text-white" htmlFor="password">Password</label>
              <input className="w-full" type="password" id="password" name="password" />
              <button type="submit">Login</button>
            </form>
          </Modal>
        )}
      <span className={"rounded text-lg flex flex-row items-center h-auto " + (username ? "bg-gray-600 w-auto p-2 " : "bg-gray-600 w-full font-bold ") } >
        {username
          ? (
            <>
              <IconProfile className="mr-2 m-auto" />
              <span
                style={{ color: userColor(username) }}
                className="font-bold"
              >
                {username}
              </span>
            </>
          )
          : (
            <>
              <button
                onClick={() => setShowModal(true)}
                className="font-bold rounded px-2 py-1 w-full"
              >
                Login
              </button>
            </>
          )}
      </span>
    </div>
  );
}