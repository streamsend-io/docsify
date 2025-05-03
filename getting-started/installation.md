
# Installation


## Pre-requisites

A Kafka Client: not required.
A Kafka Server: required.  Auth using SASL/SSL or noauth (Apache Kafka, Confluent Platform or Confluent Cloud)


## Download the Uploader and Downloader (for macos)

The Uploader and Downloader are available as downloadable executables from the Streamsend github site. 
Install into a suitable home directory by doing a "cd <dirname>" before running the following commands:

### macos
```text
mkdir -p streamsend/bin streamsend/config streamsend/log
cd streamsend/bin
curl -L -o uploader-macos   https://raw.githubusercontent.com/streamsend-io/streamsend/main/docsify/downloads/uploader-macos
curl -L -o downloader-macos https://raw.githubusercontent.com/streamsend-io/streamsend/main/docsify/downloads/downloader-macos

chmod +x uploader-macos downloader-macos
file uploader-macos downloader-macos
```

The output should verify that the executables are for macOS:

```
uploader-macos:   Mach-O 64-bit executable arm64
downloader-macos: Mach-O 64-bit executable arm64

```

### linux
```text
mkdir -p streamsend/bin streamsend/config streamsend/log
cd streamsend/bin
curl -L -o uploader-debian   https://raw.githubusercontent.com/streamsend-io/streamsend/main/docsify/downloads/uploader-debian
curl -L -o downloader-debian https://raw.githubusercontent.com/streamsend-io/streamsend/main/docsify/downloads/downloader-debian

chmod +x uploader-debian downloader-debian
file uploader-debian downloader-debian
```

The output should verify that the executables are for linux:

```
uploader-macos:   ELF 64-bit LSB pie executable, ARM aarch64
downloader-macos: ELF 64-bit LSB pie executable, ARM aarch64

```

Proceed to "Quickstart" to start up your first Streamsend file-chunk pipeline.
