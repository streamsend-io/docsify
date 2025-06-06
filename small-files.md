# Small Files Handling

Streamsend handles files differently based on their size relative to the configured chunk size, optimizing performance and reducing overhead for both large and small files.

## File Processing Strategy

### Large Files (≥ Chunk Size)
Files that meet or exceed the chunk size are processed using **multi-threaded chunking**:
- Split into multiple chunks across worker threads
- Each chunk sent as separate Kafka message
- Downloader reconstructs file from multiple chunks

### Small Files (< Chunk Size)
Files smaller than the chunk size are processed using **tarball bin-packing**:
- Files remain untouched in filesystem (no renaming)
- Multiple small files packed into compressed tarball
- Single tarball sent as one Kafka message
- State tracked in-memory, not via filesystem
- Downloader extracts all files from tarball

## Bin-Packing Algorithm

### Packing Strategy
```
1. Initialize empty tarball builder
2. For each small file:
   a. Check if file + current tarball size ≤ chunk size
   b. If fits: add file to tarball
   c. If doesn't fit: finalize current tarball, start new one
3. When 90% of chunk size reached: finalize tarball
4. Send compressed tarball to Kafka
```

### Size Estimation
The packer uses conservative size estimation accounting for:
- **Tar headers**: 512 bytes per file
- **Gzip compression**: ~10% overhead estimate
- **Safety margin**: 90% threshold to prevent overruns

### Example Scenario
```
Chunk Size: 1MB
Small Files: file1.txt (100KB), file2.txt (200KB), file3.txt (800KB)

Result: All three files packed into single 1MB tarball
- Saves 2 Kafka messages vs individual sending
- Maintains file integrity and metadata
```

## State Management

### Large Files
- **Crash recovery**: Incomplete uploads detected by suffix state

### Small Files  
- **Memory-based**: File identity tracked by (path, size, modified_time)
- **Duplicate prevention**: Processed files skipped on subsequent scans
- **Checkpointing**: State periodically saved to Kafka topic (planned)
- **No filesystem overhead**: Original files never renamed

## Message Headers

### Large File Chunks
```
chunk.type: "chunk"
file.name: "document.pdf"
chunk.id: "00001"
chunk.bytes: "1048576"
chunkset: "001"
```

### Small File Tarballs
```
chunk.type: "tarball"
tarball.files: "15"
file.name: "tarball"
compression.type: "gzip"
chunk.bytes: "1048576"
```

## Performance Benefits

### Reduced Message Overhead
- **Before**: 1000 small files = 1000 Kafka messages
- **After**: 1000 small files ≈ 50-100 tarball messages
- **Savings**: 90%+ reduction in message count

### Filesystem Efficiency
- **No file renaming** for small files eliminates I/O overhead
- **Reduced inode pressure** on filesystem
- **Lower disk fragmentation** from temporary files

### Network Optimization
- **Higher compression ratios** from multiple files in single tarball
- **Better bandwidth utilization** with larger message payloads
- **Reduced connection overhead** per file transferred

## Configuration

### Chunk Size Tuning
```bash
# Auto-configure based on Kafka message.max.bytes
upload.payload.percentage=95

# Manual override (not recommended)
file.chunk.size.bytes=1048576
```

### Optimal Settings
- **Large files**: 1MB+ chunks for maximum throughput
- **Small files**: Pack efficiently regardless of individual size
- **Mixed workloads**: Algorithm automatically chooses best strategy

## Monitoring

### Logs to Watch
```
# Successful tarball creation
Added 247 small-files to chunk. First file: config.txt, Last File: readme.md, chunk size 1048576

# Individual file processing  
document.pdf:P01 (00001 of 00003) chunk uploaded (chunk size 1048576 bytes)

# State management
file.txt Already processed, skipping
```

### Key Metrics
- **Files per tarball**: Higher is more efficient
- **Compression ratio**: Gzip effectiveness on packed files  
- **Processing time**: Bin-packing vs individual file overhead
- **Message throughput**: Reduced message count impact

## Troubleshooting

### Common Issues

**Small files not processing:**
- Check state management logs for "Already processed" messages
- Verify file age meets `file.minimum.age.ms` requirement
- Ensure files match `file.pattern` regex

**Tarball extraction failures:**
- Verify MD5 checksums in logs
- Check gzip decompression errors
- Ensure sufficient disk space on downloader

**Performance concerns:**
- Monitor tarball file counts (target: 50-500 files per tarball)
- Adjust chunk size if tarballs too small/large
- Consider file size distribution in directory

### Best Practices

1. **Mixed file sizes**: Let algorithm choose strategy automatically
2. **Directory structure**: Organize small files together when possible  
3. **Monitoring**: Track compression ratios and files-per-tarball metrics
4. **Cleanup**: Monitor state management memory usage over time

---

*This intelligent file handling ensures optimal performance regardless of file size distribution, dramatically improving efficiency for workloads with many small files while maintaining full functionality for large file transfers.*
