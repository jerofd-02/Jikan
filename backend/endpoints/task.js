const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'jikan_db',
    waitForConnections: true,
    connectionLimit: 10,
});

router.get('/', (req, res) => {

});

router.post('/', (req, res) => {

});

router.delete('/', (req, res) => {

});

router.patch('/', (req, res) => {

});

router.put('/', (req, res) => {

});