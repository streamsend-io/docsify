# Getting Started

The StreamSend File-chunk Pipeline provides high-throughput file transfer using Kafka as the transport layer. This guide covers platform requirements, installation options, and compatibility information.

## Quickstart

### macOS

The easiest end-to-end test is running an Uploader and Downloader on a Mac with a local Kafka broker.
```text
mkdir -p /tmp/streamsend/upload /tmp/streamsend/download
```

Get the latest macOS Streamsend Uploader & Downloader:
```text
  wget "https://github.com/streamsend-io/docsify/raw/refs/heads/main/downloads/file-chunk-macos-latest.tar.gz"
  tar -xzf file-chunk-macos-latest.tar.gz
```

To test using a local Kafka (at localhost:9092)
```text
   macos/uploader    --input.dir /tmp/streamsend/upload   --topic file-chunk-topic &
   sleep 1
   macos/downloader --output.dir /tmp/streamsend/download --topic file-chunk-topic &
```

To test using a sasl/ssl authenticated system (including Confluent Cloud)
```text
   macos/uploader  --input.dir /tmp/streamsend/upload   --topic file-chunk-topic --bootstrap.servers ... --sasl.username ... --sasl.password ... --security.protocol SASL_SSL &
   sleep 1
 macos/downloader --output.dir /tmp/streamsend/download --topic file-chunk-topic --bootstrap.servers pkc...confluent.cloud --sasl.username .. --sasl.password .. --security.protocol SASL_SSL &
```

### Windows

For Windows environments, create the directories and get the Windows executables:
```powershell
mkdir C:\temp\streamsend\upload, C:\temp\streamsend\download
```

Get the latest Windows Streamsend Uploader & Downloader:
```powershell
Invoke-WebRequest -Uri "https://github.com/streamsend-io/docsify/raw/refs/heads/main/downloads/file-chunk-windows-latest.zip" -OutFile "file-chunk-windows-latest.zip"
Expand-Archive -Path "file-chunk-windows-latest.zip" -DestinationPath "."
```

To test using a local Kafka (at localhost:9092)
```powershell
Start-Process -FilePath "windows\uploader.exe" -ArgumentList "--input.dir", "C:\temp\streamsend\upload", "--topic", "file-chunk-topic" -NoNewWindow
Start-Sleep 1
Start-Process -FilePath "windows\downloader.exe" -ArgumentList "--output.dir", "C:\temp\streamsend\download", "--topic", "file-chunk-topic" -NoNewWindow
```

To test using a sasl/ssl authenticated system (including Confluent Cloud)
```powershell
Start-Process -FilePath "windows\uploader.exe" -ArgumentList "--input.dir", "C:\temp\streamsend\upload", "--topic", "file-chunk-topic", "--bootstrap.servers", "...", "--sasl.username", "...", "--sasl.password", "...", "--security.protocol", "SASL_SSL" -NoNewWindow
Start-Sleep 1
Start-Process -FilePath "windows\downloader.exe" -ArgumentList "--output.dir", "C:\temp\streamsend\download", "--topic", "file-chunk-topic", "--bootstrap.servers", "pkc...confluent.cloud", "--sasl.username", "..", "--sasl.password", "..", "--security.protocol", "SASL_SSL" -NoNewWindow
```

### Linux

You can also download the [AMD64](https://github.com/streamsend-io/docsify/raw/refs/heads/main/downloads/file-chunk-linux-amd64-latest.tar.gz) binaries
Or [Docker](https://hub.docker.com/u/streamsend) (linux/amd64)

## Testing File Streaming

Queue up some content to stream (adjust paths for your platform):

**macOS/Linux:**
```text
 cp -R /usr/share/man /tmp/streamsend/upload
```

**Windows:**
```powershell
Copy-Item -Path "C:\Windows\System32\drivers\etc" -Destination "C:\temp\streamsend\upload" -Recurse
```

After the 5-second file.minimum.age.ms, this streams files from the source directory.
Almost all files fit inside a Kafka message so they stream as single-chunks; larger files are streamed in multiple chunks because they exceed the chunk size. The chunk size is determined automatically (check the Uploader logging) so it depends on your cluster limits.
Sym-links are ignored; which accounts for the file-count delta between the directories. 

Let's stream a large file:

**macOS/Linux:**
```text
cp /var/log/install.log /tmp/streamsend/upload
```

**Windows:**
```powershell
Copy-Item -Path "C:\Windows\Logs\WindowsUpdate\WindowsUpdate.log" -Destination "C:\temp\streamsend\upload"
```

Or restart Uploader to generate a 50MB test file every ten seconds:

**macOS:**
```text
macos/uploader    --input.dir /tmp/streamsend/upload   --topic file-chunk-topic --generate.test.file.bytes 50000000
```

**Windows:**
```powershell
windows\uploader.exe --input.dir C:\temp\streamsend\upload --topic file-chunk-topic --generate.test.file.bytes 50000000
```

Other Uploader configuration options https://streamsend.io/#/configuration/uploader

## Platform Support

The File-chunk Pipeline is available in multiple packaging options:

- **Linux AMD64**: Binary releases and Docker images
- **macOS**: Binary releases only
- **Windows**: Binary releases (standalone executable)
- **Linux ARM64**: Forthcoming support (binary releases and Docker images)

## Prerequisites

### All Platforms
- Kafka cluster (self-hosted or managed service)

### Linux (AMD64)
- libssl3, libsasl2-2, libzstd1 (install with your package manager if needed)

### macOS
- macOS 10.15 or later
- librdkafka (can be installed with Homebrew: `brew install librdkafka`)

### Windows
- Windows 10 or later
- No additional dependencies required (standalone executable)

### Docker
- Docker (for containerized deployment on AMD64)

## Existing Kafka Client (Optional)

If you already have a Kafka client installed on your system (such as librdkafka, Confluent Platform, or other Kafka distributions), you may already have some of the required dependencies:

**What's typically included with Kafka clients:**
- librdkafka library (the core dependency for our binaries)
- SSL/TLS libraries (libssl)
- SASL libraries (libsasl2)
- Compression libraries (libzstd, liblz4, libsnappy)

**To check if you have librdkafka installed:**
```bash
# On Linux
ldconfig -p | grep librdkafka
# or
find /usr/lib /usr/local/lib -name "librdkafka.so*" 2>/dev/null

# On macOS
brew list librdkafka
```

**Important notes:**
- The included librdkafka in our package is version 2.2.0
- If you have an older version installed system-wide, our binaries will use the included version
- Having existing Kafka clients doesn't eliminate the need for other system libraries (libssl3, libsasl2-2)
- For Docker deployments, all dependencies are included in the image
- Windows executables include all required dependencies
- Windows executables include all required dependencies

## Binary Installation

Download the appropriate package for your platform from our [downloads page](https://github.com/streamsend-io/docsify/tree/main/downloads):
- Linux AMD64: `file-chunk-linux-amd64-latest.tar.gz`
- macOS: `file-chunk-macos-latest.tar.gz`
- Windows: `file-chunk-windows-latest.zip`

### Linux and macOS

Extract the package:
```bash
tar -xzvf file-chunk-{platform}-latest.tar.gz
cd {platform}/
```

The package includes:
- `uploader` and `downloader` binaries
- Sample configuration files in the `config/` directory
- Required libraries (Linux only)
- README with platform-specific instructions

For Linux systems, install the included libraries:
```bash
sudo cp librdkafka.so* /usr/lib/
sudo ldconfig
```

### Windows

Extract the package:
```powershell
Expand-Archive -Path "file-chunk-windows-latest.zip" -DestinationPath "."
cd windows\
```

The package includes:
- `uploader.exe` and `downloader.exe` executables
- Sample configuration files in the `config/` directory
- README with Windows-specific instructions

No additional installation steps are required - the executables are standalone and include all dependencies.

## Docker Installation

Pull the Docker images:
```bash
# For AMD64
docker pull streamsend/uploader:latest
docker pull streamsend/downloader:latest
```

Run with Docker:
```bash
# Uploader
docker run -v $(pwd)/config:/config -v $(pwd)/files:/files streamsend/uploader:latest

# Downloader
docker run -v $(pwd)/config:/config -v $(pwd)/files:/files streamsend/downloader:latest
```

## Compatibility

### Authentication Schemes

Currently supported:
- **SASL/SSL**: Full support for SASL PLAIN over SSL
- **No authentication**: For development and testing environments

Planned for future releases:
- **OAuth**: OAuth 2.0 bearer token authentication
- **SASL/SCRAM**: SCRAM-SHA-256 and SCRAM-SHA-512 mechanisms

### Message Format

- **Payload**: Pure bytestream format only
- **Schema Registration**: Not supported - no integration with Schema Registry
- **Stream Processing**: Not supported - designed for file transfer only

### Topic Configuration

- **Partitions**: Supports both single and multi-partition topics
- **Current Edition**: Uses a single partition for all chunk traffic
- **Future Releases**: Will support partition-based parallelism

### Filesystem Requirements

- **Access Type**: Locally accessible filesystem required
- **Uploader**: Requires write access to rename files after successful upload
- **Downloader**: Requires write access to target directory
- **Chunk Processing**: In-memory processing, no additional work storage needed

### Kafka Configuration

- **max.message.bytes**: No specific constraint - the uploader automatically adjusts to use message size limits optimally
- **Small Files**: Currently limited to one file per message
- **Future Enhancement**: Bin-packing of small files into single Kafka messages for improved efficiency

### Resource Requirements

- **Memory**: Minimal - only needs to buffer individual chunks
- **CPU**: Low overhead - simple chunk processing
- **Network**: Bandwidth dependent on file transfer rates
- **Storage**: No temporary storage required beyond source/destination directories
