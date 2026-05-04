const express = require("express");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");

const app = express();

// Storage setup
const storage = multer.diskStorage({
    destination: "backend/uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 👉 YOUR ROUTE
app.post("/upload", upload.single("file"), (req, res) => {

    const imagePath = req.file.path;

    console.log("Image saved at:", imagePath);

    // 🔥 CALL PYTHON HERE
    exec(`python backend/ai_model.py "${imagePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
            return res.send("Error running AI model");
        }

        const aiScore = parseFloat(stdout);

        res.json({
            ai_score: aiScore
        });
    });

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});