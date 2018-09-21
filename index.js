var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;


const {exec} = require('child_process');

function exec_pwm_command(command, on_failure) {
  const pigs_command = 'pigs ' + command;
  console.log(pigs_command);
  exec(pigs_command, (err, stdout, stderr) => {
    if (err) {
      console.log(`failed to execite commnad ${command}`); // node couldn't execute the command
      if (on_failure) {
        on_failure(err);
      }
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}

function try_stop() {
  console.log("trying emergency stop");
  try {
    exec_pwm_command('p 12 0');
    console.log("emergency stop part 1");
  }
  catch(err) {}

  try {
    exec_pwm_command('p 13 0');
    console.log("emergency stop part 2");
  }
  catch(err) {}
}

function exec_command(command, on_failure) {
  const mapping = {
    'fwd': ['p 5 0', 'p 6 0', 'p 12 128', 'p 13 128'],
    'bwd': ['p 5 1', 'p 6 1', 'p 12 128', 'p 13 128'],
    'left': ['p 5 0', 'p 6 1', 'p 12 128', 'p 13 128'],
    'right': ['p 5 1', 'p 6 0', 'p 12 128', 'p 13 128'],
    'stop': ['p 12 0', 'p 13 0']
  };

  const commands = mapping[command];
  if (commands) {
    commands.forEach(cmd => exec_pwm_command(cmd, (err) => {
      on_failure(err);
      setTimeout(try_stop, 500);
    }));
  }
}


app.use(express.static('public'));

io.on('connection', function (socket) {
  console.log('user connected');

  socket.on('chat message', function (msg) {
    console.log('chat message:' + msg);
    io.emit('chat message', msg);
  });

  socket.on('command', function (command) {
    console.log('command: ' + command);
    exec_command(command, failure_message => {
      io.emit('command', 'Error: ' + failure_message)
    });
    io.emit('command', command);
  });

  socket.on('disconnect', function (socket) {
    console.log('user disconnected');
  });
});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
