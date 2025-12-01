const av = require('node-av');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { exec } = require('child_process');

const RTMP_URL = 'rtmp://localhost:1935/live/stream';

function getVideoDevice(callback) {
  const command = `"${ffmpegPath}" -list_devices true -f dshow -i dummy`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error listing devices: ${error.message}`);
      return callback(error);
    }

    const output = stderr.toString();
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('(video)')) {
        const match = line.match(/"([^"]+)"/);
        if (match && match[1]) {
          return callback(null, match[1]);
        }
      }
    }

    return callback(new Error('No video devices found.'));
  });
}

async function startStream(videoDevice) {
    console.log(`Starting stream from device: ${videoDevice}`);
    
    try {
        const demuxer = new av.Demuxer({
            name: 'dshow',
            options: { video_size: '1280x720', framerate: '30' }
        });
        demuxer.open(`video=${videoDevice}`);

        const videoDecoder = new av.Decoder(demuxer.streams[0].codec);
        const videoEncoder = new av.Encoder({
            name: 'libx265', // Changed to h265
            width: 1280, // Changed to 720p
            height: 720, // Changed to 720p
            pixelFormat: 'yuv420p',
            timeBase: [1, 30],
            bitRate: 2.5e6,
            gopSize: 10,
            maxBFrames: 1,
            threadCount: 1,
            preset: 'veryfast',
            tune: 'zerolatency'
        });

        const audioDecoder = new av.Decoder(demuxer.streams[1].codec);
        const audioEncoder = new av.Encoder({
            name: 'aac',
            sampleRate: demuxer.streams[1].codec.sampleRate,
            channelLayout: demuxer.streams[1].codec.channelLayout,
            bitRate: 128e3
        });

        const muxer = new av.Muxer({ name: 'flv', output: RTMP_URL });
        const videoStream = muxer.addStream(videoEncoder);
        const audioStream = muxer.addStream(audioEncoder);

        muxer.open();

        demuxer.on('data', async (packet) => {
            if (packet.streamIndex === videoStream.index) {
                const frames = videoDecoder.decode(packet);
                for (const frame of frames) {
                    const encodedPackets = videoEncoder.encode(frame);
                    for (const encodedPacket of encodedPackets) {
                        muxer.write(encodedPacket, videoStream);
                    }
                }
            } else if (packet.streamIndex === audioStream.index) {
                const frames = audioDecoder.decode(packet);
                for (const frame of frames) {
                    const encodedPackets = audioEncoder.encode(frame);
                    for (const encodedPacket of encodedPackets) {
                        muxer.write(encodedPacket, audioStream);
                    }
                }
            }
        });

        demuxer.on('error', (err) => {
            console.error('Demuxer error:', err);
            restartStream(videoDevice);
        });

        muxer.on('error', (err) => {
            console.error('Muxer error:', err);
            restartStream(videoDevice);
        });

        console.log('Streaming started...');

    } catch (err) {
        console.error('An error occurred:', err);
        restartStream(videoDevice);
    }
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
