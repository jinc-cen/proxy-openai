const express = require('express');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const bodyParser = require('body-parser'); // To parse JSON bodies
const { Readable } = require('stream'); // Add this line

const app = express();
app.use(bodyParser.json());

app.post('/upload', async (req, res) => {
  try {
    const jsonData = req.body.data; // This is the JSON data we want to upload
    const apiKey = req.headers['x-api-key']; // API key from the request headers

    if (!apiKey) {
      return res.status(401).send({ error: 'Missing API key' });
    }
    const buffer = Buffer.from(JSON.stringify(jsonData, null, 2), 'utf-8');

    // Create a Readable stream from the Buffer
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createFile(
      stream,
      "fine-tune"
    );

    res.status(200).send(response);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred' , data: err.data});
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running on port '+process.env.PORT || 3000));
