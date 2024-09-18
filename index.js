#!/usr/bin/env node
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

// No need to rely on dotenv for production use if env vars are already set
require('dotenv').config();  // Only needed in development or testing environments

const program = new Command();

program
  .version('1.0.0')
  .description('CLI for uploading blobs to Vercel Blob Storage using put()')
  .option('-f, --file <paths...>', 'File paths or directory to upload') // Allow multiple file paths or a directory
  .option('-p, --pathname <pathname>', 'Pathname to use for the upload (optional)')
  .option('--multipart', 'Enable multipart upload for large files')
  .option('--urls-only', 'Show only the resulting URLs (useful for pipelines)')
  .parse(process.argv);

const options = program.opts();

if (!options.file) {
  console.error('Please specify one or more files or a directory using the -f option');
  process.exit(1);
}

// Function to upload the file using put from @vercel/blob
async function uploadFile(filePath, pathname, multipart, urlsOnly) {
  const vercelToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!vercelToken) {
    console.error('Vercel token is missing. Please set the BLOB_READ_WRITE_TOKEN environment variable.');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);

  // Check if the file exists
  if (!fs.existsSync(absolutePath)) {
    console.error(`File does not exist: ${absolutePath}`);
    return;
  }

  try {
    // Infer pathname from filename if pathname is not provided
    const inferredPathname = pathname || path.basename(absolutePath);

    // Read the file as a binary buffer or stream
    const fileBuffer = fs.readFileSync(absolutePath);
    const fileType = path.extname(absolutePath).slice(1) || 'application/octet-stream'; // Guess file type

    // Perform the PUT request with multipart option
    const result = await put(inferredPathname, fileBuffer, {
      access: 'public',
      contentType: fileType,
      token: vercelToken,
      multipart: multipart || false, // Enable multipart if specified
    });

    // If --urls-only is set, print only the URLs
    if (urlsOnly) {
      console.log(result.url);
    } else {
      // Print full output with URLs and other details
      console.log(`File uploaded successfully: ${absolutePath}`);
      console.log('URL:', result.url);
      console.log('Download URL:', result.downloadUrl);
    }
  } catch (error) {
    console.error(`Error uploading file ${filePath}:`, error.message);
  }
}

// Function to handle multiple files or directory
async function handleFilesOrDirectory(filesOrDirs, pathname, multipart, urlsOnly) {
  for (const fileOrDir of filesOrDirs) {
    const absolutePath = path.resolve(fileOrDir);

    // Check if it's a directory
    if (fs.statSync(absolutePath).isDirectory()) {
      // Get all files in the directory
      const files = fs.readdirSync(absolutePath).filter(file => fs.statSync(path.join(absolutePath, file)).isFile());
      for (const file of files) {
        await uploadFile(path.join(absolutePath, file), pathname, multipart, urlsOnly);
      }
    } else {
      // It's a file, upload it directly
      await uploadFile(absolutePath, pathname, multipart, urlsOnly);
    }
  }
}

// Call the function to handle files or directories
handleFilesOrDirectory(options.file, options.pathname, options.multipart, options.urlsOnly);
