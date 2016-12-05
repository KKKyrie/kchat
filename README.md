---
title: 教你撸一个网页聊天室
date: 2016-11-27 11:11:11
categories: 前端
---
## 一些废话:)
最近在学校比较闲，终于有这么一块时间可以自由支配了，所以内心还是十分的酸爽舒畅的。当然了，罪恶的事情也是有的，比如已经连续一周没有吃早饭了，其实现在回头想想，真的不能怪我啊，因为最近的天气实在是太！冷！了！好吧为了减少赖床的罪恶感，还是学(gǎo)点(diǎn)东(shì)西(qing)好了。不说废话了，还是进入正题。
## 进入正题
这个[丑陋无比的聊天室](http://kyrieliu.cn:8080)，暂时给他后面加个“v1.0”吧，毕竟也是没有经过什么迭代，写好就直接放出来了，当然也有很多可以再搞搞的地方，比如：
- [ ] 支持发送图片
- [ ] 支持发送表情
- [ ] 显示在线用户名单  
  
其实这里还是有很多想象空间的，不是重点也就不展开说了。  
在写这个demo的时候，我是边学边写的状态，学习资料以刘哇勇大神的[Node.js+Web Socket 打造即时聊天程序嗨聊](http://www.cnblogs.com/Wayou/p/hichat_built_with_nodejs_socket.html)为主，主流搜索引擎和我最喜欢的技术社区SegmentFault为辅。
### 源码
源码已经上传至[我的github](https://github.com/KKKyrie/kchat), clone到本地以后在terminal中运行下面两条命令：
```
npm install
node server
```
然后打开浏览器，访问localhost，就可以在不联网的情况下看到这个demo啦。  
### 预览
输入用户名完成登陆  
![login](https://raw.githubusercontent.com/KKKyrie/markdown-pics/master/kchat/login.png)

然后就可以开始和在线的人聊天了:smirk:  
![chat](https://raw.githubusercontent.com/KKKyrie/markdown-pics/master/kchat/chat.png)

### 准备工作
当然啦，Node.js是必不可少的，这里推荐两个很棒的Node.js教程：
- [Node入门](http://www.nodebeginner.org/index-zh-cn.html)
- [Node.js包教不包会](https://github.com/alsotang/node-lessons)

Node.js可以实现用短短的几行代码就起一个服务器
```
var http = require('http');
http.createServer(function(request, response){
    response.writeHead(200, {'Content-type':'text/plain'});
    response.write('Hey you, my name is kyrieliu~');
    response.end();
}).listen(8080);
```
当你在Terminal执行这段代码以后，访问http://localhost/:8080，就可以看到一行字：Hey you, my name is kyrieliu~  
这就代表你的node服务已经架起来了，阿西，js写后台逻辑，用脚指头想想都会觉得是一件很酷的事情呢:satisfied:
  
另外，还用到了两个包模块：
- [express](http://www.expressjs.com.cn/)
- [socket.io](http://socket.io)

> express是node.js中管理路由响应请求的模块，根据请求的URL返回相应的HTML页面。这里我们使用一个事先写好的静态页面返回给客户端，只需使用express指定要返回的页面的路径即可。如果不用这个包，我们需要将HTML代码与后台JavaScript代码写在一起进行请求的响应，不太方便。  
  
> socket.io封装了websocket，同时包含了其它的连接方式，比如Ajax。原因在于不是所有的浏览器都支持websocket，通过socket.io的封装，你不用关心里面用了什么连接方式。你在任何浏览器里都可以使用socket.io来建立异步的连接。

### UI
界面就像第一眼看到的那样简(chǒu)单(lòu)，不过“麻雀虽小，五脏俱全”，该有的东西还是得有，这里就直接贴DOM结构。
```
    <div class="container chat-container">
		
		<!-- 标题展示信息 -->
		<div class="row"></div>
		
		<!-- 历史消息 -->
		<div class="row">
			<div class="col-md-6 col-md-offset-3 col-sm-12 historyMsg" id="historyMsg"></div>
		</div>
		
		<!-- 控制台 -->
		<div class="row">
			<div class="col-md-6 col-md-offset-3 col-sm-12 control">
				<div class="row control-row"></div>
			</div>
		</div>

		<!-- 遮罩层 -->
		<div id="loginWrapper" class="loginWrapper"></div>
	</div>
```

直接看注释，就能清晰的看到这只小麻雀的“心”、“肝”、“脾”、“肺”四个部分。（“肾”呢？哼，你以为我的新手机怎么来的？:see_no_evil:）  
至于那些辣眼睛的类名，是因为项目里用到了Bootstrap，也算是偷了个懒。  

### 前端逻辑
UI搞定之后，思考一下这个聊天室的交互是怎么实现的。  
“你前面不是说了，用websocket嘛。”  
此话不假，不过这里我指的是交互，毕竟你写一个程序的话，对程序内的逻辑必须做到“吹毛求疵”（我这个成语用对了没:no_mouth:）  
- 与服务端建立连接
- 输入昵称完成登录
- 发送消息
- 接受消息  

仔细想想好像大概就这么多了，那就开始逐一攻破:rocket:
#### 与服务端建立连接
这里要注意，因为是一个聊天系统，所以与服务端建立连接的方式不同于往常，这里用到的协议是~~HTTP~~ WebSocket，从而实现持久连接。  
简单的解释一下，这里的“持久”，是相对于HTTP这种“非持久”的协议来说的（阁下的意思是，HTTP的夫人会很羡慕WebSocket的夫人咯）。  
通过阅读[Ovear](https://www.zhihu.com/people/Ovear/answers)在知乎上的回答，大致说一下这两个协议之间的区别。 
##### HTTP
HTTP的生命周期大概是这样的，一个request，一个response，这次请求就结束了；HTTP 1.1中进行了改进，增加了一个keep-alive，效果是在这次HTTP连接中，可以发送多个request，接受多个response，但本质上，**request = response**，也就是说，请求和响应永远是一一对应的，没有request时，服务端不能主动response。
##### WebSocket
当客户端与服务端完成协议升级以后（HTTP -> WebSocket），就建立了一个持久连接，有多持久呢？这个连接可以持续存在知道客户端或服务端某一方主动的关闭连接。与HTTP最大的不同是，此时的**服务端可以主动推送消息给客户端**咯。在这个项目中，我们用**socket.io**这个包模块来实现WebSocket，socket.io不仅实现了对WebSocket的封装，还将连同Ajax轮询和其他实时通信方式封装成了通用的接口，这么做的原因是，当服务器不支持WebSocket时，可以转换为其他的实现方式，啧啧啧，堪称纵享丝滑:kiss:  
  
接下来就是实现的部分，前端在引入了socket.io.js这个文件以后应该怎么做呢？  
Talk is cheap, show you the CODE.
```
var socket = io.connect();
```
对，就是这么简单，不信你去看[官方文档](http://socket.io)。

#### 输入昵称完成登录
这里的“登录”，不是真正的登录，当执行完``` io.connect() ```之后，这个连接就算已经建立了，这里是在处理一些交互上的行为。  
在前端监听一个connect事件，这个事件的触发条件是：成功和服务端建立连接。
```
socket.on('connect',function(){
    //do something
});
```
回调里面是此时要完成的DOM操作，比如：
1. 改变提示文字（初始是“Connecting to server......”）
2. 显示遮盖层
3. 聚焦文本框  

当用户输入自己的昵称点击登录按钮后，当前socket触发一个login事件到服务端：
```
socket.emit('login',nickname);
```
携带一个参数，这个参数就是用户输入的昵称。  
当服务端对这个昵称进行合法性检测，通过时触发：  
```
socket.on('loginSuccess', function(){
    //1. 隐藏登录层
    //2. 用户可以愉快和别人聊天了~
});
```
如果用户输入的昵称不合法，则触发：
```
socket.on('loginFailed', function(){
    //1. 提示用户昵称哪里出问题了
    //2. 等待用户重新输入
});
```
注意这里的事件名称，如login、loginSuccess、loginFailed都是自定义的，只要保证和服务端的一致就ok了。
#### 发送消息
想像一下用户发送消息这个动作，分解一下：输入文本 -> 点击发送。也就是这俩了，ok，这里需要给发送按钮挂上一个事件，告诉服务端，“服务端服务端，这里是socket XXX，我给你发了一个消息哦，注意查收，over。”
```
socket.emit('msgSend',msg);
```
携带一个参数，即用户的输入。
#### 接受消息
接受消息这个逻辑有三种情况
1. 自己发送的消息
2. 别人发送的消息
3. 系统的提示信息

莫慌，一个一个来看。
##### 自己发送的消息
自己发送的消息直接显示在聊天消息的面板，接收自己发送的消息不用和后台交互，只需要告诉后台我给大家发了这条消息即可。当然啦，你也可以仿照微信对自己发送的消息进行处理：发送的瞬间将自己的消息添加聊天面板 -> 给旁边放个小菊花或者loading的字样 -> 与后台进行交互 -> 成功则隐藏小菊花；失败则将小菊花变成红色感叹号暗示用户发送失败。
##### 别人发送的消息  
现在就需要在前端建立一个响应服务端“有新消息”的监听事件了。   
```
socket.on('newMsg', function(nickname, msg){
    //显示这条新消息
});
```
回调函数里面有两个参数，nickname和msg，分别是消息发送者的昵称和消息内容，这俩是怎么来的呢？不要急，后面会在服务端逻辑里面讲到，这里你只需要知道，在前端接受新消息的时候，因为牵扯到展示新消息，所以需要这两个参数。

##### 系统的提示信息
关于系统的提示信息，主要分为两个：
1. 提示新加入和退出的用户
2. 展示当前在线的用户数  

![提示新加入的用户](https://raw.githubusercontent.com/KKKyrie/markdown-pics/master/kchat/systemshow1.png)  
![提示退出的用户](https://raw.githubusercontent.com/KKKyrie/markdown-pics/master/kchat/systemshow2.png)  
大概是这个样子，所以需要在前端对系统事件进行监听  
```
socket.on('system', function(nickname, count, type){
    //1.根据系统事件类型（新加入或离开）来提示用户
    //2.修改在线用户数量
});
```
这里的三个参数也都是必不可少的，nickname代表触发系统事件的用户的昵称，count表示当前在线的用户数量，type表示事件类型（加入/离开）。同样，这三个参数也都是服务端传过来的。



### 后台逻辑
与前端对应，后台的逻辑主要分为以下几个部分
1. 起服务
2. 建立连接
3. 用户登录
4. 接受用户发送的消息并广播之
5. 系统消息的处理

#### 起服务
```
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use('/',express.static(__dirname + "/www"));
server.listen(8080);
```
因为我把前端文件(html/js/css)放到了www这个文件夹内，所以用express指定返回给浏览器的页面路径现在这样。
当然，除了*express*以外，也要引入*socket.io*模块并绑定到服务器。  
#### 建立连接
服务起好了，怎么建立连接呢？
```
io.on('connection', function(socket){
    //do something
});
```
就...这样...?  
昂。  
![黑人问号脸](https://raw.githubusercontent.com/KKKyrie/markdown-pics/master/kchat/blackmb.jpg)  
你没有看错，我也没有写错，这里对应前端逻辑的：
```
var socket = io.connect();
socket.on('connect', function(){
    //do something
});
```
连接建立了以后，所有关于socket活动的逻辑就可以开始写了。（FYI：当然，是写在这个connection事件的回调里面）
#### 用户登录
还记得前端触发的登录事件叫什么嘛
```
socket.emit('login', nickname);
```
叫login，而且还携带了一个参数——用户想给自己起的昵称nickname。好，我们来写对应的后台逻辑
```
socket.on('login', function(nickname){
    //do something
});
```
这里的*do something*要做什么呢？即对用户输入的昵称进行合法性校验，比如是否已经存在、长度限制、符号限制等。  
球都麻袋，好像有哪里不对...  
![我想想](https://raw.githubusercontent.com/KKKyrie/markdown-pics/master/kchat/thinking.jpg)  
长度限制和符号限制？这俩哥们根本就不用放在服务器上做嘛，直接在前端就搞了。所以我们的问题只剩一个了——昵称的唯一性。  
既然要检测昵称是否唯一，首先得有一个当前在线用户昵称的总集，不然去哪里检测昵称是否存在嘞？  
![](https://raw.githubusercontent.com/KKKyrie/markdown-pics/master/kchat/ucool.jpg)  
所以要在全局维护一个数组，保存当前在线用户的昵称
```
var users = [];
```
在这个数组里找用户通过login事件传过来的nickname，如果不存在，说明当前昵称合法，用户可以叫这个名字，那么
```
socket.nickname = nickname;//记录下当前socket的nickname
users.push(nickname);
socket.emit('loginSuccess');//触发loginSuccess事件
```
如果昵称已经存在了，就触发一登录失败事件，前端再做相应的交互即可。
```
socket.emit('loginFailed');
```
#### 接收用户发送的消息并
按照约定好的事件名来写服务端的监听程序
```
socket.on('msgSend', function(msg){
    socket.broadcast.emit('newMsg', socket.nickname, msg);
});
```
这里调用的api是socket的广播事件，效果是广播消息到除了当前socket以外的所有socket。
#### 系统消息的处理
剩下的工作就是处理系统消息了，首先要明确有哪些系统消息
- 提示用户加入
- 提示用户离开
- 更新在线用户数

当用户输入的昵称通过合法性校验以后，系统提示新加入的用户
```
io.sockets.emit('system',nickname, users.length, 'login');
```
*io.sockets.emit()*
的作用是向当前所有socket触发一个事件，这里要区别于*socket.broadcast.emit()*。  
仿照上面的代码，写出当用户离开时的广播事件：
```
io.sockets.emit('system', nickname, users.length, 'logout');
```
但是要写在哪里呢？这时候，就需要在服务端额外的监听一个断开事件
```
socket.on('disconnect', function(){
	var index = users.indexOf(socket.nickname);
	users.splice(index, 1);//将断开用户的昵称从全局数组users中删除
	io.sockets.emit('system', socket.nickname, users.length, 'logout');
});
```

## 总结
至此，一个基于Node.js的聊天室就算撸成了，当然还有许多可以优化的地方，不过核心功能也就这些，能看到这里的都是好汉，因为自己写完看了一遍，感觉真像是老太太的裹脚布——又臭又长:new_moon_with_face:  
好啦，最后打个广告，诶我就不说是什么，好奇的童鞋自己扫扫看吧~  
![马男刘凯里](https://raw.githubusercontent.com/KKKyrie/markdown-pics/mast/kchat/mp.jpg)
