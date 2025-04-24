const express = require("express");
const processLogs = require("./joinData");
require("dotenv").config();

const app = express();

app.use(express.json());

// Endpoint to process logs
app.post("/process-logs", (req, res) => {
  try {
    // Call the function to process logs
    processLogs();
    res
      .status(200)
      .send(
        "Logs processed successfully. Check the data folder for the updated file."
      );
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the logs.");
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
