// Animation for the actual page content
window.$docsify = window.$docsify || {};
window.$docsify.plugins = [].concat(window.$docsify.plugins || [], function(hook, vm) {
  hook.doneEach(function() {
    console.log('Animation script running...');
    console.log('Current path:', vm.route.path);
    console.log('Current hash:', window.location.hash);
    
    // Find the section by looking for the h2 with the specific text
    const headers = document.querySelectorAll('h2');
    let targetHeader = null;
    
    for (let header of headers) {
      console.log('Checking header:', header.textContent);
      if (header.textContent.includes('What does a Streamsend file-chunk pipeline do?')) {
        targetHeader = header;
        console.log('Found target header!');
        break;
      }
    }
    
    if (!targetHeader) {
      console.log('Target header not found');
      return;
    }
    
    // Find the paragraph after the header
    let paragraph = targetHeader.nextElementSibling;
    while (paragraph && paragraph.tagName !== 'P') {
      paragraph = paragraph.nextElementSibling;
    }
    
    if (!paragraph) {
      console.log('Paragraph not found after header');
      return;
    }
    
    console.log('Found paragraph:', paragraph.textContent.substring(0, 50) + '...');
    
    // Check if animation has already been applied
    if (paragraph.dataset.animated === 'true') {
      console.log('Animation already applied');
      return;
    }
    paragraph.dataset.animated = 'true';
    
    // Store original content
    const originalText = paragraph.textContent;
    
    // Function to create typing effect
    function typeText(element, text, callback) {
      element.textContent = '';
      let index = 0;
      
      function typeChar() {
        if (index < text.length) {
          element.textContent += text[index];
          index++;
          setTimeout(typeChar, 30); // Adjust typing speed here
        } else if (callback) {
          setTimeout(callback, 300);
        }
      }
      
      typeChar();
    }
    
    // Function to animate the paragraph
    function animateParagraph() {
      console.log('Starting paragraph animation...');
      
      // Initial fade out
      paragraph.style.opacity = '0';
      paragraph.style.transition = 'opacity 0.3s';
      
      setTimeout(() => {
        paragraph.style.opacity = '1';
        typeText(paragraph, originalText, function() {
          console.log('Paragraph animation complete');
          
          // After paragraph animation, fade in the diagram boxes
          const uploaderBox = document.querySelector('.uploader-box, .message-box, pre');
          const downloaderBox = document.querySelector('.downloader-box, .consumer-box, pre:nth-of-type(2)');
          
          if (uploaderBox) {
            uploaderBox.style.opacity = '0';
            uploaderBox.style.transform = 'translateX(-20px)';
            uploaderBox.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
              uploaderBox.style.opacity = '1';
              uploaderBox.style.transform = 'translateX(0)';
            }, 500);
          }
          
          if (downloaderBox) {
            downloaderBox.style.opacity = '0';
            downloaderBox.style.transform = 'translateX(20px)';
            downloaderBox.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
              downloaderBox.style.opacity = '1';
              downloaderBox.style.transform = 'translateX(0)';
            }, 800);
          }
        });
      }, 300);
    }
    
    // Check if element is in view
    const rect = paragraph.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      console.log('Element in view, starting animation immediately');
      animateParagraph();
    } else {
      // Create intersection observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log('Element entered view, starting animation');
            animateParagraph();
            observer.disconnect();
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(paragraph);
    }
  });
});
