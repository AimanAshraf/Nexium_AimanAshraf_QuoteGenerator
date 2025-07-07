document.getElementById('generate-btn').addEventListener('click', async () => {
  const quoteContainer = document.getElementById('quote-container');
  const generateBtn = document.getElementById('generate-btn');
  const keywordInput = document.getElementById('keyword-input');
  const keyword = keywordInput.value.trim();
  
  if (!keyword) {
    quoteContainer.innerHTML = '<div class="quote-box"><p>Please enter a topic first! ✨</p></div>';
    keywordInput.focus();
    return;
  }
  
  generateBtn.disabled = true;
  quoteContainer.innerHTML = '<div class="quote-box"><p>Searching the cosmos for quotes about ' + keyword + '...</p></div>';
  
  createSprinkles();
  
  try {
    const response = await fetch('/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch quotes');
    }
    
    const data = await response.json();
 
    console.log('API Response:', data);
    
    quoteContainer.style.opacity = '0';
    setTimeout(() => {
      if (data.quotes && data.quotes.length > 0) {
        quoteContainer.innerHTML = `
          <div class="quote-box">
            <h3>✨ Quotes about ${keyword} ✨</h3>
            <ol class="quote-list">
              ${data.quotes.map(quote => `<li>"${quote}"</li>`).join('')}
            </ol>
          </div>
        `;
      } else {
        quoteContainer.innerHTML = `
          <div class="quote-box">
            <p>No quotes found about ${keyword}.</p>
            <p>Try a different topic or check back later! ✨</p>
          </div>
        `;
      }
      quoteContainer.style.opacity = '1';
    }, 300);
    
  } catch (error) {
    console.error('Fetch error:', error);
    quoteContainer.innerHTML = `
      <div class="quote-box">
        <p>✨ Cosmic Connection Issue ✨</p>
        <p>${error.message || 'Please try again later'}</p>
      </div>
    `;
    quoteContainer.style.opacity = '1';
  } finally {
    generateBtn.disabled = false;
  }
});
function createSprinkles() {
  const container = document.querySelector('.floating-sprinkles');
  const colors = ['#6c63ff', '#ff6b6b', '#f8f9fa', '#ffd166', '#06d6a0'];
  
  container.innerHTML = '';
  
  for (let i = 0; i < 50; i++) {
    const sprinkle = document.createElement('div');
    sprinkle.classList.add('sprinkle');
    
    sprinkle.style.left = `${Math.random() * 100}%`;
    sprinkle.style.top = `${Math.random() * 100}%`;
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    sprinkle.style.backgroundColor = color;
    
    const duration = 3 + Math.random() * 7;
    const delay = Math.random() * 5;
    sprinkle.style.animation = `twinkle ${duration}s ${delay}s infinite`;
    
    container.appendChild(sprinkle);
  }
  
  for (let i = 0; i < 5; i++) {
    const star = document.createElement('div');
    star.classList.add('sprinkle');
    star.style.width = '3px';
    star.style.height = '3px';
    star.style.borderRadius = '0';
    star.style.transform = 'rotate(45deg)';
    star.style.backgroundColor = '#f8f9fa';
    
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = '-10px';
    
    const duration = 2 + Math.random() * 3;
    star.style.animation = `float ${duration}s linear infinite`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    
    container.appendChild(star);
  }
}

document.getElementById('keyword-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('generate-btn').click();
  }
});

window.addEventListener('load', createSprinkles);
