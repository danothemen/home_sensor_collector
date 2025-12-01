import React from 'react';
import ReactPlayer from 'react-player';

const FishCam = () => {
  return (
    <div>
      <h2>Fish Camera</h2>
      <ReactPlayer url="/hls/stream.m3u8" playing controls />
    </div>
  );
};

export default FishCam;
