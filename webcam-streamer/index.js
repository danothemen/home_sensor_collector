const { spawn } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { exec } = require('child_process');

const RTMP_URL = 'rtmp://localhost:1935/live/stream';

function getVideoDevice(callback) {
  const command = `"${ffmpegPath}" -list_devices true -f dshow -i dummy`;

  exec(command, (_error, _stdout, stderr) => {
    // ffmpeg -list_devices always exits with error, but the output is still valid
    // Parse stderr regardless of error status
    const output = stderr.toString();
    const lines = output.split('\n');

    let inVideoSection = false;
    for (const line of lines) {
      // Start of video devices section
      if (line.includes('DirectShow video devices')) {
        inVideoSection = true;
        continue;
      }

      // End of video devices section
      if (line.includes('DirectShow audio devices')) {
        inVideoSection = false;
        continue;
      }

      // Look for device names in video section
      if (inVideoSection && line.includes('"')) {
        const match = line.match(/"([^"]+)"/);
        if (match && match[1] && !line.includes('Alternative name')) {
          return callback(null, match[1]);
        }
      }
    }

    return callback(new Error('No video devices found.'));
  });
}

function startStream(videoDevice) {
    console.log(`Starting stream from device: ${videoDevice}`);

    // FFmpeg arguments for capturing from DirectShow and streaming to RTMP
    const args = [
        '-f', 'dshow',
        '-video_size', '1280x720',
        '-framerate', '30',
        '-i', `video=${videoDevice}`,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-b:v', '2500k',
        '-maxrate', '2500k',
        '-bufsize', '5000k',
        '-g', '60',
        '-pix_fmt', 'yuv420p',
        '-f', 'flv',
        RTMP_URL
    ];

    console.log(`Running: ${ffmpegPath} ${args.join(' ')}`);

    const ffmpegProcess = spawn(ffmpegPath, args, {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    ffmpegProcess.stdout.on('data', (data) => {
        console.log(`FFmpeg stdout: ${data}`);
    });

    ffmpegProcess.stderr.on('data', (data) => {
        // FFmpeg outputs progress info to stderr
        const message = data.toString();
        // Only log important messages, not every frame
        if (message.includes('error') || message.includes('Error') ||
            message.includes('Stream') || message.includes('Press [q]')) {
            console.log(message.trim());
        }
    });

    ffmpegProcess.on('error', (err) => {
        console.error('Failed to start FFmpeg:', err);
        restartStream(videoDevice);
    });

    ffmpegProcess.on('close', (code) => {
        console.log(`FFmpeg process exited with code ${code}`);
        restartStream(videoDevice);
    });

    console.log('Streaming started...');

    return ffmpegProcess;
}

function restartStream(videoDevice) {
    console.log('Restarting stream in 5 seconds...');
    setTimeout(() => startStream(videoDevice), 5000);
}

console.log('Finding video device...');
getVideoDevice((err, deviceName) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  startStream(deviceName);
});
