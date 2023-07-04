const express = require('express');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const bodyParser = require('body-parser'); // To parse JSON bodies
const { Readable } = require('stream'); // Add this line
const { resolve } = require('path');
console.log(fs.createReadStream(resolve(__dirname,'myfile.jsonl')))
const app = express();
function jsonToJsonLines(outputPath,jsonData ) {
  const lines = jsonData.map((data) => JSON.stringify(data));

  fs.writeFileSync(outputPath, lines.join('\n'));
}
app.use(bodyParser.json());

app.post('/upload', async (req, res) => {
  try {
    const jsonData = req.body.data; // This is the JSON data we want to upload
    const filename = req.body.filename || "myfile.jsonl"; // This is the JSON data we want to upload
    const apiKey = req.headers['x-api-key']; // API key from the request headers

    if (!apiKey) {
      return res.status(401).send({ error: 'Missing API key' });
    }
    // const content = JSON.stringify(jsonData); // 将对象转换为字符串
    // const buffer = Buffer.from(content); // 将字符串转换为 Buffer
    const fileTempPath = resolve(__dirname,filename)
    console.log(jsonData,'jsonData')
    console.log(fileTempPath,'fileTempPath')
    
    jsonToJsonLines(fileTempPath, jsonData)
   
    // Create a Readable stream from the Buffer
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);
    try{
      const response = await openai.createFile(
        fs.createReadStream(fileTempPath),
        "fine-tune"
      );
      res.status(200).json(response.data);
      // fs.unlinkSync(fileTempPath)
    } catch(err){
      console.error(err, 'createFile')
      res.status(500).send(err);
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred' , data: err.data});
  }
});
app.get('/files', async (req,res) => {
  const apiKey = req.headers['x-api-key']; 
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const response = await openai.listFiles();
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({error});
  }
})

app.listen(process.env.PORT || 8080, () => console.log('Server running on port '+process.env.PORT || 3000));
