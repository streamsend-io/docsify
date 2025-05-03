# Docker

## Overview

The streamsend/uploader and streamsend/downloader docker containers run the streamsend executables as a container. Filesystems must be mounted for the Uploader (to read files) and the Downloader (to write files).  The docker containers run on AMD64 platforms. Configuration properties should be provided as a config file which is also mounted to the container. 


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
streamsend/uploader:linux/AMD64 uploader --config-file /etc/uploader.config
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
  streamsend/downloader:linux/AMD64 downloader --config-file /etc/downloader.config

```

The Downloader should report successful startup:

```text
[dwn-26206d2e6f99-1] file-chunk-topic-20250430-082127 number of partitions is 1
[dwn-26206d2e6f99-1] *** Streamsend Downloader successfully started on 26206d2e6f99 with thread(s)=1, topic=file-chunk-topic-20250430-082127, partition(
```


Queue files for streaming:
```text
cp /var/log/* /tmp/input_dir


Start the uploader container and copy a file into ./streamsend/upload. Check the container logfile.

Each uploaded file will be chunked into 512000 byte events before streaming to file-chunk-topic.

On completion, the file is renamed with a __FINISHED postfix. This will be deleted after ten minutes.

Start the downloader container.  Each streamed file will be merged into directory ./streamsend/download/merged

Copy more file to the upload directory - they will be processed in order.

Files of any size can be streamed - larger files benefit from setting a larger binary.chunk.size.bytes

The chunk size bytes must be less than the max.message.size set for this Kafka cluster.

## Docker compose

### Uploader Container

This docker-compose.yml starts an Uploader container and a Downloader container (and for convenience, a single-node Kafka cluster).

#### Volume Mapping

Create a directory on the docker host to place queued files for upload. This will be a mapped volume in the docker container.

```text
mkdir -p ./streamsend/upload ./streamsend/download ./streamsend/offsets
```

#### Environment Variables

The following environment variables are required for Kafka authentication and for identification of the machine that is uploading files.

```jsx title="Export these environment variables"
  export BOOTSTRAP_SERVERS="your bookstrap servers here"
            export API_KEY="your Kafka Auth API Key here"
             export SECRET="your Kafka Auth Secret here"
           export HOSTNAME=\`hostname\`

```

#### uploader & downloader Docker Compose

```jsx title="Copy this to docker-compose.yml"
networks:
  app-tier:
    driver: bridge

services:
  kafka:
    image: 'bitnami/kafka:latest'
    networks:
      - app-tier
    environment:
      - KAFKA_CFG_NODE_ID=0
      - KAFKA_CFG_PROCESS_ROLES=controller,broker
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093
      - KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      - KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0\@kafka:9093
      - KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER

  uploader:
    image: streamsend/uploader:2.8
    container_name: uploader
    platform: linux/arm64/v8
    networks:
      - app-tier
    depends_on:
      - kafka
    volumes:
      - './streamsend/upload:/streamsend/upload'
      - './streamsend/offsets:/streamsend/offsets'
    deploy:
      replicas: 1
    environment:
      CONNECT_GROUP_ID: "${HOSTNAME}-uploader-group"
      CONNECT_CLIENT_ID: "${HOSTNAME}-uploader-client"
      # Container location of the streamsend plugins
      CONNECT_PLUGIN_PATH: /app/libs
      #
      CONNECT_OFFSET_STORAGE_FILE_FILENAME: /streamsend/offsets/uploader-offsets.txt
      #
      CONNECT_REST_ADVERTISED_HOST_NAME: 'uploader'
      CONNECT_REST_PORT: 8083
      # kafka connection: confluent cloud, apache kafka or AWS MSK
      CONNECT_BOOTSTRAP_SERVERS:          ${BOOTSTRAP_SERVERS}
      CONNECT_PRODUCER_BOOTSTRAP_SERVERS: ${BOOTSTRAP_SERVERS}
      # Connect using SASL_SSL:
      #CONNECT_PRODUCER_SSL_ENDPOINT_IDENTIFICATION_ALGORITHM: https
      #CONNECT_SSL_ENDPOINT_IDENTIFICATION_ALGORITHM:          https
      #CONNECT_PRODUCER_SECURITY_PROTOCOL: SASL_SSL
      #CONNECT_SECURITY_PROTOCOL:          SASL_SSL
      #CONNECT_PRODUCER_SASL_MECHANISM: PLAIN
      #CONNECT_SASL_MECHANISM:          PLAIN
      #CONNECT_PRODUCER_SASL_JAAS_CONFIG: "org.apache.kafka.common.security.plain.PlainLoginModule required username=\"${APIKEY}\" password=\"${SECRET}\";"
      #CONNECT_SASL_JAAS_CONFIG:          "org.apache.kafka.common.security.plain.PlainLoginModule required username=\"${APIKEY}\" password=\"${SECRET}\";"
      #
      #defaults for all connectors
      CONNECT_KEY_CONVERTER: org.apache.kafka.connect.converters.ByteArrayConverter
      CONNECT_VALUE_CONVERTER: org.apache.kafka.connect.converters.ByteArrayConverter
      #
      CONNECT_AUTO_INCLUDE_JMX_REPORTER: FALSE
      #
      CONNECT_LOG4J_ROOT_LOGLEVEL: INFO
      #
      CONNECT_STREAMSEND_INPUT_FILE_PATTERN: ".*"
      CONNECT_STREAMSEND_FILE_MINIMUM_AGE_MS: 1000
      CONNECT_STREAMSEND_BINARY_CHUNK_SIZE_BYTES: AUTO
      CONNECT_STREAMSEND_TOPIC_PARTITIONS: 1
      # uncomment this to automatically generate 20 test files per minute; 0-2500 bytes. This automatically resets the binary.chunk.size.bytes=500
      #CONNECT_STREAMSEND_GENERATE_TEST_FILES: "true"     

  downloader:
    image: streamsend/downloader:2.8
    platform: linux/arm64/v8
    container_name: downloader
    networks:
      - app-tier
    volumes:
      - './streamsend/download:/streamsend/download'
      - './streamsend/offsets:/streamsend/offsets'
    ports:
      - 8083:8083
    deploy:
      replicas: 1
    depends_on:
      - kafka
    environment:
      CONNECT_GROUP_ID: "${HOSTNAME}-downloader-group"
      CONNECT_CLIENT_ID: "${HOSTNAME}-downloader-client"
      # Container location of the streamsend plugins
      CONNECT_PLUGIN_PATH: /app/libs
      #
      CONNECT_OFFSET_STORAGE_FILE_FILENAME: /streamsend/offsets/downloader-offsets.txt
      #
      CONNECT_REST_ADVERTISED_HOST_NAME: 'downloader'
      CONNECT_NAME: downloader
      CONNECT_LISTENERS: "http://0.0.0.0:8083"
      CONNECT_REST_PORT: 8083
      CONNECT_REST_ADVERTISED_PORT: 8083
      # kafka connection: confluent cloud, apache kafka or AWS MSK
      CONNECT_BOOTSTRAP_SERVERS:          ${BOOTSTRAP_SERVERS}
      CONNECT_CONSUMER_BOOTSTRAP_SERVERS: ${BOOTSTRAP_SERVERS}
      # Connect using SASL_SSL:
      #CONNECT_CONSUMER_SSL_ENDPOINT_IDENTIFICATION_ALGORITHM: https
      #CONNECT_SSL_ENDPOINT_IDENTIFICATION_ALGORITHM:          https
      #CONNECT_CONSUMER_SECURITY_PROTOCOL: SASL_SSL
      #CONNECT_SECURITY_PROTOCOL:          SASL_SSL
      #CONNECT_CONSUMER_SASL_MECHANISM: PLAIN
      #CONNECT_SASL_MECHANISM:          PLAIN
      #CONNECT_CONSUMER_SASL_JAAS_CONFIG: "org.apache.kafka.common.security.plain.PlainLoginModule required username=\"${APIKEY}\" password=\"${SECRET}\";"
      #CONNECT_SASL_JAAS_CONFIG:          "org.apache.kafka.common.security.plain.PlainLoginModule required username=\"${APIKEY}\" password=\"${SECRET}\";"
      #
      #defaults for all connectors
      CONNECT_KEY_CONVERTER: org.apache.kafka.connect.converters.ByteArrayConverter
      CONNECT_VALUE_CONVERTER: org.apache.kafka.connect.converters.ByteArrayConverter
      #
      CONNECT_AUTO_INCLUDE_JMX_REPORTER: FALSE



```

#### Start an uploader & downloader Container

```text
docker compose up
```

#### Single-task and multi-task

This release of the source connectors enforces single-task operation (irrespective of the "tasks.max" setting). This means that input files (and their subsequent chunks) are processed by one Kafka Connect task, and all file chunks are produced to a single Kafka topic.

#### Start additional uploader (or downloader) Containers

Multiple single-task uploaders can be configured to stream to the same kafka cluster (and kafka topic). There is no limitation (technical or licensing) on the number of single-task uploaders that are started. The Downloader creates a hostname subdirectory for each uploader to avoid overwriting similarly-named files from differnt uploaders.
