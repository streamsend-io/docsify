# Getting Started

The StreamSend File-chunk Pipeline provides high-throughput file transfer using Kafka as the transport layer. This guide covers Kafka server setup options and client installation.

## Kafka Server Setup

Choose your Kafka environment based on your requirements:

### Apache Kafka (Local Development)

For local testing and development, set up a local Kafka broker:

```bash
# Download and start Kafka
wget https://archive.apache.org/dist/kafka/3.9.0/kafka_2.13-3.9.0.tgz
tar -xzf kafka_2.13-3.9.0.tgz
cd kafka_2.13-3.9.0

# Start Zookeeper and Kafka
bin/zookeeper-server-start.sh config/zookeeper.properties &
bin/kafka-server-start.sh config/server.properties &

# Create required topics
bin/kafka-topics.sh --create --topic streamsend-state-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1 --config cleanup.policy=compact
bin/kafka-topics.sh --create --topic file-chunk-topic --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

**Connection settings for local Kafka:**
- Bootstrap servers: `localhost:9092`
- Security: No authentication required

### Confluent Cloud

For managed Kafka in the cloud:

1. **Create a Kafka cluster** in [Confluent Cloud](https://confluent.cloud)
2. **Generate API credentials** (API Key and Secret)
3. **Create required topics:**
   - `streamsend-state-topic` (compacted cleanup policy)
   - `file-chunk-topic` (standard topic)

**Connection settings for Confluent Cloud:**
- Bootstrap servers: `pkc-xxxxx.region.aws.confluent.cloud:9092`
- Security protocol: `SASL_SSL`
- SASL mechanism: `PLAIN`
- SASL username: Your API Key
- SASL password: Your API Secret

### AWS MSK (Managed Streaming for Kafka)

For enterprise AWS environments with SCRAM authentication:

#### Prerequisites
- AWS MSK cluster with SCRAM authentication enabled
- EC2 instance in the same VPC as MSK cluster
- Java 8+ and Kafka client tools installed

#### Setup Steps

**1. Install Kafka Client Tools:**
```bash
# On Amazon Linux 2023
sudo yum update -y
sudo yum install -y java-1.8.0-amazon-corretto wget curl tar

# Download Kafka client
wget https://archive.apache.org/dist/kafka/3.9.0/kafka_2.13-3.9.0.tgz
tar -xzf kafka_2.13-3.9.0.tgz
cd kafka_2.13-3.9.0

# Download MSK IAM Auth library
curl -L -o aws-msk-iam-auth.jar https://github.com/aws/aws-msk-iam-auth/releases/download/v1.1.5/aws-msk-iam-auth-1.1.5-all.jar
```

**2. Configure SCRAM Authentication:**

Create admin client properties for user management:
```bash
cat > admin-client.properties << 'EOF'
security.protocol=SASL_SSL
sasl.mechanism=AWS_MSK_IAM
sasl.jaas.config=software.amazon.msk.auth.iam.IAMLoginModule required;
sasl.client.callback.handler.class=software.amazon.msk.auth.iam.IAMClientCallbackHandler
EOF
```

**3. Create SCRAM User Account:**
```bash
# Set your cluster details
CLUSTER_ARN="arn:aws:kafka:region:account:cluster/your-cluster-name/cluster-id"
BOOTSTRAP_SERVERS_IAM="your-cluster-iam-bootstrap-servers:9098"
MSK_USERNAME="streamsend-user"
MSK_PASSWORD="your-secure-password"

# Create SCRAM user
export CLASSPATH="aws-msk-iam-auth.jar"
bin/kafka-configs.sh --bootstrap-server ${BOOTSTRAP_SERVERS_IAM} \
  --command-config admin-client.properties \
  --alter --add-config "SCRAM-SHA-512=[password=${MSK_PASSWORD}]" \
  --entity-type users --entity-name "${MSK_USERNAME}"

# Verify user creation
bin/kafka-configs.sh --bootstrap-server ${BOOTSTRAP_SERVERS_IAM} \
  --command-config admin-client.properties \
  --describe --entity-type users
```

**4. Configure SCRAM Client Access:**

Create JAAS configuration:
```bash
cat > users_jaas.conf << EOF
KafkaClient {
   org.apache.kafka.common.security.scram.ScramLoginModule required
   username="${MSK_USERNAME}"
   password="${MSK_PASSWORD}";
};
EOF

export KAFKA_OPTS=-Djava.security.auth.login.config=$(pwd)/users_jaas.conf
```

Create SCRAM client properties:
```bash
cat > scram-client.properties << 'EOF'
security.protocol=SASL_SSL
sasl.mechanism=SCRAM-SHA-512
ssl.truststore.location=/usr/lib/jvm/java-1.8.0-amazon-corretto/jre/lib/security/cacerts
ssl.truststore.password=changeit
EOF
```

**5. Create Required Topics:**
```bash
# Get SCRAM bootstrap servers
BOOTSTRAP_SERVERS_SCRAM="your-cluster-scram-bootstrap-servers:9096"

# Create compacted state topic
bin/kafka-topics.sh --bootstrap-server ${BOOTSTRAP_SERVERS_SCRAM} \
  --command-config scram-client.properties \
  --create --topic streamsend-state-topic \
  --partitions 1 --replication-factor 3 \
  --config cleanup.policy=compact

# Create standard file chunk topic
bin/kafka-topics.sh --bootstrap-server ${BOOTSTRAP_SERVERS_SCRAM} \
  --command-config scram-client.properties \
  --create --topic file-chunk-topic \
  --partitions 1 --replication-factor 3

# Verify topics
bin/kafka-topics.sh --bootstrap-server ${BOOTSTRAP_SERVERS_SCRAM} \
  --command-config scram-client.properties --list
```

**Connection settings for AWS MSK:**
- Bootstrap servers: `your-cluster-scram-bootstrap-servers:9096`
- Security protocol: `SASL_SSL`
- SASL mechanism: `SCRAM-SHA-512`
- SASL username: Your SCRAM username
- SASL password: Your SCRAM password

## Client Installation

### macOS

**Prerequisites:**
- macOS 10.15 or later
- Install librdkafka: `brew install librdkafka`

**Installation:**
```bash
# Create directories
mkdir -p /tmp/streamsend/upload /tmp/streamsend/download

# Download binaries
wget "https://github.com/streamsend-io/docsify/raw/refs/heads/main/downloads/file-chunk-macos-latest.tar.gz"
tar -xzf file-chunk-macos-latest.tar.gz
```

**Usage Examples:**

Local Kafka:
```bash
macos/uploader --input.dir /tmp/streamsend/upload --topic file-chunk-topic &
macos/downloader --output.dir /tmp/streamsend/download --topic file-chunk-topic &
```

Confluent Cloud:
```bash
macos/uploader --input.dir /tmp/streamsend/upload --topic file-chunk-topic \
  --bootstrap.servers pkc-xxxxx.region.aws.confluent.cloud:9092 \
  --sasl.username your-api-key --sasl.password your-api-secret \
  --security.protocol SASL_SSL &

macos/downloader --output.dir /tmp/streamsend/download --topic file-chunk-topic \
  --bootstrap.servers pkc-xxxxx.region.aws.confluent.cloud:9092 \
  --sasl.username your-api-key --sasl.password your-api-secret \
  --security.protocol SASL_SSL &
```

AWS MSK:
```bash
macos/uploader --input.dir /tmp/streamsend/upload --topic file-chunk-topic \
  --bootstrap.servers your-cluster:9096 \
  --sasl.username streamsend-user --sasl.password your-password \
  --security.protocol SASL_SSL --sasl.mechanism SCRAM-SHA-512 &

macos/downloader --output.dir /tmp/streamsend/download --topic file-chunk-topic \
  --bootstrap.servers your-cluster:9096 \
  --sasl.username streamsend-user --sasl.password your-password \
  --security.protocol SASL_SSL --sasl.mechanism SCRAM-SHA-512 &
```

### Linux (AMD64)

**Prerequisites:**
- Linux system with AMD64 architecture
- System libraries: `libssl3`, `libsasl2-2`, `libzstd1`

**Installation:**
```bash
# Install dependencies (Ubuntu/Debian)
sudo apt update
sudo apt install libssl3 libsasl2-2 libzstd1

# Or for Amazon Linux/RHEL/CentOS
sudo yum install openssl-libs cyrus-sasl-lib zstd

# Download and extract
wget "https://github.com/streamsend-io/docsify/raw/refs/heads/main/downloads/file-chunk-linux-amd64-latest.tar.gz"
tar -xzf file-chunk-linux-amd64-latest.tar.gz

# Install libraries
sudo cp linux-amd64/librdkafka.so* /usr/local/lib/
sudo ldconfig
```

**Usage:**
```bash
# Create directories
mkdir -p /tmp/streamsend/upload /tmp/streamsend/download

# Same command patterns as macOS, replace 'macos/' with 'linux-amd64/'
linux-amd64/uploader --input.dir /tmp/streamsend/upload --topic file-chunk-topic
```

### Docker

**Installation:**
```bash
# Pull images
docker pull streamsend/uploader:latest
docker pull streamsend/downloader:latest
```

**Usage:**
```bash
# Create local directories
mkdir -p ./upload ./download

# Local Kafka
docker run -v $(pwd)/upload:/files/input -v $(pwd)/download:/files/output \
  streamsend/uploader:latest --input.dir /files/input --topic file-chunk-topic

# With authentication (Confluent Cloud or AWS MSK)
docker run -v $(pwd)/upload:/files/input \
  streamsend/uploader:latest \
  --input.dir /files/input --topic file-chunk-topic \
  --bootstrap.servers your-bootstrap-servers \
  --sasl.username your-username --sasl.password your-password \
  --security.protocol SASL_SSL --sasl.mechanism SCRAM-SHA-512
```

## Testing File Streaming

Queue up content to stream:

```bash
# Copy some files to test
cp -R /usr/share/man /tmp/streamsend/upload  # Linux/macOS

# Generate a large test file
echo "This creates a 50MB test file every 10 seconds"
uploader --input.dir /tmp/streamsend/upload --topic file-chunk-topic \
  --generate.test.file.bytes 50000000
```

After the default 5-second `file.minimum.age.ms`, files stream from the source directory. Most files fit in single Kafka messages; larger files are automatically chunked.

## Configuration

- **Small files**: Streamed as single chunks
- **Large files**: Automatically chunked based on Kafka cluster limits
- **Symlinks**: Ignored by the uploader
- **File processing**: Files are renamed after successful upload

For detailed configuration options, see:
- [Uploader Configuration](https://streamsend.io/#/configuration/uploader)
- [Downloader Configuration](https://streamsend.io/#/configuration/downloader)

## Compatibility

### Authentication Support
- ✅ **SASL/SSL**: PLAIN and SCRAM-SHA-512 mechanisms
- ✅ **No authentication**: For development environments
- 🔄 **Planned**: OAuth 2.0 bearer token authentication

### Platform Support
- ✅ **Linux AMD64**: Binary releases and Docker images
- ✅ **macOS**: Binary releases (10.15+)
- 🔄 **Linux ARM64**: Forthcoming support

### Kafka Compatibility
- **Topic types**: Single and multi-partition topics
- **Message format**: Pure bytestream (no Schema Registry)
- **Cleanup policies**: Supports both standard and compacted topics
- **Cluster types**: Apache Kafka, Confluent Cloud, AWS MSK
