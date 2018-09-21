var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const util = require('util');
const exec = util.promisify(require('child_process').exec);


var port = process.env.PORT || 3000;


async function exec_pwm_command(command) {
  const pigs_command = `pigs ${command}`;
  // if (command === 'p 6 0') {
  //   throw new Error('BOOOOO');
  // }
  const { stdout, stderr } = await exec(pigs_command, );
  if (stdout) {
    console.log(`Command ${command} stdout: ${stdout}`);
  }
  if (stderr) {
    throw new Error(`Executing pwm command '${command}' failed. stderr: ${String(stderr).replace('\n', '\\n ')}`);
  }
}

function try_stop() {
  console.log("emergency stop started");

  exec_pwm_command('p 12 0').catch(e => {
    console.log(`failure during emergency stop: ${e}`)
  });

  exec_pwm_command('p 13 0').catch(e => {
    console.log(`failure during emergency stop: ${e}`)
  });

  console.log("emergency stop finished");
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
    var promises = commands.map(str_command => exec_pwm_command(str_command));
    Promise.all(promises).then(res => {
      console.log(`Command ${command} executed successfully. Res: ${res}`);
    }).catch(err => {
      console.log(`Command ${command} failed. err ${err}`);
      try_stop();
    });
  } else  {
    on_failure(`command not found: ${command}`);
  }
}


app.use(express.static('public'));

io.on('connection', function (socket) {
  console.log('user connected');

  socket.on('chat message', function (msg) {
    console.log(`chat message: ${msg}`);
    io.emit('chat message', msg);
  });

  socket.on('command', function (command) {
    console.log(`command: ${command}`);
    exec_command(command, failure_message => {
      io.emit('command', `Error: ${failure_message}`)
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
