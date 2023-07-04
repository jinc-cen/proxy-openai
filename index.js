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

    // Convert JSON to string and write to file
    const filePath = 'mydata.jsonl';
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    // Create OpenAI API instance with the API key from the headers
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);

    // Upload file to OpenAI
    const response = await openai.createFile(
      fs.createReadStream(filePath),
      "application/json"
    );

    res.status(200).send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
