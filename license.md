# License

There is no license restriction for single-task usage. Please contact Mark Teehan (<mark.teehan\@streamsend.io>) for deployment of multi-task pipelines.
There is no limit on the number of single-task source/sink connectors or jobs deployed.
_Single task_ means that one Kafka Connect task produces events to a topic for each source connector, and one Kafka Connect task consumes events for each sink connector.
These plugins support single-task usage only: a _max.tasks_ > 1 is downgraded to 1 during startup.
Single Task throughput can be tuned by modifying the binary.chunk.size.bytes (the recommended starting value is 2048000)

Version 2.9 onwards: optional multiple task operation can be unlocked for a modest consulting engagement, ensuring correct setup and tuning. You can run unlimited numbers of single-task Uploaders and Downloaders for free, in any deployment pattern (point-to-point pipelines, Uploader Funnels, Mirrored downloader Sinks etc). It is recommended to run the pipeline using single-task configuration until pipeline throughput requirements exceed single-task operation capabilities.
To enable multiple tasks, configure property license.key - see "Configuration" for a test value.
