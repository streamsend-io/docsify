# Docker

## Overview

The streamsend/uploader and streamsend/downloader docker containers run the streamsend executables as a container. 
Filesystems must be mounted for the Uploader (to read files) and the Downloader (to write files).  
The docker containers run on AMD64 platforms. ARM64 platforms will be added at a future date.
Configuration properties should be provided as a config file which is also mounted to the container. 


## Internet Connectivity

The docker compose below requires internet connectivity to download the following containers:

* streamsend/uploader:latest
* streamsend/downloader:latest

The streamsend containers are self-contained and do not make any subsequent calls (for example, to install additional plugins).

## Quickstart

```text
cat <<EOF >/tmp/uploader.config
bootstrap.servers:$BOOTSTRAP_SERVERS
sasl.username : ${APIKEY}
sasl.password : ${SECRET}
security.protocol : sasl_ssl
sasl.mechanism : plain
ssl.endpoint.authentication.mechanism : none
input.dir:/tmp/input_dir
file.pattern:.*
topic : file-chunk-topic
EOF

docker run \
-v /tmp/uploader.config:/etc/uploader.config:rw \
-v /tmp/input_dir:/tmp/input_dir \
--platform linux/amd64 \
--hostname uploader-1 \
streamsend/uploader:latest uploader --config-file /etc/uploader.config
```

logfile:
```text
latest-amd64: Pulling from streamsend/uploader
...
 streamsend/uploader: Pull complete
 [uploader-1] file-chunk-topic: Successfully created topic
 [uploader-1] file-chunk-topic number of partitions is 1
 [uploader-1] file-chunk-topic message.max.bytes is 2097164
 [uploader-1] Setting file.chunk.size.auto.adjustor=10% for auto-chunk Size mode.
 [uploader-1] Setting file.chunk.size.auto.adjustor=55% for Confluent Cloud
 [uploader-1] *** Automatic configuration of a chunk size of 943759 (55% of message.max.bytes 2097164)
 [upoader--1] *** Streamsend Uploader successfully started on 6c84563347bf with thread(s)=1, topic=file-chunk-topic, partition(s)=1, Chunk Size=943759, Build=2025-04-30 15:19:01 +08:00, Git=
 [uploader-1]  No eligible files found. Polling at 1-second intervals
```


Start the downloader:

```text
cat <<EOF >/tmp/downloader.config
bootstrap.servers:$BOOTSTRAP_SERVERS
sasl.username : ${APIKEY}
sasl.password : ${SECRET}
security.protocol : sasl_ssl
sasl.mechanism : plain
ssl.endpoint.authentication.mechanism : none
output.dir : /tmp/downloaded
topic : file-chunk-topic
EOF

docker run \
  -v /tmp/downloader.config:/etc/downloader.config:rw \
  -v /tmp/downloaded:/tmp/downloaded \
  --platform linux/amd64 \
  streamsend/downloader:latest downloader --config-file /etc/downloader.config

```

The Downloader should report successful startup:

```text
[dwn-26206d2e6f99-1] file-chunk-topic-20250430-082127 number of partitions is 1
[dwn-26206d2e6f99-1] *** Streamsend Downloader successfully started on 26206d2e6f99 with thread(s)=1, topic=file-chunk-topic-20250430-082127, partition(
```


Queue files for streaming:
```text
cp /var/log/* /tmp/input_dir

On completion, each uploaded file is renamed with a __FINISHED postfix. __FINISHED files are deleted after ten minutes.


