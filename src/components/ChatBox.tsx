import { useEffect, useRef, useState } from "react";
import {
  query,
  collection,
  orderBy,
  onSnapshot,
  limit,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase";
import Message from "./Message";
import SendMessage from "./SendMessage";

interface ChatMessage {
  id: string;
  uid: string;
  avatar: string;
  name: string;
  text: string;
  createdAt: { seconds: number; nanoseconds: number } | number;
}

const ChatBox = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      QuerySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id } as ChatMessage);
      });
      const sortedMessages = fetchedMessages.sort((a, b) => {
        // Handle both Firestore Timestamp and number
        const aTime =
          typeof a.createdAt === "number"
            ? a.createdAt
            : a.createdAt?.seconds || 0;
        const bTime =
          typeof b.createdAt === "number"
            ? b.createdAt
            : b.createdAt?.seconds || 0;
        return aTime - bTime;
      });
      setMessages(sortedMessages);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="chat-box">
      <div className="messages-wrapper">
        {messages?.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>
      {/* when a new message enters the chat, the screen scrolls down to the scroll div */}
      <div ref={scroll}></div>
      <SendMessage scroll={scroll as React.RefObject<HTMLDivElement>} />
    </main>
  );
};

export default ChatBox;
