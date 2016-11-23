//起服务器，页面响应
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var users = [];

app.use('/',express.static(__dirname + "/www"));

server.listen(8080);
console.log("Server has started.");

//socket
io.on('connection', function(socket){

	//console.log('An user connected.');


	socket.on('login', function(nickname){

		//判断用户名是否已经存在
		if (users.indexOf(nickname) > -1){
			socket.emit('loginFailed');
		}else{
			// socket.userIndex = users.length;
			socket.nickname = nickname;
			users.push(nickname);
			console.log(nickname + ' is online, total: ' + users.length);
			socket.emit('loginSuccess');
			io.sockets.emit('system', nickname, users.length, 'login');
		}

	});

	//断开连接，实时更新users数组
	//广播system事件
	socket.on('disconnect', function(){
		var index = users.indexOf(socket.nickname);
		users.splice(index, 1);
		io.sockets.emit('system', socket.nickname, users.length, 'logout');

		//test
		console.log(socket.nickname + ' is disconnected.');
		console.log(users);
	});


	socket.on('msgSend',function(msg){
		socket.broadcast.emit('newMsg', socket.nickname, msg);
	});

});
