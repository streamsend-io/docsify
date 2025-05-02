# Quick Start

Here's a minimal example that streams files through a Kafka topic to get you up and running.

## Set STREAMSEND_HOME

Set an environment variable that points to the location of the Streamsend executables:

```text
export STREAMSEND_HOME=/tmp/streamsend
```text


## Create a topic (optional)

The Uploader auto-creates the topic if it is not found.
Create a target topic for the pipeline (add authentication properties as required for your Kafka cluster):
```text
kafka-topics --create --topic file-chunk-topic --partitions 1 --bootstrap-server localhost:9092
```


### Create directories to upload and download files

This pipeline will monitor directory /tmp/files_uploader for files to upload, and stream merged files (to the same machine) in /tmp/files_downloader.

```text
cd /tmp
rm -rf /tmp/files_uploader /tmp/files_downloader
mkdir  /tmp/files_uploader /tmp/files_downloader
```


### Download Streamsend 

If you have not yet downloaded the Streamsend Uploader & Downloader executables, see "Installation"

For a cluster that uses SASL/SSL authentication, set environment variables BOOTSTRAP_SERVERS, APIKEY and SECRET.
For a cluster that uses noauth, set BOOTSTRAP_SERVERS and remove APIKEY & SECRET from uploader.config (or set them to "").


### Create uploader.config

```text
cat <<EOF >${STREAMSEND_HOME}/config/uploader.config
bootstrap.servers : $BOOTSTRAP_SERVERS
    sasl.username : $APIKEY
    sasl.password : $SECRET
 security.protocol: SASL_SSL
sasl.mechanism: PLAIN
            topic : file-chunk-topic
        input.dir : /tmp/input_dir
     file.pattern : .*
EOF
```

## Start the Uploader

```text
${STREAMSEND_HOME}/bin/uploader-macos --config-file ${STREAMSEND_HOME}/config/uploader.config
```text

If it starts ok, the cancel it and restart it using nohup, and tail the logfile:

```text
nohup "${STREAMSEND_HOME}/bin/uploader-macos --config-file ${STREAMSEND_HOME}/config/uploader.config" > "${STREAMSEND_HOME}/log/uploader.out" 2>&1 &
tail -f "${STREAMSEND_HOME}/log/uploader.out" & 
```text


### Create downloader.config

```text
cat <<EOF >${STREAMSEND_HOME}/config/downloader.config
bootstrap.servers : $BOOTSTRAP_SERVERS
    sasl.username : $APIKEY
    sasl.password : $SECRET
 security.protocol: SASL_SSL
sasl.mechanism: PLAIN
            topic : file-chunk-topic
        output.dir : /tmp/output_dir
EOF
```

## Start the Downloader

If you are testing the Uploader and Downloader on the same machine, ensure that the "input.dir" & "output.dir" point to different directories.

```text
${STREAMSEND_HOME}/bin/downloader-macos --config-file ${STREAMSEND_HOME}/config/downloader.config
```text

If it starts ok, the cancel it and restart it using nohup and tail the logfile:

```text
nohup "${STREAMSEND_HOME}/bin/downloader-macos --config-file ${STREAMSEND_HOME}/config/downloader.config" > "${STREAMSEND_HOME}/log/downloader.out" 2>&1 &
tail -f "${STREAMSEND_HOME}/log/downloader.out" & 
```text


## Stream Files

The uploader is monitoring files in /tmp/files_uploader,  to chunk and stream any files (input.file.pattern": ".*").

Start with a small file: (wifi.log is generally a few hundred KB):

```text
cp /var/log/wifi.log /tmp/files_uploader
```

Wait a few seconds for the file to complete processing.

Examine the contents of /tmp/files_downloader to confirm that "wifi.log" has been consumed and merged.

Diff the file to confirm that it is identical to the uploaded file.

```text
diff /tmp/files_downloader/wifi.log  /tmp/files_uploader/wifi.log
```text


Now lets stream 1000 files:
```text
cp /usr/share/man/man1/ /tmp/files_uploader
```


```
