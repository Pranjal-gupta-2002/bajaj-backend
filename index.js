const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

// Utility function to process Base64
const processBase64 = (base64String) => {
  try {
    const isValidBase64 = (str) => {
      try {
        atob(str);
        return true;
      } catch {
        return false;
      }
    };

    if (!isValidBase64(base64String)) {
      return { isValid: false, message: "Invalid Base64 string" };
    }

    const binaryData = atob(base64String);
    const fileSize = binaryData.length;

    const typeMatch = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    const fileType = typeMatch ? typeMatch[1] : "unknown";

    return { isValid: true, size: fileSize, fileType };
  } catch {
    return { isValid: false, message: "Error processing Base64 data" };
  }
};

// POST /bfhl
app.post("/bfhl", (req, res) => {
  try {
    const { data, file_b64 } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ is_success: false, error: "'data' must be an array" });
    }

    const fileDetails = file_b64 ? processBase64(file_b64) : { isValid: false };
    if (file_b64 && !fileDetails.isValid) {
      return res.status(400).json({ is_success: false, error: fileDetails.message });
    }

    const numbers = data.filter((item) => !isNaN(item));
    const alphabets = data.filter((item) => /^[a-zA-Z]$/.test(item));
    const highestLowercase = alphabets.filter((ch) => ch === ch.toLowerCase()).sort().pop();

    const isPrime = (num) => num > 1 && ![...Array(Math.floor(Math.sqrt(num))).keys()].slice(2).some((i) => num % i === 0);
    const isPrimeFound = numbers.some((num) => isPrime(parseInt(num)));

    res.json({
      is_success: true,
      user_id: "pranjal_gupta_01011999",
      email: "abhayg980@gmail.com",
      roll_number: "0101CS211097",
      numbers,
      alphabets,
      highest_lowercase_alphabet: highestLowercase ? [highestLowercase] : [],
      is_prime_found: isPrimeFound,
      file_valid: file_b64 ? fileDetails.isValid : false,
      file_mime_type: fileDetails.fileType || null,
      file_size_kb: fileDetails.size ? Math.ceil(fileDetails.size / 1024) : null,
    });
  } catch {
    res.status(500).json({ is_success: false, error: "Internal Server Error" });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
