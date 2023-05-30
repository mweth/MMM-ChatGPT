# MMM-ChatGPT-Q

This is a fork of the very helpful [MMM-ChatGPT](https://github.com/ImanuelBertrand/MMM-ChatGPT).  It uses GPT-4 to modify and expand the features of the module.  No clue if any of it is accurate.  Use at your own risk.

This is a module for [MagicMirror²](https://github.com/MichMich/MagicMirror/).

It fetches a response from ChatGPT using a configurable prompt at a configurable interval.

### Prerequisites

You need a paid [OpenAI](https:://platform.openai.com) account to be able to use this module.<br>
At the time of writing this, the pricing is 0.002 per 1000 tokens, ~750 words (including prompt and response).
For occasional requests, this is practically free, but you still need to set a payment method.
You can, however, set a monthly limit to prevent accidental charges.<br>
Once you have set up your account, generating API keys is possible in your user settings.<br>


### Installation

Navigate into your MagicMirrors modules folder:

```shell
cd ~/MagicMirror/modules
```
Clone this repository:
```shell
git clone https://github.com/mweth/MMM-ChatGPT-Q.git
```



## Configuration

Add the module to the `modules` array in the `config/config.js` file:

```javascript
modules: [
    {
        module: "MMM-ChatGPT-Q",
        position: "bottom_bar", // This can be any of the MagicMirror regions.
        config: {
            updateInterval: 900,
            animationSpeed: 1,
            initialDelay: 0,
            initialPrompt: [],
            retryDelay: 1,
            maxTokens: 60,
            temperature: 0.7,
            loadingPlaceholder: "Loading...",
            model: "gpt-3.5-turbo",
            endpoint: 'https://api.openai.com/v1/chat/completions',
            apiKey: 'YOUR_OPENAI_API_KEY',
            timeOut: 5,
            fontURL: "",
            fontSize: "",
            fontStyle: "",
            color: "",
            className: "light small",
        }
    },
]

Configuration options

The following properties can be configured:

    updateInterval: How often the chat prompt is updated (in seconds). Default value is 900 seconds (15 minutes).
    animationSpeed: Speed of the update animation (in seconds). Default value is 1 second.
    initialDelay: Delay before the first chat prompt update (in seconds). Default value is 0 seconds.
    initialPrompt: Initial chat prompts. Default value is an empty array.
    retryDelay: If a request fails, how long to wait before trying again (in seconds). Default value is 1 second.
    maxTokens: Maximum number of tokens in generated text. Default value is 60.
    temperature: Determines the randomness of the model's output. Default value is 0.7.
    loadingPlaceholder: Text displayed while the module is waiting for the API response. Default value is "Loading...".
    model: The model to use for the chat completion. Default value is 'gpt-3.5-turbo'.
    endpoint: The API endpoint to call for the chat completion. Default value is 'https://api.openai.com/v1/chat/completions'.
    apiKey: Your OpenAI API key.
    timeOut: The request timeout (in seconds). Default value is 5 seconds.
    fontURL: URL of the font to use.
    fontSize: Size of the font to use.
    fontStyle: Style of the font to use.
    color: Color of the text.
    className: Class name to apply to the module's HTML.

Note: Some parameters have limitations or specific values based on the OpenAI's API usage. maxTokens and temperature are based on the limitations and constraints of the GPT-3 API. For maxTokens, keep in mind that larger values may lead to slower response times and higher costs. For temperature, valid values range between 0 and 1.
### Advanced usage
If you define more than one prompt, the module will select one at random.<br>
The inital prompt will be prefixed to the regular prompt.
All prompts (both initial and regular) can contain code using `{{code}}` syntax. The code will be evaluated and replaced with the result. This allows you to fetch data from the screen and use it in the prompt. The code is evaluated in the context of the MagicMirror window, so you can use all the DOM API and other browser APIs.<br>

### Security warning
This module will, if configured to do so, execute code defined in the configuration.<br>
This is intentional and not a bad thing, but (as always) be careful when copying code from the internet. 

### Example
This example relies on different modules to be present on the screen (1x time, 3x weather). <br>It fetches the current weather, the weather for later today and the weather for the coming days and uses it in the prompt. It also uses the `initialPrompt` to set up the prompt with the current weather data.

    {
        module: 'MMM-ChatGPT',
        position: 'bottom_bar',
        config: {
            color: 'white',
            apiKey: '[API KEY]',
            updateInterval: 60 * 60,
            initialDelay: 1,
            initialPrompt: [{
                role: "system",
                content: "This is the current time: '{{document.querySelectorAll('.clock')[0].innerText}}'." +
                    "This is the current weather including the time of sunset/sunrise: '{{document.querySelectorAll('.weather')[0].innerText}}'. " +
                    "This is the weather for later today: '{{document.querySelectorAll('.weather')[1].innerText}}'. " +
                    "This is the weather for the coming days: '{{document.querySelectorAll('.weather')[2].innerText}}'. " +
            }],
            prompts: [
                [{
                    role: "user",
                    content: "Make a joke."
                }],
                [{
                    role: "user",
                    content: "Describe the current weather data in a slightly amusing way. Don't use more than one sentence."
                }],
                [{
                    role: "user",
                    content: "Describe the current weather in the style of the Wee Free Men from the novels of Terry Pratchett, but don't mention any specific names from the novels."
                }],
            ]
        }
    },
