# StreamSend Downloads


This page provides access to the latest StreamSend executables for various platforms.

## Linux AMD64

The Linux AMD64 package contains both the uploader and downloader executables along with the required libraries.

- <a href="file-chunk-linux-amd64-latest.tar.gz" download>Latest Version</a>

### Installation

1. Download the latest package
2. Extract the archive: `tar -xzf file-chunk-linux-amd64-latest.tar.gz`
3. Navigate to the extracted directory: `cd linux-amd64`
4. Run the installation script: `./install.sh`

## macOS

The macOS package contains both the uploader and downloader executables.

- <a href="file-chunk-macos-latest.tar.gz" download>Latest Version</a>

### Installation

1. Download the latest package
2. Extract the archive: `tar -xzf file-chunk-macos-latest.tar.gz`
3. Navigate to the extracted directory: `cd macos`
4. Run the installation script: `./install.sh`

### Requirements

- macOS 10.15 or later
- librdkafka (install with Homebrew: `brew install librdkafka`)

## Version History

<div id="version-history">Loading version history...</div>

<script>
fetch('versions.json')
  .then(response => response.json())
  .then(versions => {
    const container = document.getElementById('version-history');
    if (versions.length === 0) {
      container.innerHTML = '<p>No previous versions available.</p>';
      return;
    }
    
    // Sort versions by date (newest first)
    versions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '<table><thead><tr><th>Version</th><th>Date</th><th colspan="3">Download</th></tr></thead><tbody>';
    
    versions.forEach(version => {
      html += `<tr>
        <td>${version.version}</td>
        <td>${version.date}</td>
        <td>`;
      
      if (version.linux_amd64) {
        html += `<a href="${version.linux_amd64}" download>Linux AMD64</a>`;
      }
      
      html += '</td><td>';
      
      if (version.macos) {
        html += `<a href="${version.macos}" download>macOS</a>`;
      }
      
      html += '</td><td>';
      
      if (version.linux_arm64) {
        html += `<a href="${version.linux_arm64}" download>Linux ARM64</a>`;
      }
      
      html += `</td></tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
  })
  .catch(error => {
    console.error('Error loading version history:', error);
    document.getElementById('version-history').innerHTML = 
      '<p>Error loading version history. Please try again later.</p>';
  });
</script>
