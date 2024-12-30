#!/usr/bin/env node
const { Command } = require("commander");
const fs = require("fs");
const path = require("path");
const { put, list } = require("@vercel/blob");
const mime = require("mime-types");

// No need to rely on dotenv for production use if env vars are already set
require("dotenv").config(); // Only needed in development or testing environments

const program = new Command();

program
  .name("blob-cli")
  .description("CLI for managing Vercel Blob Storage")
  .version("1.0.0");

// Upload command
program
  .command("upload")
  .description("Upload files to Vercel Blob Storage")
  .option("-f, --file <paths...>", "File paths or directory to upload")
  .option(
    "-p, --pathname <pathname>",
    "Pathname to use for the upload (optional)"
  )
  .option("--multipart", "Enable multipart upload for large files")
  .option("--urls-only", "Show only the resulting URLs (useful for pipelines)")
  .action(async (options) => {
    if (!options.file) {
      console.error(
        "Please specify one or more files or a directory using the -f option"
      );
      process.exit(1);
    }
    await handleFilesOrDirectory(
      options.file,
      options.pathname,
      options.multipart,
      options.urlsOnly
    );
  });

// Download command
program
  .command("download")
  .description("Download files from Vercel Blob Storage")
  .option("-p, --prefix <prefix>", "Prefix to filter files (optional)")
  .option(
    "-o, --output <dir>",
    "Output directory (defaults to current directory)",
    "."
  )
  .action(async (options) => {
    const vercelToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!vercelToken) {
      console.error(
        "Vercel token is missing. Please set the BLOB_READ_WRITE_TOKEN environment variable."
      );
      process.exit(1);
    }

    try {
      const { blobs } = await list({
        token: vercelToken,
        prefix: options.prefix,
      });

      if (blobs.length === 0) {
        console.log("No files found in blob storage");
        return;
      }

      const outputDir = path.resolve(options.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      for (const blob of blobs) {
        try {
          const response = await fetch(blob.url);
          if (!response.ok) {
            console.error(`Failed to download: ${blob.pathname}`);
            continue;
          }

          const filePath = path.join(outputDir, blob.pathname);
          const fileDir = path.dirname(filePath);

          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
          }

          const buffer = Buffer.from(await response.arrayBuffer());
          fs.writeFileSync(filePath, buffer);
          console.log(`Downloaded: ${blob.pathname}`);
        } catch (error) {
          console.error(`Error downloading ${blob.pathname}:`, error.message);
        }
      }

      console.log("Download complete!");
    } catch (error) {
      console.error("Error downloading files:", error.message);
    }
  });

program.parse();

// Function to upload the file using put from @vercel/blob
async function uploadFile(filePath, pathname, multipart, urlsOnly) {
  const vercelToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!vercelToken) {
    console.error(
      "Vercel token is missing. Please set the BLOB_READ_WRITE_TOKEN environment variable."
    );
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
    const contentType = mime.lookup(absolutePath) || "application/octet-stream";

    // Added addRandomSuffix: false to prevent random suffixes
    const result = await put(inferredPathname, fileBuffer, {
      access: "public",
      contentType: contentType,
      token: vercelToken,
      multipart: multipart || false,
      addRandomSuffix: false, // This prevents the random suffix
    });

    // If --urls-only is set, print only the URLs
    if (urlsOnly) {
      console.log(result.url);
    } else {
      // Print full output with URLs and other details
      console.log(`File uploaded successfully: ${absolutePath}`);
      console.log("URL:", result.url);
      console.log("Download URL:", result.downloadUrl);
    }
  } catch (error) {
    console.error(`Error uploading file ${filePath}:`, error.message);
  }
}

// Function to handle multiple files or directory
async function handleFilesOrDirectory(
  filesOrDirs,
  pathname,
  multipart,
  urlsOnly
) {
  for (const fileOrDir of filesOrDirs) {
    const absolutePath = path.resolve(fileOrDir);

    try {
      // Check if path exists first
      if (!fs.existsSync(absolutePath)) {
        console.error(`Path does not exist: ${absolutePath}`);
        continue;
      }

      const stats = fs.statSync(absolutePath);

      // Check if it's a directory
      if (stats.isDirectory()) {
        // Get all files in the directory recursively
        const files = getAllFiles(absolutePath);
        for (const file of files) {
          // Use relative path from the base directory as pathname
          const relativePathname = path.relative(absolutePath, file);
          await uploadFile(file, relativePathname, multipart, urlsOnly);
        }
      } else {
        // It's a file, upload it directly
        await uploadFile(absolutePath, pathname, multipart, urlsOnly);
      }
    } catch (error) {
      console.error(`Error processing ${absolutePath}:`, error.message);
    }
  }
}

// Helper function to get all files recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}
