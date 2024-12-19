# Vercel Blob CLI

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

## Installation

### Global Installation

Install the CLI tool globally:

```bash
npm install -g vercel-blob-cli
```

### Local Installation (for development)

If you want to test the tool locally before publishing, you can use `npm link`:

```bash
npm link
```

## Usage

Once installed globally, you can run the CLI using the command `blob-cli`.

### Upload Files

#### Basic Usage

```bash
blob-cli upload --file ./path/to/file.txt --multipart
```

#### Upload Multiple Files

You can specify multiple files to upload:

```bash
blob-cli upload --file ./file1.txt ./file2.txt --multipart
```

#### Upload All Files in a Directory

To upload all files in a directory:

```bash
blob-cli upload --file ./my-directory --multipart
```

#### Show Only URLs (for Pipelines)

If you only want the output to show the URLs of the uploaded files (useful for pipelines or scripts), use the `--urls-only` flag:

```bash
blob-cli upload --file ./file1.txt ./file2.txt --urls-only
```

#### Example in a Pipeline

You can capture the output and use it in your automation pipelines:

```bash
file_urls=$(blob-cli upload --file ./file1.txt ./file2.txt --urls-only)
echo "Uploaded files are available at: $file_urls"
```

#### Upload Options

- `-f, --file <paths...>`: File paths or directories to upload. You can specify multiple files or directories.
- `-p, --pathname <pathname>`: The pathname to use for the upload. If not provided, it defaults to the filename.
- `--multipart`: Enable multipart uploads for large files.
- `--urls-only`: Only output the resulting URLs (useful for automation pipelines).

---

### Download Files

#### Basic Usage

```bash
blob-cli download --prefix your-prefix --output ./output-directory
```

#### Download Options

- `-p, --prefix <prefix>`: Prefix to filter files in blob storage. Files matching the prefix will be downloaded.
- `-o, --output <dir>`: Output directory for the downloaded files. Defaults to the current directory (`.`).

---

## Environment Variables

The CLI requires a `BLOB_READ_WRITE_TOKEN` to be set in your environment for authentication. You can set it as follows:

```bash
export BLOB_READ_WRITE_TOKEN=your-vercel-token
```

Alternatively, you can pass the token in a single command:

```bash
BLOB_READ_WRITE_TOKEN=your-vercel-token blob-cli upload --file ./file.txt
```

## Development

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Use `npm link` to link the project for local testing.
4. Modify the code and test the CLI.

## License

MIT License

This README now reflects the added `download` functionality and clearly distinguishes it from the upload capabilities.
