
# Troubleshooting

Fails to start with "Failed to create Kafka consumer: KafkaError (Client creation error: ssl.ca.location failed: crypto/x509/by_file.c:237:X509_load_cert_crl_file_ex error:05880020:x509 certificate routines::BIO lib)"

Optional Uploader & Downloader Configuration property *"ssl.ca.location"* specifies the location of the self-signed certificates from the local machine - if this is misconfigured then the SSL handshake fails. If unconfigured when starting containerized Uploader or Downloader, then it is automatically configured to "/etc/ssl/certs/ca-certificates.crt"; which is the certificate location in the container. This should not require manual configuration on macOS.




Fails to start with "Meta data fetch error: BrokerTransportFailure (Local: Broker transport failure)"
Ensure that --security.protocol SASL_SSL is specified if the broker requires SASL/SSL
