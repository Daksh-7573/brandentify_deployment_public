import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Test server is working!" });
});

const port = 5000;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Test server running on port ${port}`);
  console.log(`🚀 Server accessible at http://localhost:${port}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});