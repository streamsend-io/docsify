# Output Sink Configuration

Streamsend Downloader can write downloaded files to two output sinks: a local filesystem or an S3 bucket.

## Output Sink Selection

The output sink type is automatically determined by configuration:

- **Local Filesystem** (default): Used when `s3.bucket.name` is not configured
- **S3 Bucket**: Used when `s3.bucket.name` is configured

## Local Filesystem Sink

### Configuration

Set `output.dir` to a writable path on the local filesystem:

```properties
output.dir=/path/to/download/directory
```

### File Structure

Downloaded files are organized as:
```
{output.dir}/{uploader.name}/{file.relative.path}/{file.name}
```

### Requirements

- The specified directory must be writable by the Downloader process
- Sufficient disk space must be available
- Directory will be created if it doesn't exist

## S3 Bucket Sink

### Required Configuration

Both of these properties are **required** for S3 mode:

```properties
s3.bucket.name=your-bucket-name
aws.region=us-west-2
```

### Optional Configuration

**Custom S3 Endpoint** (for S3-compatible services):
```properties
s3.endpoint.url=https://s3.custom-provider.com
```

**Output Directory Prefix** (used as S3 key prefix):
```properties
output.dir=data/downloads
```

### File Structure

Downloaded files are organized in S3 as:
```
s3://{bucket.name}/{output.dir}/{uploader.name}/{file.relative.path}/{file.name}
```

If `output.dir` is not specified, files are stored directly under:
```
s3://{bucket.name}/{uploader.name}/{file.relative.path}/{file.name}
```

## AWS Authentication

### Configuration Properties

Authentication credentials can be configured using these properties:

```properties
aws.region=us-west-2
aws.access.key.id=YOUR_ACCESS_KEY
aws.secret.access.key=YOUR_SECRET_KEY
aws.session.token=YOUR_SESSION_TOKEN
```

**Note**: `aws.session.token` is only required when using temporary credentials.

### Environment Variables

Alternatively, set these environment variables before starting Downloader:

```bash
export AWS_REGION=us-west-2
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN  # Only for temporary credentials
```

### Authentication Priority

If both configuration properties and environment variables are set, configuration properties take precedence.

### Default Credentials

If no explicit credentials are provided, Downloader will attempt to use the AWS SDK's default credential chain (IAM roles, credential files, etc.).

## Startup Validation

### S3 Connectivity Test

When using S3 mode, Downloader performs a comprehensive connectivity test during startup:

1. **Client Creation**: Validates AWS configuration
2. **Bucket Access**: Confirms bucket exists and is accessible  
3. **Region Verification**: Checks bucket region matches configuration
4. **Write Permissions**: Tests ability to write objects
5. **Read Permissions**: Tests ability to read objects back
6. **Cleanup**: Removes test objects

If any test fails, Downloader will exit with detailed diagnostic information.

### Local Filesystem Test

When using local mode, Downloader tests write permissions to the specified directory during startup.

## Configuration Examples

### Local Filesystem Example

```properties
# Basic local configuration
output.dir=/home/user/downloads

# Kafka and other settings...
topic=file-transfer
bootstrap.servers=localhost:9092
```

### S3 Example with Access Keys

```properties
# S3 configuration with explicit credentials
s3.bucket.name=my-streamsend-bucket
aws.region=us-east-1
aws.access.key.id=AKIAIOSFODNN7EXAMPLE
aws.secret.access.key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
output.dir=downloads/production

# Kafka and other settings...
topic=file-transfer
bootstrap.servers=localhost:9092
```

### S3 Example with Environment Variables

```bash
# Set environment variables
export AWS_REGION=eu-west-1
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

```properties
# Configuration file
s3.bucket.name=my-streamsend-bucket
output.dir=downloads/staging

# Kafka and other settings...
topic=file-transfer
bootstrap.servers=localhost:9092
```

### S3-Compatible Service Example

```properties
# MinIO or other S3-compatible service
s3.bucket.name=streamsend-data
s3.endpoint.url=https://minio.example.com:9000
aws.region=us-east-1
aws.access.key.id=minioadmin
aws.secret.access.key=minioadmin
```

## Troubleshooting

### Common S3 Issues

**Bucket Not Found**: Ensure the bucket exists and the name is correct
**Access Denied**: Verify IAM permissions include `s3:GetObject`, `s3:PutObject`, and `s3:DeleteObject`
**Region Mismatch**: Ensure `aws.region` matches the bucket's actual region
**Invalid Credentials**: Check access key and secret key are correct and active

### Common Local Issues

**Permission Denied**: Ensure the user running Downloader has write access to `output.dir`
**Disk Full**: Check available disk space in the target directory
**Path Not Found**: Ensure parent directories exist or can be created

## Performance Considerations

### S3 Mode
- Individual files result in single S3 uploads
- Small file collections (tarballs) are extracted and uploaded as individual objects
- Network latency affects upload performance
- Consider S3 transfer acceleration for cross-region transfers

### Local Mode  
- Sequential file writing maintains chunk order
- Local disk I/O performance directly affects throughput
- Consider SSD storage for high-throughput scenarios
