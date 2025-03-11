/*
A worklet for recording in sync with AudioContext.currentTime.

More info about the API:
https://developers.google.com/web/updates/2017/12/audio-worklet

How to use:

1. Serve this file from your server (e.g. put it in the "public" folder) as is.

2. Register the worklet:

    const audioContext = new AudioContext();
    audioContext.audioWorklet.addModule('path/to/recorderWorkletProcessor.js')
      .then(() => {
        // your code here
      })

3. Whenever you need to record anything, create a WorkletNode, route the
audio into it, and schedule the values for 'isRecording' parameter:

      const recorderNode = new window.AudioWorkletNode(
        audioContext,
        'recorder-worklet'
      );

      yourSourceNode.connect(recorderNode);
      recorderNode.connect(audioContext.destination);

      recorderNode.port.onmessage = (e) => {
        if (e.data.eventType === 'data') {
          const audioData = e.data.audioBuffer;
          // process pcm data
        }

        if (e.data.eventType === 'stop') {
          // recording has stopped
        }
      };

      recorderNode.parameters.get('isRecording').setValueAtTime(1, time);
      recorderNode.parameters.get('isRecording').setValueAtTime(
        0,
        time + duration
      );
      yourSourceNode.start(time);

*/

class RecorderWorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this._bufferSize = 2048;
        this._buffer = new Float32Array(this._bufferSize);
        this._initBuffer();
    }

    _initBuffer() {
        this._bytesWritten = 0;
    }

    _isBufferEmpty() {
        return this._bytesWritten === 0;
    }

    _isBufferFull() {
        return this._bytesWritten === this._bufferSize;
    }

    _appendToBuffer(value) {
        if (this._isBufferFull()) {
            this._flush();
        }

        this._buffer[this._bytesWritten] = value;
        this._bytesWritten += 1;
    }

    _flush() {
        let buffer = this._buffer;
        if (this._bytesWritten < this._bufferSize) {
            buffer = buffer.slice(0, this._bytesWritten);
        }

        this.port.postMessage({
            eventType: 'data',
            audioBuffer: buffer
        });

        this._initBuffer();
    }

    process(inputs, outputs, parameters) {
        if (inputs[0][0] === undefined) {
            return
        }
        for (const byte of inputs[0][0]) {
           this._appendToBuffer(byte)
        }
        return true;
    }

}

registerProcessor('recorder-worklet', RecorderWorkletProcessor);