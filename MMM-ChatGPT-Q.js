/* Magic Mirror
 * Module: MMM-ChatGPT-Q
 *
 * MIT Licensed.
 */

Module.register("MMM-ChatGPT-Q", {

    // Default module config.
    defaults: {
        updateInterval: 900, // Update interval in seconds.
        animationSpeed: 1, // Animation speed in seconds.
        initialDelay: 0, // Initial delay in seconds.
        retryDelay: 1, // Retry delay in seconds.
        maxTokens: 600, // Maximum tokens.
        temperature: 0.7, // Default temperature.
        loadingPlaceholder: "Loading...",
        model: "gpt-3.5-turbo", // Default model.
        endpoint: 'https://api.openai.com/v1/chat/completions', // OpenAI API endpoint.
        apiKey: '', // OpenAI API Key.
        timeOut: 10, // API request timeout in seconds.
        initialPrompt: [{  // Default initial prompt.
            role: "system",
            content: "You are a helpful assistant." 
        }],
    },

    // Module requires MagicMirror version 2.1.0 or later.
    requiresVersion: "2.1.0", 

    start: function () {
        Log.info("Starting module: " + this.name);
        this.message = false;
        this.scheduleNextCall(this.config.initialDelay);
    },

    // Method to clear the update timer.
    suspend: function () {
        clearTimeout(this.updateTimer);
        this.updateTimer = null;
    },

    // Method to immediately fetch new data and schedule the next update.
    resume: function () {
        if (!this.updateTimer) {
            this.getData();
        }
    },

    // Method to assemble the prompt for the API call.
    getPrompt: function () {
        // Ensuring the initial prompt is valid.
        if (!this.config.initialPrompt || !Array.isArray(this.config.initialPrompt) || this.config.initialPrompt.length === 0) {
            Log.error("Invalid initial prompt in config");
            return [];
        }
        return JSON.parse(JSON.stringify(this.config.initialPrompt));
    },

    // Method to construct the DOM for the module.
    getDom: function () {
        let wrapper = document.createElement("div");
        // Handle missing API Key.
        if (!this.config.apiKey) {
            wrapper.innerHTML = "Missing API key. Please check the module configuration.";
        } else if (this.message) {
            wrapper.innerHTML = this.message;
        } else {
            wrapper.innerHTML = this.config.loadingPlaceholder;
        }
        return wrapper;
    },

    // Method to call endpoint, process response, and schedule the next update.
    getData: function () {
        if (!this.config.apiKey) {
            Log.error("Missing API key. Please check the module configuration.");
            return;
        }

        let request = new XMLHttpRequest();
        request.open("POST", this.config.endpoint, true);
        request.setRequestHeader("Authorization", "Bearer " + this.config.apiKey);
        request.setRequestHeader("Content-Type", "application/json");
        request.timeout = this.config.timeOut * 1000;

        let self = this;

        request.onerror = function () {
            Log.error("OpenAI API request failed");
            self.scheduleNextCall(self.config.retryDelay);
        }
        request.onabort = function () {
            Log.error("OpenAI API request aborted");
            self.scheduleNextCall(self.config.retryDelay);
        }
        request.ontimeout = function () {
            Log.error("OpenAI API request timeout");
            self.scheduleNextCall(self.config.retryDelay);
        }
        request.onload = function () {
            let success = this.status === 200
                ? self.processResponse(this.response)
                : false;

            if (success) {
                self.scheduleNextCall(self.config.updateInterval);
            } else {
                Log.error("OpenAI API response: " + this.status + ": " + this.response);
                if (this.status === 401) {
                    self.message = "[401 Unauthorized, check your API key]";
                    self.updateDom(self.config.animationSpeed * 1000);
                    self.updateTimer = null;
                    return;
                }
                self.scheduleNextCall(self.config.retryDelay);
            }
        };

        let payload = {
            "model": self.config.model,
            "messages": this.getPrompt(),
            "max_tokens": this.config.maxTokens,
            "temperature": this.config.temperature
        };

        console.log("Sending request with payload:", payload);  // DEBUGGING

        request.send(JSON.stringify(payload));
    },

    // Method to process the response from the API.
    processResponse: function (response) {
        console.log("Received response:", response);  // DEBUGGING

        let data;
        try {
            data = JSON.parse(response);
        } catch (e) {
            Log.error("OpenAI API response is not valid JSON: " + response);
            return false;
        }
        // Checking if required properties are present in the response.
        if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
            Log.error("OpenAI API response is missing required properties");
            return false;
        }

        this.message = data.choices[0].message.content;
        this.updateDom(this.config.animationSpeed * 1000);
        return true;
    },

    // Method to schedule the next API call.
    scheduleNextCall: function (seconds) {
        clearTimeout(this.updateTimer);
        let self = this;
        this.updateTimer = setTimeout(() => self.getData(), seconds * 1000);
    },
});
