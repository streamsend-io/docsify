# StreamSend Authentication Guide

StreamSend supports three authentication methods for connecting to different types of Kafka clusters. Choose the method that matches your Kafka deployment.

## Authentication Methods Overview

| Method | Use Case | Security Protocol | SASL Mechanism |
|--------|----------|------------------|----------------|
| **No Authentication** | Local development, open clusters | `plaintext` | (none) |
| **SASL_SSL** | Confluent Cloud, secured clusters | `SASL_SSL` | `PLAIN` |
| **AWS MSK IAM** | Amazon MSK with IAM | `SASL_SSL` | `AWS_MSK_IAM` |

## 1. No Authentication (Local Development)

Use this for local Kafka development environments or clusters without security enabled.

### Configuration File
```properties
bootstrap.servers=localhost:9092
security.protocol=plaintext
topic=my-files-topic
input.dir=/path/to/upload/files
```

### Command Line
```bash
./streamsend-uploader \
  --bootstrap.servers localhost:9092 \
  --security.protocol plaintext \
  --topic my-files-topic \
  --input.dir /path/to/upload/files
```

### Docker
```bash
docker run -d \
  -e BOOTSTRAP_SERVERS=localhost:9092 \
  -e SECURITY_PROTOCOL=plaintext \
  -v /host/upload/dir:/app/upload \
  streamsend/uploader
```

## 2. SASL_SSL Authentication

Use this for managed Kafka services like Confluent Cloud, Azure Event Hubs, or any secured Kafka cluster using username/password authentication.

### Confluent Cloud Configuration

**Configuration File:**
```properties
bootstrap.servers=pkc-xxxxx.us-west-2.aws.confluent.cloud:9092
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
sasl.username=<YOUR-API-KEY>
sasl.password=<YOUR-API-SECRET>
ssl.endpoint.identification.algorithm=https
topic=my-files-topic
input.dir=/path/to/upload/files
```

**Environment Variables:**
```bash
export BOOTSTRAP_SERVERS=pkc-xxxxx.us-west-2.aws.confluent.cloud:9092
export SECURITY_PROTOCOL=SASL_SSL
export SASL_MECHANISM=PLAIN
export APIKEY=<YOUR-API-KEY>
export SECRET=<YOUR-API-SECRET>
```

**Command Line:**
```bash
./streamsend-uploader \
  --bootstrap.servers pkc-xxxxx.us-west-2.aws.confluent.cloud:9092 \
  --security.protocol SASL_SSL \
  --sasl.mechanism PLAIN \
  --sasl.username <YOUR-API-KEY> \
  --sasl.password <YOUR-API-SECRET> \
  --topic my-files-topic \
  --input.dir /path/to/upload/files
```

**Docker:**
```bash
docker run -d \
  -e BOOTSTRAP_SERVERS=pkc-xxxxx.us-west-2.aws.confluent.cloud:9092 \
  -e SECURITY_PROTOCOL=SASL_SSL \
  -e SASL_MECHANISM=PLAIN \
  -e APIKEY=<YOUR-API-KEY> \
  -e SECRET=<YOUR-API-SECRET> \
  -v /host/upload/dir:/app/upload \
  streamsend/uploader
```

### Other SASL_SSL Providers

For other managed Kafka services, use the same pattern but with your provider's specific endpoints and credentials:

```properties
bootstrap.servers=<your-provider-endpoint>:9092
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
sasl.username=<your-username>
sasl.password=<your-password>
ssl.endpoint.identification.algorithm=https
```

## 3. AWS MSK IAM Authentication

Use this for Amazon Managed Streaming for Apache Kafka (MSK) clusters with IAM authentication enabled. This method supports both explicit AWS credentials and IAM roles.

### MSK Cluster Requirements

Ensure your MSK cluster has IAM authentication enabled:
- Client authentication must include "IAM role-based authentication"
- Use port 9098 for IAM authentication (not 9092)
- Security groups must allow access on port 9098

### Option A: IAM Roles (Recommended)

This is the most secure method for production deployments on AWS infrastructure.

**Configuration File:**
```properties
bootstrap.servers=b-1.your-cluster.xxxxx.c2.kafka.us-east-1.amazonaws.com:9098
security.protocol=SASL_SSL
sasl.mechanism=AWS_MSK_IAM
aws.region=us-east-1
# Leave AWS credentials empty to use IAM roles
topic=my-files-topic
input.dir=/path/to/upload/files
```

**Environment Variables:**
```bash
export AWS_REGION=us-east-1
# AWS SDK will automatically discover credentials from:
# - IAM instance profile (EC2)
# - IAM roles for service accounts (EKS)
# - IAM task roles (ECS/Fargate)
# - AWS credentials file
```

**Command Line:**
```bash
./streamsend-uploader \
  --bootstrap.servers b-1.your-cluster.xxxxx.c2.kafka.us-east-1.amazonaws.com:9098 \
  --security.protocol SASL_SSL \
  --sasl.mechanism AWS_MSK_IAM \
  --aws.region us-east-1 \
  --topic my-files-topic \
  --input.dir /path/to/upload/files
```

**Docker with IAM Roles:**
```bash
# Attach IAM role to EC2 instance or ECS task
docker run -d \
  -e BOOTSTRAP_SERVERS=b-1.cluster.kafka.us-east-1.amazonaws.com:9098 \
  -e SECURITY_PROTOCOL=SASL_SSL \
  -e SASL_MECHANISM=AWS_MSK_IAM \
  -e AWS_REGION=us-east-1 \
  -v /host/upload/dir:/app/upload \
  streamsend/uploader
```

### Option B: Explicit AWS Credentials

Use this for testing or when IAM roles are not available.

**Configuration File:**
```properties
bootstrap.servers=b-1.your-cluster.xxxxx.c2.kafka.us-east-1.amazonaws.com:9098
security.protocol=SASL_SSL
sasl.mechanism=AWS_MSK_IAM
aws.region=us-east-1
aws.access.key.id=AKIA...
aws.secret.access.key=...
topic=my-files-topic
input.dir=/path/to/upload/files
```

**Environment Variables:**
```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=...
```

**Command Line:**
```bash
./streamsend-uploader \
  --bootstrap.servers b-1.your-cluster.xxxxx.c2.kafka.us-east-1.amazonaws.com:9098 \
  --security.protocol SASL_SSL \
  --sasl.mechanism AWS_MSK_IAM \
  --aws.region us-east-1 \
  --aws.access.key.id AKIA... \
  --aws.secret.access.key ... \
  --topic my-files-topic \
  --input.dir /path/to/upload/files
```

### Option C: Temporary Credentials

For applications using AWS STS temporary credentials:

**Configuration File:**
```properties
bootstrap.servers=b-1.your-cluster.xxxxx.c2.kafka.us-east-1.amazonaws.com:9098
security.protocol=SASL_SSL
sasl.mechanism=AWS_MSK_IAM
aws.region=us-east-1
aws.access.key.id=ASIA...
aws.secret.access.key=...
aws.session.token=IQoJb3JpZ2luX2VjE...
topic=my-files-topic
input.dir=/path/to/upload/files
```

## IAM Permissions for AWS MSK

### Required IAM Policy

Your IAM role or user needs these minimum permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:Connect",
                "kafka-cluster:DescribeCluster"
            ],
            "Resource": "arn:aws:kafka:us-east-1:123456789012:cluster/my-cluster/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:WriteData",
                "kafka-cluster:DescribeTopic",
                "kafka-cluster:CreateTopic"
            ],
            "Resource": "arn:aws:kafka:us-east-1:123456789012:topic/my-cluster/*/my-files-topic"
        },
        {
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:WriteData",
                "kafka-cluster:DescribeTopic",
                "kafka-cluster:CreateTopic"
            ],
            "Resource": "arn:aws:kafka:us-east-1:123456789012:topic/my-cluster/*/streamsend-state-topic"
        }
    ]
}
```

### IAM Policy Template

Replace these values in the policy above:
- `us-east-1`: Your AWS region
- `123456789012`: Your AWS account ID
- `my-cluster`: Your MSK cluster name
- `my-files-topic`: Your data topic name

## Configuration Precedence

Settings are applied in this order (later overrides earlier):

1. **Built-in defaults**
2. **Configuration file** (`--config-file`)
3. **Environment variables**
4. **Command line arguments**

## Security Best Practices

### General
- Use TLS/SSL encryption in production (`security.protocol=SASL_SSL`)
- Store sensitive credentials securely (environment variables, secret managers)
- Never commit credentials to version control
- Use least-privilege access principles

### SASL_SSL Best Practices
- Rotate API keys/passwords regularly
- Use API keys with minimal required permissions
- Monitor credential usage through provider audit logs
- Consider using short-lived tokens when available

### AWS MSK IAM Best Practices
- **Prefer IAM roles over explicit credentials**
- Use temporary credentials for applications
- Enable AWS CloudTrail for audit logging
- Implement IAM policies with least privilege
- Use resource-based policies for fine-grained access control
- Monitor MSK access through AWS CloudWatch

### Network Security
- Use private networking (VPC) when possible
- Configure security groups to allow only necessary ports
- Use bastion hosts or VPN for remote access
- Enable VPC Flow Logs for network monitoring

## Troubleshooting

### Connection Issues
```bash
# Test basic connectivity
telnet your-cluster-endpoint 9092  # For plaintext
telnet your-cluster-endpoint 9098  # For AWS MSK IAM

# Check DNS resolution
nslookup your-cluster-endpoint

# Verify security groups (AWS)
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

### Authentication Failures

**SASL_SSL Issues:**
- Verify API key/username and secret/password are correct
- Check if credentials have expired
- Ensure user has write permissions to the topic
- Verify SSL certificates are trusted

**AWS MSK IAM Issues:**
- Verify IAM permissions are correct and attached to the right resource
- Check AWS region matches MSK cluster region
- Ensure MSK cluster has IAM authentication enabled
- Verify security groups allow port 9098
- Check AWS CloudTrail for denied API calls

**Common Error Messages:**
- `SASL authentication failed`: Invalid credentials
- `Topic authorization failed`: Insufficient permissions
- `UnknownTopicOrPartition`: Topic doesn't exist or no read permission
- `NetworkException`: Connectivity/firewall issues

### Performance Issues
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Monitor Kafka client metrics
export DEBUG=all

# Test with dry run mode
./streamsend-uploader --dry.run yes --log.level DEBUG
```

### AWS-Specific Debugging
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Test MSK permissions
aws kafka describe-cluster --cluster-arn arn:aws:kafka:...

# Check IAM policy simulation
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:role/MyRole \
  --action-names kafka-cluster:Connect \
  --resource-arns arn:aws:kafka:us-east-1:123456789012:cluster/my-cluster/*
```

## Example Configurations

### Development Environment
```properties
# config/dev.properties
bootstrap.servers=localhost:9092
security.protocol=plaintext
topic=dev-files
input.dir=./test-files
log.level=DEBUG
generate.test.file.bytes=1000
```

### Confluent Cloud Production
```properties
# config/confluent-prod.properties
bootstrap.servers=pkc-xxxxx.us-west-2.aws.confluent.cloud:9092
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
topic=prod-files
input.dir=/var/streamsend/upload
log.level=INFO
file.minimum.age.ms=10000
upload.payload.percentage=85
processing.state.checkpoint.interval.secs=300
```

### AWS MSK Production
```properties
# config/aws-msk-prod.properties
bootstrap.servers=b-1.prod-cluster.xxxxx.c2.kafka.us-east-1.amazonaws.com:9098
security.protocol=SASL_SSL
sasl.mechanism=AWS_MSK_IAM
aws.region=us-east-1
topic=production-files
input.dir=/opt/streamsend/upload
log.level=INFO
file.minimum.age.ms=15000
file.maximum.age.ms=86400000
processing.state.checkpoint.interval.secs=600
```

## Migration Between Authentication Methods

### From No Auth to SASL_SSL
1. Update configuration with new security settings
2. Restart uploader - existing state will be preserved
3. Verify connection to secured cluster

### From SASL_SSL to AWS MSK IAM
1. Set up IAM roles and policies
2. Update configuration to use AWS MSK endpoints and IAM settings
3. Test connectivity with new authentication method
4. Update any automation/deployment scripts

### Maintaining State During Migration
The uploader's persistent state management ensures that file processing state is preserved across configuration changes, preventing duplicate uploads when switching between authentication methods or clusters.
