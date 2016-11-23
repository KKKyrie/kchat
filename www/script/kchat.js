// var socket = io.connect(); //与服务器进行连接
// var button = document.getElementById("sendBtn");
// button.onclick = function() {
// 	socket.emit("message", "kkkyrie"); //这个msg是用户的输入
// }

window.onload = function(){
	var kchat = new KChat();
	kchat.init();
};

var KChat = function(){
	this.socket = null;
};

KChat.prototype = {

	init: function(){
		var that = this;

		//建立与服务器的socket连接
		this.socket = io.connect();

		//监听socket的connect事件，此事件表示连接已经建立
		this.socket.on('connect',function(){
			document.getElementById('info').textContent = 'Go get youself a nickname :)';
			document.getElementById('nickWrapper').style.display = 'block';
			document.getElementById('nicknameInput').focus();
		});

		//登录失败
		this.socket.on('loginFailed', function(){
			var info = document.getElementById('info');
			info.textContent = 'nickname exists, try another :)';
			info.style.color = 'red';
		});

		//登录成功
		this.socket.on('loginSuccess', function(){
			document.title = 'KChat | ' + document.getElementById('nicknameInput').value;
			document.getElementById('loginWrapper').style.display = 'none';
			document.getElementById('inputMsg').focus();
		});

		//系统人数更新，提示用户新加入或离开
		this.socket.on('system', function(nickname, count, type){
			that._systemInfo(nickname, count, type);
		});

		//收到新消息
		this.socket.on('newMsg', function(nickname, msg){
			that._displayNewMsg(nickname, msg, 'newMsg');
			// alert(nickname + ': ' + msg);
		});


		//设置登陆按钮和nicknameInput的监听事件(click&keyup)login
		document.getElementById('loginBtn').addEventListener('click', function(){
			var nickname = document.getElementById('nicknameInput').value.trim();
			var info = document.getElementById('info');
			var nicknameInput = document.getElementById('nicknameInput');
			
				
			if (nickname.length == 0 || nickname.length > 10){
				//如果用户名为空或超出长度限制
				info.textContent = 'nickname illegal, try another :)';
				info.style.color = 'red';
				nicknameInput.value = '';
				nicknameInput.focus();
			}else{
				//用户名合法
				that.socket.emit('login', nickname);

			}
		}, false);
		document.getElementById('nicknameInput').addEventListener('keyup', function(e){
			if (e.keyCode == 13){
				var nicknameInput = document.getElementById('nicknameInput');
				var nickname = nicknameInput.value.trim();
				var info = document.getElementById('info');
				
			
				if (nickname.length == 0 || nickname.length > 10){
					//如果用户名为空或超出长度限制
					info.textContent = 'nickname illegal, try another :)';
					info.style.color = 'red';
					nicknameInput.value = '';
					nicknameInput.focus();
				}else{
				//用户名合法
				that.socket.emit('login', nickname);
				}
			}
		}, false);


		//发送按钮和inputMsg监听事件
		document.getElementById('sendBtn').addEventListener('click', function(){
			//1.获取用户输入
			//2.检测是否超出长度限制
			//3.通过检测则直接广播
			var inputMsg = document.getElementById('inputMsg');
			var msg = inputMsg.value.replace('\n','');
			if (msg == ''){
				inputMsg.focus();
				return;
			}
			
			if (msg.length > 15){
				alert('Sorry啊,字数上限为15字:)');
				inputMsg.focus();
			}else{
				that.socket.emit('msgSend', msg);
				inputMsg.value = '';
				that._displayNewMsg('', msg, 'myMsg');
			}
		}, false);

		document.getElementById('inputMsg').addEventListener('keyup', function(e){
			if (e.keyCode == 13){
				var inputMsg = document.getElementById('inputMsg');
				inputMsg.value = inputMsg.value.replace('\n','');
				var msg = inputMsg.value.replace('\n','');
				if (msg == ''){
					inputMsg.focus();
					return;
				}
				
				if (msg.length > 15){
					alert('Sorry啊,字数上限为15字:)');
					inputMsg.focus();
				}else{
					that.socket.emit('msgSend', msg);
					inputMsg.value = '';
					inputMsg.focus();
					that._displayNewMsg('', msg, 'myMsg');
				}
			}
		}, false);


	},

	_displayNewMsg: function(nickname, msg, who){
		var historyMsg = document.getElementById('historyMsg');
		// var fragment = document.createDocumentFragment();

		/*
			<p class="message">
				<span class="nickname">kyrieliu</span>
				<span class="timespan">(21:00:15):</span>
				去去去去去去去去去去去去去去去
			</p>
		*/
		
		var p = document.createElement('p');
		p.setAttribute('class',who);

		var span_nickname = document.createElement('span');
		span_nickname.setAttribute('class','nickname');
		span_nickname.textContent = nickname;

		var span_timespan = document.createElement('span');
		span_timespan.setAttribute('class','timespan');
		var time = '(' + new Date().toTimeString().substr(0, 8) + ')';
		span_timespan.textContent = time;

		var text = document.createTextNode(msg);

		p.appendChild(span_nickname);
		p.appendChild(span_timespan);
		p.appendChild(text);

		historyMsg.appendChild(p);

		//控制滚动条自动滚到底部
		historyMsg.scrollTop = historyMsg.scrollHeight;

	},

	_systemInfo: function(nickname, count, type){
		
		document.getElementById('status').textContent = count;
			
		var historyMsg = document.getElementById('historyMsg');
		// <p class="system"><span class="nickname">kyrieliu</span>加入了群聊</p>
		var p = document.createElement('p');
		var span = document.createElement('span');
		var text;
		if (type == 'login'){
			text = document.createTextNode('加入了群聊');
		}else if (type == 'logout'){
			text = document.createTextNode('离开了群聊');
		}

		p.setAttribute('class','system');
		span.setAttribute('class','nickname');
		span.textContent = nickname;

		p.appendChild(span);
		p.appendChild(text);


		historyMsg.appendChild(p);
	}

};



