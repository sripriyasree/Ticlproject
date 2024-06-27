require('dotenv').config();
const AWS = require('aws-sdk');
const express = require('express');
const app = express();

app.use(express.json());

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Validate bucket name
function validateBucketName(bucketName) {
    if (!bucketName) {
        throw new Error('Bucket name is required');
    }
}

// Validate object key
function validateObjectKey(key) {
    if (!key) {
        throw new Error('Object key is required');
    }
}

// Create a bucket
app.post('/bucket', async (req, res) => {
    const { bucketName } = req.body;
    try {
        validateBucketName(bucketName);
        const params = { Bucket: bucketName };
        const data = await s3.createBucket(params).promise();
        res.status(200).send(`Bucket created successfully: ${data.Location}`);
    } catch (error) {
        res.status(400).send(`Error creating bucket: ${error.message}`);
    }
});

// Upload an object to a bucket
app.post('/object', async (req, res) => {
    const { bucketName, key, body } = req.body;
    try {
        validateBucketName(bucketName);
        validateObjectKey(key);
        const params = { Bucket: bucketName, Key: key, Body: body };
        const data = await s3.putObject(params).promise();
        res.status(200).send(`Object uploaded successfully: ${data.ETag}`);
    } catch (error) {
        res.status(400).send(`Error uploading object: ${error.message}`);
    }
});

// Read an object from a bucket
app.get('/object', async (req, res) => {
    const { bucketName, key } = req.query;
    try {
        validateBucketName(bucketName);
        validateObjectKey(key);
        const params = { Bucket: bucketName, Key: key };
        const data = await s3.getObject(params).promise();
        res.status(200).send(data.Body.toString('utf-8'));
    } catch (error) {
        res.status(400).send(`Error reading object: ${error.message}`);
    }
});

// Delete an object from a bucket
app.delete('/object', async (req, res) => {
    const { bucketName, key } = req.body;
    try {
        validateBucketName(bucketName);
        validateObjectKey(key);
        const params = { Bucket: bucketName, Key: key };
        await s3.deleteObject(params).promise();
        res.status(200).send(`Object deleted successfully`);
    } catch (error) {
        res.status(400).send(`Error deleting object: ${error.message}`);
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
