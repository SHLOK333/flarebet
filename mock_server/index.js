import express from 'express';
const app = express();
const port = 3000;

app.use(express.json());

let storedData = null;

// Endpoint to store JSON data in memory
app.post('/store', (req, res) => {
  storedData = req.body;
  res.json({ message: 'Data stored successfully', data: storedData });
});

// Endpoint to retrieve stored JSON data
app.get('/retrieve', (req, res) => {
  if (storedData) {
    res.json(storedData);
  } else {
    res.json({ message: 'No data stored yet' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
