const express = require('express');
const session = require('express-session');

const app = express();
const PORT = 4000;

// Set EJS as template engine
app.set('view engine', 'ejs');

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'mySecretKey123',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000,       // 1 minute
        httpOnly: true
    }
}));


// =====================================
// PART (A) - SESSION MANAGEMENT
// =====================================

// Home page
app.get('/', (req, res) => {
    res.render('home');
});


// Set session
app.get('/set-session', (req, res) => {
    req.session.user = 'admin';
    req.session.visitCount = 0;

    res.redirect('/dashboard');
});


// =====================================
// PART (B) - USER AUTHENTICATION
// =====================================

// Login page
app.get('/login', (req, res) => {
    res.render('login', {
        error: null
    });
});


// Login process
app.post('/login', (req, res) => {

    const { username, password } = req.body;

    // Hardcoded credentials
    if (username === 'admin' && password === '1234') {

        // Store user in session
        req.session.user = username;

        // Initialize visit count
        req.session.visitCount = 0;

        res.redirect('/dashboard');

    } else {

        res.render('login', {
            error: 'Invalid username or password!'
        });
    }
});


// Authentication middleware
function isAuthenticated(req, res, next) {

    if (req.session.user) {
        return next();
    }

    res.redirect('/login');
}


// Protected dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
    req.session.visitCount++;

    res.render('dashboard', {
        username: req.session.user,
        visitCount: req.session.visitCount,
        sessionID: req.sessionID
    });
});


// Destroy only session management data
app.get('/destroy-session', (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send('Unable to destroy session');
        }

        res.send(`
            <h1>Session Destroyed</h1>
            <p>All session data has been cleared.</p>
            <a href="/">Go Home</a>
        `);
    });
});


// Logout
app.get('/logout', (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send('Unable to logout');
        }

        res.redirect('/login');
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});