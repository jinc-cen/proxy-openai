const express = require('express');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const bodyParser = require('body-parser'); // To parse JSON bodies

const app = express();
app.use(bodyParser.json());

app.post('/upload', async (req, res) => {
  try {
    const jsonData = req.body.data; // This is the JSON data we want to upload
    const apiKey = req.headers['x-api-key']; // API key from the request headers

    if (!apiKey) {
      return res.status(401).send({ error: 'Missing API key' });
    }
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const file = new File([blob], 'data.jsonl');
    // Convert JSON to string and write to file
    // const filePath = 'mydata.jsonl';
    // fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    // Create OpenAI API instance with the API key from the headers
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    
    // Upload file to OpenAI
    const response = await openai.createFile(
      file,
      "fine-tune"
    );

    res.status(200).send(response);
  } catch (err) {
    console.error(err.data);
    res.status(500).send({ error: 'An error occurred' , data: err.data});
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running on port 3000'));
