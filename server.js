const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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
    const { fullName, dob, homeAddress, phoneNumber, email, ssn } = req.body;

    const application = {
        fullName,
        dob,
        homeAddress,
        phoneNumber,
        email,
        ssn,
        idCardFront: req.files.idCardFront ? req.files.idCardFront[0].filename : null,
        idCardBack: req.files.idCardBack ? req.files.idCardBack[0].filename : null,
        ssnDocument: req.files.ssnDocument ? req.files.ssnDocument[0].filename : null,
        submittedAt: new Date().toISOString()
    };

    let applications = [];
    if (fs.existsSync('data.json')) {
        try {
            applications = JSON.parse(fs.readFileSync('data.json'));
        } catch (err) {
            applications = [];
        }
    }

    applications.push(application);
    fs.writeFileSync('data.json', JSON.stringify(applications, null, 2));

    res.json({ message: "Application submitted successfully!" });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!fs.existsSync('users.json')) {
        return res.json({ success: false, message: "No users found." });
    }

    try {
        const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Invalid login details" });
        }
    } catch (err) {
        res.json({ success: false, message: "Error reading users." });
    }
});

app.get('/applications', (req, res) => {
    if (fs.existsSync('data.json')) {
        try {
            res.json(JSON.parse(fs.readFileSync('data.json')));
        } catch (err) {
            res.json([]);
        }
    } else {
        res.json([]);
    }
});

app.use('/uploads', express.static(uploadDir));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
