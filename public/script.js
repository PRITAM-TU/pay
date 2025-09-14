document.addEventListener('DOMContentLoaded', function() {
  // Set today's date as default
  document.getElementById('date').valueAsDate = new Date();
  
  // Toggle screenshot field based on payment method
  const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const screenshotField = document.getElementById('screenshotField');
  
  paymentMethodRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'online') {
        screenshotField.style.display = 'block';
      } else {
        screenshotField.style.display = 'none';
      }
    });
  });
  
  // Refresh button
  document.getElementById('refreshBtn').addEventListener('click', loadPayments);
  
  // Form submission
  const paymentForm = document.getElementById('paymentForm');
  paymentForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
      date: document.getElementById('date').value
    };
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Payment submitted successfully!');
        paymentForm.reset();
        document.getElementById('date').valueAsDate = new Date();
        loadPayments(); // Reload the payments list
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the payment.');
    } finally {
      submitBtn.textContent = 'Submit Payment';
      submitBtn.disabled = false;
    }
  });
  
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', loadPayments);
  
  // Load payments on page load
  loadPayments();
});

async function loadPayments() {
  const paymentsList = document.getElementById('paymentsList');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  
  paymentsList.innerHTML = '<div class="loading">Loading payments...</div>';
  
  try {
    const response = await fetch('/api/payments');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const payments = await response.json();
    
    if (payments.length === 0) {
      paymentsList.innerHTML = '<div class="error">No payments found</div>';
      return;
    }
    
    let filteredPayments = payments;
    if (searchTerm) {
      filteredPayments = payments.filter(payment => 
        payment.name.toLowerCase().includes(searchTerm) || 
        payment.email.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filteredPayments.length === 0) {
      paymentsList.innerHTML = '<div class="error">No matching payments found</div>';
      return;
    }
    
    paymentsList.innerHTML = '';
    
    filteredPayments.forEach(payment => {
      const paymentDate = new Date(payment.date).toLocaleDateString();
      
      const paymentElement = document.createElement('div');
      paymentElement.className = 'payment-item';
      paymentElement.innerHTML = `
        <div class="payment-header">
          <span class="payment-name">${payment.name}</span>
          <span class="payment-date">${paymentDate}</span>
        </div>
        <div class="payment-details">
          <p>Email: ${payment.email}</p>
          <p>Method: <span class="payment-method method-${payment.paymentMethod}">${payment.paymentMethod}</span></p>
        </div>
      `;
      
      paymentsList.appendChild(paymentElement);
    });
  } catch (error) {
    console.error('Error loading payments:', error);
    paymentsList.innerHTML = '<div class="error">Failed to load payments. Please check if the server is running.</div>';
  }
}