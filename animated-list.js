// Docsify plugin for animating the file-chunk pipeline features list
window.$docsify = window.$docsify || {};
window.$docsify.plugins = [].concat(window.$docsify.plugins || [], function(hook, vm) {
  hook.doneEach(function() {
    // Check if we're on the overview page or the root with the specific section
    const currentPath = vm.route.path;
    const currentHash = window.location.hash;
    
    console.log('Current path:', currentPath, 'Current hash:', currentHash);
    
    // Run on overview page or when the specific section is in view
    const isOverviewPage = currentPath === '/overview' || 
                          currentPath === '/' || 
                          currentHash.includes('what-does-a-streamsend-file-chunk-pipeline-do');
    
    if (!isOverviewPage) return;
    
    // Find the section by looking for the h2 with the specific text
    const headers = document.querySelectorAll('h2');
    let targetHeader = null;
    
    for (let header of headers) {
      if (header.textContent.includes('What does a Streamsend file-chunk pipeline do?')) {
        targetHeader = header;
        console.log('Found target header:', header);
        break;
      }
    }
    
    if (!targetHeader) {
      console.log('Target header not found');
      return;
    }
    
    // Find the next ul element after the header
    let nextElement = targetHeader.nextElementSibling;
    while (nextElement && nextElement.tagName !== 'UL') {
      nextElement = nextElement.nextElementSibling;
    }
    
    if (!nextElement) {
      console.log('List not found after header');
      return;
    }
    
    const list = nextElement;
    const items = Array.from(list.querySelectorAll('li'));
    
    console.log('Found list with', items.length, 'items');
    
    // Check if animation has already been applied
    if (list.dataset.animated === 'true') {
      console.log('Animation already applied');
      return;
    }
    list.dataset.animated = 'true';
    
    // Store original content
    const originalContent = items.map(item => item.innerHTML);
    
    // Function to create typing effect for a single item
    function typeItem(item, text, callback) {
      item.innerHTML = '';
      let index = 0;
      
      function typeChar() {
        if (index < text.length) {
          // Handle HTML tags - add them instantly
          if (text[index] === '<') {
            const tagEnd = text.indexOf('>', index);
            if (tagEnd !== -1) {
              item.innerHTML += text.substring(index, tagEnd + 1);
              index = tagEnd + 1;
            } else {
              item.innerHTML += text[index];
              index++;
            }
          } else {
            item.innerHTML += text[index];
            index++;
          }
          setTimeout(typeChar, 20); // Adjust typing speed here
        } else if (callback) {
          setTimeout(callback, 300); // Pause between items
        }
      }
      
      typeChar();
    }
    
    // Function to animate all items
    function animateList() {
      console.log('Starting animation...');
      
      // Hide all items initially
      items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
        item.style.transition = 'opacity 0.3s, transform 0.3s';
      });
      
      let currentIndex = 0;
      
      function showNextItem() {
        if (currentIndex < items.length) {
          const item = items[currentIndex];
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
          
          typeItem(item, originalContent[currentIndex], function() {
            currentIndex++;
            showNextItem();
          });
        }
      }
      
      // Start animation after a short delay
      setTimeout(showNextItem, 500);
    }
    
    // Start animation immediately if the element is already in view
    const rect = list.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      console.log('Element in view, starting animation immediately');
      animateList();
    } else {
      // Create intersection observer to trigger animation when in view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            console.log('Element entered view, starting animation');
            animateList();
            observer.disconnect(); // Stop observing after animation starts
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(list);
    }
  });
});
