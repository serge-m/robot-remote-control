var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;


const { exec } = require('child_process');
function execute_command(command) {

  exec('pigs ' + command, (err, stdout, stderr) => {
    if (err) {
      console.log(`failed to execite commnad ${command}`); // node couldn't execute the command
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
};


app.use(express.static('public'))
/*app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
*/
io.on('connection', function(socket){
  console.log('user connected');

  socket.on('chat message', function(msg){
    console.log('chat message:' + msg);
    execute_command(msg);
    io.emit('chat message', msg);
  });

  socket.on('command', function(msg){
    console.log('command: ' + msg);
    io.emit('command', msg);
  });

  socket.on('disconnect', function(socket) {
    console.log('user disconnected');
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
