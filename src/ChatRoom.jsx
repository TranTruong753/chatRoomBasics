import { useState, useEffect } from "react";
import axios from "axios";


const ChatRoom = ({ roomName, user }) => {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [chat, setChat] = useState("");

  useEffect(() => {
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/`);
    setSocket(ws);

    // Gọi API lấy lịch sử tin nhắn
    axios
      .get(`http://127.0.0.1:8000/chat-history/${roomName}/`)
      .then((response) => setChats(response.data))
      .catch((error) => console.error("Error fetching chat history:", error));

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setChats((prev) => [
        ...prev,
        { sender: data.sender, chat: data.message },
      ]); // Đổi "chat" thành "message"
    };

    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket disconnected");

    return () => {
      ws.close(); // Cleanup WebSocket khi component unmount
    };
  }, [roomName]);

  const sendChat = () => {
    if (socket && chat) {
      socket.send(JSON.stringify({ message: chat, sender: user })); // Đảm bảo gửi đúng key "message"
      setChat("");
    }
  };
  const styles = {
    container: {
      minHeight: "100vh", // Chiều cao tối thiểu là 100% chiều cao màn hình
      width: "100vw", // Chiều rộng là 100% chiều rộng màn hình
      display: "flex", // Dùng Flexbox
      justifyContent: "center", // Canh giữa theo chiều ngang
      alignItems: "center", // Canh giữa theo chiều dọc
      background: "#f0f2f5", // Màu nền sáng
    },

    title: {
      fontSize: "20px",
      textAlign: "center",
      marginBottom: "16px",
      color: "#333",
    },
    chatBox: {
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "10px",
      height: "300px",
      overflowY: "auto",
      marginBottom: "10px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      background: "#f9f9f9",
    },
    message: {
      padding: "8px 12px",
      borderRadius: "12px",
      maxWidth: "75%",
      wordBreak: "break-word",
    },
    inputContainer: {
      display: "flex",
      gap: "10px",
    },
    input: {
      flex: 1,
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      fontSize: "16px",
    },
    button: {
      padding: "10px 16px",
      borderRadius: "8px",
      backgroundColor: "#4CAF50",
      color: "#fff",
      fontSize: "16px",
      border: "none",
      cursor: "pointer",
    },
  };

  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChat();
    }
};

  return (
    <div style={styles.container}>
      <div
        style={{
          border: "2px solid #ccc",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <h2 style={styles.title}>Phòng chat: {roomName}</h2>

        <div style={styles.chatBox}>
          {chats.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                alignSelf: msg.sender === user ? "flex-end" : "flex-start",
                backgroundColor: msg.sender === user ? "#DCF8C6" : "#E6E6E6",
              }}
            >
              <strong>{msg.sender}:</strong> {msg.chat}
            </div>
          ))}
        </div>

        <div style={styles.inputContainer}>
          <input
            type="text"
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            placeholder="Nhập tin nhắn..."
            style={styles.input}
            onKeyDown={handleKeyPress}
          />
          <button onClick={sendChat} style={styles.button}>
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
