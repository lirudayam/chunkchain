import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { ChatView } from './chat/ChatView';
const ENDPOINT = "http://localhost:4001";

function App() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", data => {
      setResponse(data);
    });
  }, []);

  return (
    <>
      <p>
        It's <time dateTime={response}>{response}</time>
      </p>
      <ChatView />
    </>
  );
}

export default App;