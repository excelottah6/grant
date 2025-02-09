const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || ".jpg";
        cb(null, Date.now() + ext);
    }
});
const upload = multer({ storage });


app.post('/submit', upload.fields([
    { name: 'idCardFront' },
    { name: 'idCardBack' },
    { name: 'ssnDocument' }
]), (req, res) => {
    const { fullName, dob } = req.body;
    
    const application = {
        fullName,
        dob,
        idCardFront: req.files.idCardFront ? req.files.idCardFront[0].filename : null,
        idCardBack: req.files.idCardBack ? req.files.idCardBack[0].filename : null,
        ssnDocument: req.files.ssnDocument ? req.files.ssnDocument[0].filename : null,
        submittedAt: new Date().toISOString()
    };

    let applications = [];
    if (fs.existsSync('data.json')) {
        applications = JSON.parse(fs.readFileSync('data.json'));
    }
    applications.push(application);
    fs.writeFileSync('data.json', JSON.stringify(applications, null, 2));

    res.json({ message: "Application submitted successfully!" });
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Invalid login details" });
    }
});


app.get('/applications', (req, res) => {
    if (fs.existsSync('data.json')) {
        res.json(JSON.parse(fs.readFileSync('data.json')));
    } else {
        res.json([]);
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
