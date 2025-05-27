Maximum File Size
Memory Efficiency
StreamSend is designed with memory efficiency as a core feature, allowing you to transfer files that are substantially larger than the available RAM on your machine. Our tests demonstrate successful streaming of a 27GB file on a system with only 16GB RAM. This is possible due to StreamSend's Rust implementation, which offers several advantages:

Efficient Memory Management: Unlike Java-based applications that rely on garbage collection and the JVM's heap, Rust uses direct memory management without runtime overhead
OS Memory Paging: When handling files larger than physical RAM, Rust works efficiently with the operating system's virtual memory and paging system, allowing portions of the buffer to be swapped to disk as needed
Chunked Processing: Files are processed in configurable chunks (default is automatically set to 85% of the Kafka message.max.bytes setting, with a 15% overhead adjustor)
Minimal Overhead: The Rust implementation has minimal memory overhead beyond the actual file data being buffered

For example, on a system with Kafka's message.max.bytes set to 1,048,588 bytes, the automatic chunk size was calculated as 891,313 bytes (approximately 870KB or 85% of message.max.bytes), allowing for a 15% overhead adjustor while ensuring efficient streaming regardless of the total file size.
File Operations and Performance Considerations
StreamSend performs several critical operations when handling large files:

MD5 Checksum Verification: Calculated on the in-memory buffer before writing to disk, ensuring data integrity without additional disk I/O overhead
Disk Write Operations: For very large files (25GB+), expect the final write to disk to take significant time (our tests showed approximately 10 minutes for a 27GB file)

The disk write time is primarily dependent on:

Storage medium performance (SSD vs HDD)
Available disk throughput
System I/O load at the time of transfer

Plan accordingly when transferring extremely large files, especially if your workflow requires immediate access to the transferred data after completion.
Memory Considerations and Limitations
While StreamSend can handle files larger than available RAM, there are important considerations to understand:

Virtual Memory Utilization: When processing files larger than physical RAM, StreamSend relies on the operating system's virtual memory (swap) capabilities.
Theoretical Size Limit: The absolute maximum file size is theoretically limited by the combined total of physical RAM plus available swap space on your system.
Performance Characteristics:

Files smaller than available RAM: Optimal performance
Files larger than RAM but smaller than RAM+swap: Functional but with reduced performance due to paging
Files approaching or exceeding RAM+swap: Not recommended, may cause system instability


System Impact: Processing very large files can cause significant system-wide performance impact due to memory pressure and swap activity.

For mission-critical deployments with very large files (>30GB), we recommend:

Setting up dedicated systems with sufficient RAM
Configuring appropriate swap space (at least equal to physical RAM)
Minimizing other memory-intensive processes during transfers

