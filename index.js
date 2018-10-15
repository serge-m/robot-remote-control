process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  console.log(err.stack);
});


var express = require('express');
var app = express();
const wss = require('express-ws')(app);
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const raspividStream = require('raspivid-stream');


var port = process.env.PORT || 3000;
let connects = [];



app.ws('/video-stream', (ws, req) => {
    console.log('Video client connected');

    ws.send(JSON.stringify({
      action: 'init',
      width: '960',
      height: '540'
    }));

    var videoStream = raspividStream({ rotation: 270 });

    videoStream.on('data', (data) => {
        ws.send(data, { binary: true }, (error) => { if (error) console.error(error); });
    });

    ws.on('close', () => {
        console.log('Video client left');
        videoStream.removeAllListeners('data');
    });
});


async function exec_pwm_command(command) {
  const pigs_command = `pigs ${command}`;
  //console.log(`pigs command: ${pigs_command}`)
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
    'bwd': ['p 5 0', 'p 6 0', 'p 12 128', 'p 13 128'],
    'fwd': ['p 5 128', 'p 6 128', 'p 12 128', 'p 13 128'],
    'left': ['p 5 0', 'p 6 128', 'p 12 128', 'p 13 128'],
    'right': ['p 5 128', 'p 6 0', 'p 12 128', 'p 13 128'],
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

app.ws('/commands', (ws, req) => {
  console.log('Commands client connected');
  connects.push(ws);

  ws.on('message', message => {
    console.log('Received -', message);

    const msg = JSON.parse(message);

    console.log(`Received message with type ${msg.type} and value ${msg.value}`);


    connects.forEach(socket => {
      socket.send(message);
    });

    if (msg.type === 'command') {
      exec_command(msg.value);
    }
  });

  ws.on('close', () => {
    console.log('Commands client disconnected');
    connects = connects.filter(conn => {
      return (conn === ws) ? false : true;
    });
  });
});


app.listen(port, function () {
  console.log('listening on *:' + port);
});
