// random-noise-processor.js
class SendAudioWorklet extends AudioWorkletProcessor {
    //
    // constructor(audioContext, name, websocket) {
    //     super(audioContext, name);
    //     this.websocket = websocket;
    // }
    static get parameterDescriptors() {
        return [{
            name: 'websocket',
            defaultValue: null
        }];
    }


    process(inputs, outputs, parameters) {
        const websocket = parameters.websocket;
        debugger;
        // this.websocket.send("blup")
    }
}

registerProcessor("save-audio-worklet", SendAudioWorklet);