const express = require('express');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const bodyParser = require('body-parser'); // To parse JSON bodies
const { resolve } = require('path');
const app = express();
function jsonToJsonLines(jsonData ) {
  let l = (typeof jsonData).toLocaleLowerCase() === 'string' ? JSON.parse(jsonData) : jsonData
  const lines = l.map((data) => JSON.stringify(data));
  // fs.writeFileSync(outputPath, lines.join('\n'));
  return lines.join('\n')
}
app.use(bodyParser.json());
app.use((req, res, next)=>{
  const apiKey = req.headers['x-api-key']; 
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);
  req.openai = openai
  next()
})
app.post('/upload', async (req, res) => {
  try {
    const jsonData = req.body.data; // This is the JSON data we want to upload
    const filename = req.body.filename || "myfile.jsonl"; // This is the JSON data we want to upload
    const apiKey = req.headers['x-api-key']; // API key from the request headers
    console.log(jsonData,'jsonData', typeof jsonData)
    if (!apiKey) {
      return res.status(401).send({ error: 'Missing API key' });
    }
    const content = jsonToJsonLines(jsonData); // 将对象转换为字符串
    // const buffer = Buffer.from(content); // 将字符串转换为 Buffer
    
    // const file = new File([buffer], filename || "myfile.json");
   
    const fileTempPath = resolve(__dirname,filename)
    console.log(fileTempPath,'fileTempPath')
    
    
    fs.writeFileSync(fileTempPath, content)
    
    try{
      const response = await req.openai.createFile(
        fs.createReadStream(fileTempPath),
        // file.stream.bind(file),
        "fine-tune"
      );
      res.status(200).json(response.data);
      fs.unlinkSync(fileTempPath)
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
  try {
    const response = await req.openai.listFiles();
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({error});
  }
})
app.post('/search', async (req,res) => {
  try {
    const response = await req.openai.retrieveFile(req.body.fileId);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({error});
  }
})
app.post('/delete', async (req,res) => {
  try {
    const response = await req.openai.deleteFile(req.body.fileId);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({error});
  }
})
app.post('/download', async (req,res) => {
  try {
    const response = await req.openai.downloadFile(req.body.fileId);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({error});
  }
})
app.post('/ft/create', async (req,res) => {
  try {
    const response = await openai.createFineTune({
      // training_file: req.body.fileId,
      ...req.body
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({error});
  }
})
app.get('/ft/list', async (req,res) => {
  try {
    const response = await openai.listFineTunes();
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({error});
  }
})
app.post('/ft/search', async (req,res) => {
  try {
    const response = await openai.retrieveFineTune(req.body.fineTuneId);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({error});
  }
})
app.post('/ft/cancel', async (req,res) => {
  try {
    const response = await openai.cancelFineTune(req.body.fineTuneId);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({error});
  }
})
app.post('/ft/detail', async (req,res) => {
  try {
    const response = await openai.listFineTuneEvents(req.body.fineTuneId);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({error});
  }
})
app.post('/ft/delete', async (req,res) => {
  try {
    const response = await openai.deleteModel(req.body.model);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({error});
  }
})

app.listen(process.env.PORT || 8080, () => console.log('Server running on port '+process.env.PORT || 3000));
