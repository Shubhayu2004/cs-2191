const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const cookieparser = require('cookie-parser');
const connectTodb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const committeeRoutes = require('./routes/committee.routes'); // Fix import path
const minutesRoutes = require('./routes/minutes.routes');


connectTodb();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieparser());

app.use('/users', userRoutes);
app.use('/api/committees', committeeRoutes);
app.use('/api/minutes', minutesRoutes);


app.get('/' , (req,res) => {
    res.send('Hello world');
});

module.exports = app;