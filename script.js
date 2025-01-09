import SpeechRecognizer from "./speechRecognizer.js";
import LLM from "./llm.js";
import FaceGenerator from "./faceGenerator.js";

// Create a namespace for your project
window.TLBTC = window.TLBTC || {};

window.TLBTC.speechRecognizer = new SpeechRecognizer();
window.TLBTC.llm = new LLM();
window.TLBTC.faceGenerator = new FaceGenerator();