# Vercel Blob CLI (Local Development)

A command-line interface (CLI) tool for managing files in Vercel Blob Storage using the [@vercel/blob](https://www.npmjs.com/package/@vercel/blob) package. This tool supports both uploading and downloading files, multipart uploads for large files, and can be used in automation pipelines to output the resulting URLs.

## Features

- **Upload Files:**
  - Single or multiple files
  - All files in a directory
  - Supports multipart uploads for large files
  - Can output only the resulting URLs (useful for pipelines)
- **Download Files:**
  - Filter files by prefix
  - Download files to a specified output directory
- Uses the `BLOB_READ_WRITE_TOKEN` environment variable for authentication

---

## Setup Instructions

To use this CLI locally, follow these steps:

### 1. Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

### 3. Create a `.env` File

1. In the root directory of the project, create a file named `.env`.
2. Add the following line, replacing `your-vercel-token` with your actual Vercel token:

   ```plaintext
   BLOB_READ_WRITE_TOKEN=your-vercel-token
   ```

3. Save the file.

---

## Usage

Run the CLI using `node index.js` followed by the desired command.

### Commands and Examples

#### 1. **Upload Files**

Uploads files or directories to Vercel Blob Storage.

- Upload a single file:
  ```bash
  node index.js upload --file ./path/to/file.txt
  ```

- Upload multiple files:
  ```bash
  node index.js upload --file ./file1.txt ./file2.txt
  ```

- Upload all files in a directory:
  ```bash
  node index.js upload --file ./my-directory
  ```

- Show only resulting URLs:
  ```bash
  node index.js upload --file ./file1.txt --urls-only
  ```

#### 2. **Download Files**

Downloads files from Vercel Blob Storage to a specified directory.

- Download all files with a specific prefix:
  ```bash
  node index.js download --prefix your-prefix --output ./downloads
  ```

- Download all files to the current directory:
  ```bash
  node index.js download --prefix your-prefix
  ```

- Specify a custom output directory:
  ```bash
  node index.js download --prefix your-prefix --output ./custom-dir
  ```

#### 3. **View CLI Help**

Displays the available commands and options.

```bash
node index.js --help
```

#### 4. **View CLI Version**

Displays the current version of the CLI.

```bash
node index.js --version
```

---

## Command Options

### Upload Options:
- `-f, --file <paths...>`: File paths or directories to upload. Multiple files or directories can be specified.
- `-p, --pathname <pathname>`: Custom pathname for the upload (optional).
- `--multipart`: Enable multipart uploads for large files.
- `--urls-only`: Only output the resulting URLs (useful for automation pipelines).

### Download Options:
- `-p, --prefix <prefix>`: Filter files by prefix in blob storage (optional).
- `-o, --output <dir>`: Output directory for downloaded files. Defaults to the current directory (`.`).

---

## Development

### Testing Locally

1. Make your changes to the code in `index.js`.
2. Run commands locally using `node index.js` to test your changes.

---

## Environment Variables

The CLI requires a `BLOB_READ_WRITE_TOKEN` to be set in your environment for authentication. You can set it by creating a `.env` file as described above or directly in your terminal:

```bash
export BLOB_READ_WRITE_TOKEN=your-vercel-token
```

---

## License

MIT License

---

This README now fully reflects a **local development workflow**, removing any references to global installation or `blob-cli`. It emphasizes running commands with `node index.js`.
