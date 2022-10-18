$(document).ready(function () {
    const socket = io();
    //store the username and send it to server
    let defaultName = "Player";
    let name = prompt('Enter Username', defaultName);
    if (name === null || name === undefined) {
        $(document).reload();
    }

    socket.emit('new-user', { name: name });
    let players = {};
    
    $('.user-container').append(`<p class='user'> ${name} (You) </p>`);
    $('.message-container').append(`<p class='user update'> You Joined </p>`);
    $('.message-container > .update').delay(3000).fadeOut();
    //submit messages
    $('#form').submit( function (event) {
        event.preventDefault();
        let message = $('#message').val();
        socket.emit('sent-message', { msg: message });
        $('#message').val('');
    });
    //append sent message to other users
    socket.on('chat-message', function (data) {
        $('.message-container').append(`<p class='chat'><span>${data.name}:</span> ${data.msg}</p>`);
        $('.message-container').scrollTop($('.message-container')[0].scrollHeight);
    });
    //display new user
    socket.on('new-connect', function (data) {
        $('.message-container').append(`<p class='user update'> ${data.name} JOINED</p>`);
        $('.message-container > .update').delay(5000).fadeOut();
        $('.message-container').scrollTop($('.message-container')[0].scrollHeight);
    });
    //display users who left
    socket.on('user-left', function (data) {
        if (data.name !== undefined) {
            $('.message-container').append(`<p class='left update'> ${data.name} LEFT</p>`);
            $('.message-container > .update').delay(5000).fadeOut();
            $('.message-container').scrollTop($('.message-container')[0].scrollHeight);
        }
    });
    //update displayed users
    socket.on('update-users', function (users, count) {
        $('.user-container > span').html(`${count}`);
        playersFound = {};
        for (let id in users) {
            if (players[id] === undefined && id !== socket.id) {
                players[id] = `<p id='${id}' class='user'> ${users[id]}</p>`;
                $('.user-container').append(players[id]);
            }
            playersFound[id] = true;
        }
        for (let id in players) {
            if (!playersFound[id]) {
                $(`#${id}`).remove();
            }
        }
    });
});