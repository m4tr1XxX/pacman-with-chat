const express = require('express');
const app = express();
const path = require("path");
app.use(express.static(__dirname + "/public"));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
const server = app.listen(8000, () => {
    console.log("listening on port 8000");
});
const io = require('socket.io')(server);
//
let users = {};
let count = 0;
let history = [];

io.on('connection', function (socket) {
    //new-users
    socket.on('new-user', function (data) {
        users[socket.id] = data.name;
        count++;
        io.emit('update-users', users, count);
        socket.broadcast.emit('new-connect', { name: data.name });
    });
    //disconnect handler
    socket.on('disconnect', function () {
        count--;
        socket.broadcast.emit('user-left', { name: users[socket.id] });
        delete users[socket.id];
        if (count < 0) {
            count = 0;
        }
        io.emit('update-users', users, count);
    });

    //on sent message
    socket.on('sent-message', function (data) {
        messages = { msg: data.msg, name: users[socket.id] };
        history.push(messages);
        io.emit('chat-message', messages);
    });
    //display score

});
//render index page
app.get('/', function (req, res) {
    res.render("index" , { chat: history });
});