import { frame_dict, viseme_dict } from "./visemeMaps.js"; // If you have a visemeMaps file

// Declare local variables , theses are hidden from the global scope
let _speechConfig = null;
let _visemeArr = [];
let _audio = [];

class FaceGenerator {
	constructor() {
		this.currentViseme = 1;
	}
	// Called from GameOrchestrator
	initializeTTS(key) {
		// Azure Speech Service credentials
		const subscriptionKey = String(key);
		const region = "eastus";
	
		// Initialize Speech SDK configuration
		const Config = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, region);
		Config.speechSynthesisOutputFormat = SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoWithMetadata;
		_speechConfig = Config;
		console.log('config_done');
	
	}
	
	// Function to handle speech synthesis
	async generate(text,voice,onlyAudio=false) {
		if (!text) return;

		//Clear the viseme array
		_visemeArr = [];
		
		return new Promise((resolve, reject) => {
			
		// Pass second arg as null to avoid default playback
		const synthesizer = new SpeechSDK.SpeechSynthesizer(_speechConfig,null);
		
		// Attach event listeners
		synthesizer.visemeReceived = (s, e) => {
			const visemeId = e.visemeId;
			const timestamp = e.audioOffset / 10000; // Convert nanoseconds to milliseconds
			_visemeArr.push([visemeId, timestamp]);
		};
		
		synthesizer.synthesisStarted = () => console.log("Synthesis started...");
		synthesizer.synthesisCompleted = () => {
			console.log("Synthesis completed.");
			synthesizer.close(); // Clean up
		};
		// SSML for speech synthesis
		const ssml = `<speak version='1.0' xml:lang='en-US' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts'> \r\n \
				<voice name='${voice}'> \r\n \
					<mstts:viseme type='redlips_front'/> \r\n \
					${text} \r\n \
					</voice> \r\n \
					</speak>`;

		synthesizer.speakSsmlAsync(
			ssml,
			(result) => {
				if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
					console.log("Speech synthesis succeeded.");
					// receive synthesized audio data
					this.processAudio(result.audioData);
					this.PlayAudioVisemeSync(onlyAudio);
					_audio.onended = () => resolve();
					_audio.onerror = (error) => reject(error);
					
				} else {
					console.error("Speech synthesis failed:", result.errorDetails);
					reject(result.errorDetails);
				}
			},
			(error) => {
				console.error("Error during synthesis:", error)
				reject(error);}
		);
		});
	}

	// Convert raw audio data to proper audio format
	processAudio(Data){
		const audioData = new Uint8Array(Data);
		const audioBlob = new Blob([audioData], { type: "audio/wav" });
		const audioUrl = URL.createObjectURL(audioBlob);
		const audio = new Audio(audioUrl);
		_audio = audio;
	}

	// Play the audio and viseme in sync
	PlayAudioVisemeSync(onlyAudio){
		_audio.onplay = () => {
			if (!onlyAudio) this.playViseme();
			return;
		}
		_audio.play();
	}

	playViseme = () => {
		console.log("Starting Viseme anims");
		var index = 0;
		_visemeArr.forEach(v => {
			var duration = v[1];
			setTimeout(() => {
				index++;
				this.currentViseme = frame_dict[viseme_dict[v[0]]];
				//console.log(window.TLBTC.currentViseme,viseme_dict[v[0]]);
				if (index == _visemeArr.length) {
					this.currentViseme = 1;
					window.TLBTC.dialogue_state = 'idle'
				}
			}, duration);
		});
	}
}

export default FaceGenerator;