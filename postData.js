const axios = require("axios");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");
const fs = require("fs");
require("dotenv").config();

const jar = new CookieJar();
const axiosInstance = wrapper(axios.create({ jar }));
const USERNAME = process.env.USR;
const PASSWORD = process.env.PWD;
const API_URL = process.env.API_URL;
let authToken;

async function login() {
  const url = `${API_URL}/api/method/login`;
  const credentials = {
    usr: USERNAME,
    pwd: PASSWORD,
  };

  try {
    const response = await axiosInstance.post(url, credentials);
    const cookies = response.headers["set-cookie"];
    if (cookies) {
      const sidCookie = cookies.find((cookie) => cookie.startsWith("sid="));
      if (sidCookie) {
        authToken = sidCookie.split(";")[0]; // Get the sid value
        console.log("Extracted authToken (sid):", authToken);
      }
    }

    return {
      statusCode: response.status,
      authToken,
      message: response.data,
    };
  } catch (error) {
    console.error(
      "Login failed:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Login failed");
  }
}

async function postData(data) {
  const url = `${API_URL}/api/resource/Employee Checkin`;

  const headers = {
    "Content-Type": "application/json",
    Cookie: authToken,
  };

  for (const item of data) {
    try {
      console.log(`Posting data: ${JSON.stringify(item)}`);
      const response = await axiosInstance.post(url, item, { headers });
      console.log("Post successful:", response.data);
    } catch (error) {
      console.error(
        "Error posting data:",
        error.response ? error.response.data : error.message
      );
    }
  }
}

async function main() {
  try {
    // Step 1: Login to get the auth token
    await login();

    // Step 2: Read the checkinlog.json file
    const checkinLogData = JSON.parse(
      fs.readFileSync("./data/checkinlog.json", "utf8")
    );

    // Step 3: Post the data to the API
    await postData(checkinLogData);

    console.log("Data posting completed.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Run the main function
main();
