"use client";
import { FormEvent, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import styles from "@/styles/chat.module.css";
import { useRouter } from "next/navigation";
import { getDate } from "@/features/getDate";

// Create a single instance of the socket
let socket: Socket | null = null;

const ChatPage = ({ searchParams }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");
  const [users, setUsers] = useState([]);
  const { name, room } = searchParams;
  const router = useRouter();
  const URL = process.env.NEXT_PUBLIC_URL || "localhost:5000";

  useEffect(() => {
    if (!socket) {
      socket = io(URL);

      socket.on("connect", () => {
        console.log("Connected to server!");

        socket?.emit("join", { name: name, room: room });

        socket?.on("message", (data) => {
          console.log("Message from server:", data);
          setMessages((prevMessages) => [...prevMessages, data]);
        });

        socket?.on("room", (data) => {
          setUsers(data.data.users || []);
        });
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [name, room]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message || !socket) return;

    socket.emit("sendMessage", { message, params: { name, room } });

    setMessage("");
  };

  const leftOfTheRoom = () => {
    socket?.emit("leftRoom", { params: { name, room } });
    router.replace("/");
  };

  return (
    <div className="main_cont">
      <section className="room_details">
        <p className={`${styles.heading}`}>CommNet</p>
        <p className={`${styles.chat_username}`}>Username: {name}</p>
        <p className={`${styles.chat_room}`}>Chat room: {room}</p>
        <button className={styles.back_btn} onClick={leftOfTheRoom}>
          Exit Room
        </button>
        <p className={`${styles.chat_users}`}>
          Current users in the room: {users.length}
        </p>
      </section>
      <section className="main">
        <div className="container">
          <div className={styles.header_container}>
            <h1 className={styles.header_chat}>Chat Room: {room}</h1>
            <button className={styles.back_btn} onClick={leftOfTheRoom}>
              Exit Room
            </button>
          </div>
          <div className={styles.messages_container}>
            {/* Display the current date */}
            <div className={styles.full_date}>
              <p className={styles.date}>{getDate().fullDate}</p>
            </div>
            {/* Display messages */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.messages} ${
                  msg.data.user.name === name
                    ? styles.user_message
                    : styles.other_message
                } ${msg.data.user.name === "Admin" ? styles.admin : ""}`}
              >
                {msg.data.user.name !== name && (
                  <strong className={styles.username}>
                    {msg?.data?.user?.name}:
                  </strong>
                )}
                {msg.data.user.name === name && (
                  <strong className={styles.username}>
                    {/* {msg?.data?.user?.name}: */}
                    You:
                  </strong>
                )}
                <p className={styles.message}>{msg.data?.message}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className={styles.message_form}>
            <input
              value={message}
              onChange={handleChange}
              aria-description="Enter your message"
              placeholder="Enter your message"
              type="text"
              autoFocus
              className={styles.message_input}
            />
            <button
              type="submit"
              className={styles.send_btn}
              aria-description="Send message button"
            >
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ChatPage;
