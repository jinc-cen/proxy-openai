const express = require('express');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const bodyParser = require('body-parser'); // To parse JSON bodies
const { resolve } = require('path');
const app = express();
function jsonToJsonLines(jsonData) {
  let l = (typeof jsonData).toLocaleLowerCase() === 'string' ? JSON.parse(jsonData) : jsonData
  const lines = l.map((data) => JSON.stringify(data));
  // fs.writeFileSync(outputPath, lines.join('\n'));
  return lines.join('\n')
}
app.use(bodyParser.json({
  limit: '50mb',
}));
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const org = req.headers['x-org']; // API key from the request headers
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);
  req.openai = openai
  req.apiKey = apiKey
  req.org = org
  next()
})
app.post('/upload', async (req, res) => {
  try {
    const jsonData = req.body.data; // This is the JSON data we want to upload
    const filename = req.body.filename || "myfile.jsonl"; // This is the JSON data we want to upload
    const apiKey = req.apiKey; // API key from the request headers

    console.log(jsonData, 'jsonData', typeof jsonData)
    if (!apiKey) {
      return res.status(401).send({ error: 'Missing API key' });
    }
    const content = jsonToJsonLines(jsonData); // 将对象转换为字符串
    // const buffer = Buffer.from(content); // 将字符串转换为 Buffer

    // const file = new File([buffer], filename || "myfile.json");

    const fileTempPath = resolve(__dirname, filename)
    console.log(fileTempPath, 'fileTempPath')


    fs.writeFileSync(fileTempPath, content)

    try {
      const response = await req.openai.createFile(
        fs.createReadStream(fileTempPath),
        // file.stream.bind(file),
        "fine-tune"
      );
      res.status(200).json(response.data);
      fs.unlinkSync(fileTempPath)
    } catch (err) {
      console.error(err, 'createFile')
      res.status(500).send(err);
    }

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'An error occurred', data: err.data });
  }
});
app.get('/files', async (req, res) => {
  try {
    const response = await req.openai.listFiles();
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({ error });
  }
})
app.post('/search', async (req, res) => {
  try {
    const response = await req.openai.retrieveFile(req.body.fileId);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({ error });
  }
})
app.post('/delete', async (req, res) => {
  try {
    const response = await req.openai.deleteFile(req.body.fileId);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({ error });
  }
})
app.post('/download', async (req, res) => {
  try {
    const response = await req.openai.downloadFile(req.body.fileId);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).send({ error });
  }
})
app.post('/ft/create', async (req, res) => {
  console.log(typeof req.body, req.body, 'ssss')
  try {
    const response = await req.openai.createFineTune({
      // training_file: req.body.fileId,
      ...req.body
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response.data.error)
    res.status(500).send({ error });
  }
})
app.get('/ft/list', async (req, res) => {
  try {
    const response = await req.openai.listFineTunes();
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response.data.error)
    res.status(500).send({ error });
  }
})
app.post('/ft/search', async (req, res) => {
  try {
    const response = await req.openai.retrieveFineTune(req.body.fineTuneId);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response.data.error)
    res.status(500).send({ error });
  }
})
app.post('/ft/cancel', async (req, res) => {
  try {
    const response = await req.openai.cancelFineTune(req.body.fineTuneId);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response.data.error)
    res.status(500).send({ error });
  }
})
app.post('/ft/detail', async (req, res) => {
  try {
    const response = await req.openai.listFineTuneEvents(req.body.fineTuneId);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response.data.error)
    res.status(500).send({ error });
  }
})
app.post('/ft/delete', async (req, res) => {
  try {
    const response = await req.openai.deleteModel(req.body.model);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response.data.error)
    res.status(500).send({ error });
  }
})
app.post('/chat', async (req, res) => {
  try {
    const response = await req.openai.createCompletion({
      ...req.body
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response.data.error)
    res.status(500).send({ error });
  }
})
app.post('/usage', async (req, res) => {
  try {
    const _res = await fetch("https://api.openai.com/dashboard/billing/credit_grants", {
      "headers": {
        "accept": "*/*",
        "accept-language": "zh-TW,zh;q=0.9,en;q=0.8,zh-CN;q=0.7",
        "authorization": `Bearer ${req.apiKey}`,
        "cache-control": "no-cache",
        "openai-organization": req.org,
        "pragma": "no-cache",
        "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "Referer": "https://platform.openai.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": null,
      "method": "GET"
    });

    if (!_res.ok) {
      throw new Error(`Server response: ${_res.status}`);
    }

    const data = await _res.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


app.listen(process.env.PORT || 8080, () => console.log('Server running on port ' + process.env.PORT || 3000));
