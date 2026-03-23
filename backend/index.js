const app = require('./server')
const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`.yellow.bold))

// Dev: CRA often runs on 3001/3002 if 3000 is taken — reflect request Origin (cors: true).
// Prod: set CLIENT_ORIGIN (comma-separated) or defaults below.
const socketCorsOrigin =
    process.env.NODE_ENV === "production"
        ? (process.env.CLIENT_ORIGIN
              ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
              : ["http://localhost:3000", "http://127.0.0.1:3000"])
        : true;

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: socketCorsOrigin,
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("connected to socket.io".cyan.bold);

    //new socket for each user
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    //new socket for each room
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log("user joined room: "+room);
    })

    socket.on("typing", (payload) => {
        const room = typeof payload === "string" ? payload : payload?.room;
        if (!room) return;
        const meta =
            typeof payload === "object" && payload != null
                ? { name: payload.name, userId: payload.userId }
                : {};
        socket.in(room).emit("typing", meta);
    });
    socket.on("stop typing", (payload) => {
        const room = typeof payload === "string" ? payload : payload?.room;
        if (!room) return;
        socket.in(room).emit("stop typing");
    });


    //new socket for each new message
    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.chat;
        if(!chat.users) console.log("chat.users not defined");
        chat.users.forEach(user => {
            if(user._id == newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived);
        })
    })

    socket.on("reaction updated", ({ chatId, message }) => {
        if (!chatId || !message) return;
        io.to(String(chatId)).emit("message reaction", message);
    })

    socket.off("setup", (userData)=>{
        console.log("USER DISCONNECTED");
        socket.leave(userData._id)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})