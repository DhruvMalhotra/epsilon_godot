const models = ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'llama-3.1-8b-instant', 'llama3-8b-8192'];
const groqurl = "https://api.groq.com/openai/v1/chat/completions";

class LLM {
    constructor() {
        this.msgs = [];
        this.systemPrompt = "";
    }

    async startConversation(key, system_prompt, user_prompt) {
        this.resetChat();
        this.systemPrompt = system_prompt;
        this.msgs.push({ role: "system", content: this.systemPrompt });
        this.msgs.push({ role: "user", content: user_prompt });
        let response = await getResponse(key, this.msgs);
        this.msgs.push({ role: "assistant", content: response.text });
        return JSON.stringify(response);
    }
    
    async addTurn(key, user_prompt) {
        this.msgs.push({ role: "user", content: user_prompt });
        let response = await getResponse(key, this.msgs);
        this.msgs.push({ role: "assistant", content: response.text });
        return JSON.stringify(response);
    }

    resetChat() {
        this.msgs = [];
        this.systemPrompt = "";
        console.log('Chat reset');
    }
}

// Call llm via fetch
async function getResponse(key, msgs) {
    const api_key = String(key);
    //console.log("received key",api_key);
    try {
        const response = await fetch(groqurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api_key}`,
                'Connection': 'keep-alive',
                'Cache-Control': 'max-age=1000',
                'Access-Control-Max-Age': 3000,
                'Max-Age': 4000,
            },
            body: JSON.stringify({
                model: models[0],
                messages: msgs,
                max_tokens: 1024,
                response_format: { "type": "json_object" },
                stream: false,
            })
        });
        const data = await response.json();

        if (response.ok) {
            console.log('Response OK')
            const generatedJson = JSON.parse(data.choices[0].message.content);
            console.log("Generated text:", generatedJson.text);
            return generatedJson;
        }
        else {
            console.log('error', response,);
        }

    } catch (error) {
        console.error('Error calling llm', error.message, window.recognizedText);
    }
}

export default LLM;