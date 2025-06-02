# Uploader State Management

## Overview

The Streamsend Uploader implements persistent state management to track which files have been successfully processed, preventing duplicate uploads across uploader restarts and ensuring reliable file processing in production environments.

## Key Benefits

- **Prevents Duplicate Uploads**: Files are only uploaded once, even after uploader restarts
- **Crash Recovery**: Processing state survives unexpected shutdowns and system reboots
- **Modified File Detection**: Only reprocesses files that have been modified since last upload
- **Multi-Instance Safety**: Multiple uploader instances can safely share input directories
- **Efficient Resource Usage**: Avoids reprocessing already-uploaded files

## How State Management Works

### State Storage

The uploader maintains processing state in a dedicated Kafka topic configured by `processing.state.topic`. Each uploader instance stores its state using a unique key based on:

```
Key Format: "{hostname}||{uploader_name}"
Example: "server01||data-uploader"
```

### State Structure

State is stored using a hierarchical JSON structure that groups files by their relative path within the input directory:

```json
{
  "hostname": "server01",
  "uploader_name": "data-uploader", 
  "last_updated": 1735123456789,
  "paths": {
    "": [
      {
        "file_name": "root_file.txt",
        "file_last_modified": 1735123400000
      }
    ],
    "logs/2024/12": [
      {
        "file_name": "app.log",
        "file_last_modified": 1735123350000
      },
      {
        "file_name": "error.log", 
        "file_last_modified": 1735123360000
      }
    ],
    "data/exports": [
      {
        "file_name": "export_20241225.csv",
        "file_last_modified": 1735123370000
      }
    ]
  }
}
```

This hierarchical approach significantly reduces message size compared to storing each file individually, especially for directories containing many files in the same path.

### Message Compression

State messages are automatically compressed using gzip, typically achieving 70-90% size reduction. Messages include headers:

- `content-type`: `application/json`
- `compression`: `gzip`
- `schema-version`: `2.0`

## File Processing Lifecycle

### 1. File Discovery
```
Input Directory Scan → Eligible Files → State Check → Processing Decision
```

### 2. State Check Logic
For each eligible file, the uploader checks:

1. **Already Processed**: Is the file in the processed files state?
2. **Modification Check**: If processed, has it been modified since last upload?
3. **Currently Processing**: Is another process currently handling this file?
4. **Age Constraints**: Does the file meet minimum/maximum age requirements?

### 3. Processing States

- **Not Processed**: File is new and eligible for upload
- **Processing**: File is currently being uploaded
- **Processed**: File has been successfully uploaded
- **Modified**: Previously processed file has been modified and needs reprocessing
- **Aged Out**: File exceeds maximum age and is ignored

### 4. State Transitions

```
New File → Mark Processing → Upload → Mark Completed
                ↓
            Upload Failed → Mark Failed → Retry Later
```

## Configuration

### Core Properties

```properties
# State topic configuration
processing.state.topic=streamsend-state-topic

# Checkpoint frequency (seconds)
processing.state.checkpoint.interval.secs=60

# File age limits (milliseconds)
file.minimum.age.ms=5000
file.maximum.age.ms=0  # 0 = no maximum age
```

### Recommended Settings

| Environment | Checkpoint Interval | Max Age | Rationale |
|-------------|-------------------|---------|-----------|
| Development | 30 seconds | 24 hours | Fast feedback, recent files only |
| Production | 60 seconds | 7 days | Balanced performance, reasonable retention |
| Batch Processing | 300 seconds | 30 days | Less frequent updates, longer retention |

## State Management Operations

### Startup Behavior

1. **Topic Creation**: Automatically creates state topic if missing
2. **State Loading**: Reads existing state from Kafka topic
3. **Backward Compatibility**: Handles both old (flat) and new (hierarchical) formats
4. **State Validation**: Verifies loaded state and cleans up invalid entries

### Runtime Operations

#### Automatic Checkpointing
- Triggered every `processing.state.checkpoint.interval.secs`
- Occurs after file processing completion
- Includes cleanup of expired file references

#### Size Management
The uploader automatically manages state size to prevent "message too large" errors:

1. **Size Estimation**: Calculates compressed payload size before sending
2. **Automatic Pruning**: Removes oldest processed files if message too large
3. **Progressive Reduction**: Iteratively reduces file count until message fits
4. **Graceful Degradation**: Continues operation even with reduced state

### Error Handling

#### Message Too Large
```
State payload too large → Prune oldest files → Retry → Continue operation
```

#### Kafka Connectivity Issues
```
Checkpoint failure → Log error → Continue processing → Retry next interval
```

#### Corruption Recovery
```
Invalid state detected → Reset to empty state → Log warning → Rebuild state
```

## Monitoring and Troubleshooting

### Log Messages

#### Normal Operation
```bash
[INFO] Loading hierarchical state: 15 paths
[INFO] Loaded 1,247 processed files from hierarchical state
[DEBUG] Checkpointed state: 1,247 processed files
```

#### Size Management
```bash
[WARN] Reduced state checkpoint to 500 files (892,345 bytes compressed) to fit in message size limit
[DEBUG] State payload: 2,156,789 bytes uncompressed, 892,345 bytes compressed, 15 paths, 1,247 total files
```

#### Error Conditions
```bash
[ERROR] Failed to checkpoint state: Message production error: MessageSizeTooLarge
[ERROR] State checkpoint too large even with 10 files. Skipping checkpoint - will retry after more files age out
[WARN] Failed to deserialize state record: unexpected end of JSON input
```

### Health Indicators

| Indicator | Healthy | Warning | Critical |
|-----------|---------|---------|----------|
| State Size | < 50% chunk size | 50-90% chunk size | > 90% chunk size |
| Checkpoint Success | > 95% | 85-95% | < 85% |
| State Load Time | < 5 seconds | 5-30 seconds | > 30 seconds |

### Troubleshooting Guide

#### Problem: State checkpoints failing with "MessageSizeTooLarge"
**Symptoms**: Repeated checkpoint failure messages
**Causes**: Too many processed files, insufficient message size limits
**Solutions**:
1. Reduce `file.maximum.age.ms` to age out old files faster
2. Increase `upload.payload.percentage` if under 90%
3. Consider splitting workload across multiple uploader instances

#### Problem: Duplicate file uploads after restart
**Symptoms**: Same files being processed multiple times
**Causes**: State not loading correctly, state topic issues
**Solutions**:
1. Verify state topic exists and is accessible
2. Check uploader logs for state loading errors
3. Verify `processing.state.topic` configuration
4. Check Kafka connectivity and permissions

#### Problem: Files not being processed despite being eligible
**Symptoms**: Files remain in input directory but aren't uploaded
**Causes**: Incorrect state marking files as already processed
**Solutions**:
1. Check file modification times vs. state records
2. Verify `file.minimum.age.ms` and `file.maximum.age.ms` settings
3. Monitor state for incorrect file entries
4. Consider manual state reset if corruption suspected

## Performance Considerations

### State Size Impact

| Files Tracked | Compressed Size | Memory Usage | Load Time |
|---------------|----------------|--------------|-----------|
| 1,000 | ~50 KB | ~2 MB | < 1 sec |
| 10,000 | ~500 KB | ~20 MB | ~3 sec |
| 100,000 | ~5 MB | ~200 MB | ~15 sec |

### Optimization Strategies

1. **Tune Maximum Age**: Set appropriate `file.maximum.age.ms` to limit state size
2. **Adjust Checkpoint Interval**: Balance data protection vs. Kafka load
3. **Monitor Compression Ratio**: Hierarchical structure provides 5-10x compression
4. **Partition Strategy**: Use multiple uploader instances for very large file volumes

## Recovery Scenarios

### Complete State Loss
If the state topic is deleted or corrupted:

1. **Immediate Impact**: All files will be considered "new" and reprocessed
2. **Recovery Actions**: 
   - Monitor for duplicate uploads in downstream systems
   - Consider temporarily enabling `dry.run=yes` during recovery
   - Files already processed won't be re-uploaded due to filename uniqueness

### Partial State Corruption
If individual state records are corrupted:

1. **Automatic Recovery**: Uploader resets to empty state for affected instance
2. **Gradual Rebuild**: State rebuilds as files are processed normally
3. **Minimal Impact**: Other uploader instances unaffected

### Kafka Topic Issues
If state topic becomes unavailable:

1. **Graceful Degradation**: Uploader continues without state persistence
2. **Warning Logs**: Checkpoint failures logged but processing continues
3. **Recovery**: State persistence resumes when topic becomes available

## Best Practices

### Configuration
- Set `file.maximum.age.ms` to reasonable retention period (7-30 days)
- Use default `processing.state.checkpoint.interval.secs=60` for most cases
- Monitor state topic size and adjust retention as needed

### Operations
- Monitor checkpoint success rates in logs
- Set up alerting for repeated checkpoint failures
- Include state topic in backup and recovery procedures

### Development
- Use `dry.run=yes` when testing to avoid affecting production state
- Test uploader restart scenarios to verify state persistence
- Validate file age settings with expected file processing patterns

### Security
- Apply same security controls to state topic as main data topics
- Ensure state topic has appropriate retention settings
- Monitor access to state topic for unauthorized reads/writes

## Limitations and Known Issues

### Current Limitations
1. **Single State Record**: Each uploader instance maintains one state record
2. **Memory Usage**: Large file counts increase memory usage proportionally
3. **Bootstrap Delay**: Large state records increase startup time
4. **Topic Dependency**: State persistence requires Kafka availability

### Known Issues
1. **Message Size Limits**: Very large file inventories may exceed message limits
2. **Clock Skew**: File modification time comparisons sensitive to system clock accuracy
3. **Network Partitions**: Extended Kafka unavailability disables state persistence

### Future Enhancements
- Distributed state management across multiple topics
- Configurable state retention policies
- Enhanced compression algorithms
- State migration tools for operational maintenance

## Version History

### Schema Version 2.0 (Current)
- Hierarchical JSON structure grouped by file path
- Automatic compression with gzip
- Backward compatibility with schema version 1.0

### Schema Version 1.0 (Legacy)
- Flat file list structure
- Larger message sizes
- Still supported for reading existing state records
