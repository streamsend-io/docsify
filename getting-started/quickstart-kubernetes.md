# Quick Start - Kubernetes

Start a Streamsend file-chunk pipeline as Kubernetes pods, streaming via a reachable Kafka cluster. Kafka cluster credentials are stored as kubernetes secrets. The uploader will auto-create the topic if it does not exit. The filessystems are mounted as PVCs to the Uploader and Downloader. This quick start uses the Uploader "generate.test.files" feature to automatically generate file-stream traffic to the Downloader. 

## Docker Containers
The pods pull docker images for (https://hub.docker.com/r/streamsend/uploader) and (https://hub.docker.com/r/streamsend/downloader) - two OS/ARCH options are available: linux/arm64/v8 (for Linux) and 

## Create Kubernetes Secrets for BOOTSTRAP_SERVERS, APIKEY and SECRET

Export these to environment variables before creating the k8s secret:

```text

export BOOTSTRAP_SERVERS=xxx
export APIKEY=xxx
export SECRET=xxx

if [[ -z "$BOOTSTRAP_SERVERS" || -z "$APIKEY" || -z "$SECRET" ]]; then
  echo "ERROR: BOOTSTRAP_SERVERS, APIKEY, and SECRET must be set as environment variables."
  exit 1
fi

kubectl delete secret streamsend-secrets --ignore-not-found

kubectl create secret generic streamsend-secrets \
  --from-literal=BOOTSTRAP_SERVERS="$BOOTSTRAP_SERVERS" \
  --from-literal=APIKEY="$APIKEY" \
  --from-literal=SECRET="$SECRET"

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
security.protocol : SASL_SSL
   sasl.mechanism : PLAIN
            topic : file-chunk-topic
        files.dir : /tmp/files_uploader
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
        files.dir : /tmp/files_downloader
EOF
```

## Start the Downloader

If you are testing the Uploader and Downloader on the same machine, ensure that the "files.dir" for each points to different directories.

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
