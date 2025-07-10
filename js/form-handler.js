// Form validation and email functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('RIght-form');
    const submitButton = form.querySelector('input[type="submit"]');
    
    // API endpoint configuration
    const API_BASE_URL = 'http://23.27.52.30:3000/api';
    
    // Form validation function
    function validateForm() {
        const errors = [];
        
        // Company name validation
        const company = document.getElementById('company').value.trim();
        if (!company) {
            errors.push('企業名・団体名は必須です');
        }
        
        // Name validation
        const name1 = document.getElementById('name1').value.trim();
        const name2 = document.getElementById('name2').value.trim();
        if (!name1 || !name2) {
            errors.push('氏名は必須です');
        }
        
        // Kana validation
        const kana1 = document.getElementById('kana1').value.trim();
        const kana2 = document.getElementById('kana2').value.trim();
        if (!kana1 || !kana2) {
            errors.push('氏名（かな）は必須です');
        }
        
        // Email validation
        const email = document.getElementById('e-mail').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.push('メールアドレスは必須です');
        } else if (!emailRegex.test(email)) {
            errors.push('有効なメールアドレスを入力してください');
        }
        
        // Phone validation
        const phone = document.getElementById('tel').value.trim();
        if (!phone) {
            errors.push('電話番号は必須です');
        } else {
            // Check for numeric characters only (including hyphens, parentheses, and spaces)
            const phoneRegex = /^[0-9\-\(\)\s]+$/;
            if (!phoneRegex.test(phone)) {
                errors.push('電話番号は半角数字、ハイフン、括弧、スペースのみ入力可能です');
            }
        }
        
        // Industry validation
        const industry = document.getElementById('industry').value;
        if (!industry) {
            errors.push('業種を選択してください');
        }
        
        // Inquiry validation
        const inquiry = document.getElementById('toiawase').value.trim();
        if (!inquiry) {
            errors.push('お問い合わせ詳細は必須です');
        }
        
        // Privacy policy validation
        const privacy = document.getElementById('jyoho').checked;
        if (!privacy) {
            errors.push('個人情報の取り扱いに同意してください');
        }
        
        return errors;
    }
    
    // Display error messages
    function showErrors(errors) {
        // Clear previous errors
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        // Show new errors
        if (errors.length > 0) {
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-container';
            errorContainer.style.cssText = 'background-color: #ffebee; color: #c62828; padding: 10px; margin: 10px 0; border-radius: 4px; border: 1px solid #ef5350;';
            
            const errorList = document.createElement('ul');
            errorList.style.cssText = 'margin: 0; padding-left: 20px;';
            
            errors.forEach(error => {
                const li = document.createElement('li');
                li.textContent = error;
                errorList.appendChild(li);
            });
            
            errorContainer.appendChild(errorList);
            form.insertBefore(errorContainer, form.firstChild);
            
            // Scroll to top of form
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // Clear error messages
    function clearErrors() {
        const existingErrors = document.querySelectorAll('.error-message, .error-container');
        existingErrors.forEach(error => error.remove());
    }
    
    // Show loading state
    function showLoading() {
        submitButton.value = '送信中...';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';
    }
    
    // Hide loading state
    function hideLoading() {
        submitButton.value = '送信する';
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
    }
    
    // Send form data to backend API
    async function sendFormData(formData) {
        try {
            console.log('Sending request to:', `${API_BASE_URL}/contact`);
            console.log('Request data:', formData);
            
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            const result = await response.json();
            console.log('Response data:', result);
            
            if (!response.ok) {
                throw new Error(result.message || '送信に失敗しました');
            }
            
            return result;
        } catch (error) {
            console.error('API request failed:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('サーバーに接続できません。バックエンドサーバーが起動しているか確認してください。');
            }
            throw error;
        }
    }
    
    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous errors
        clearErrors();
        
        // Validate form
        const errors = validateForm();
        if (errors.length > 0) {
            showErrors(errors);
            return;
        }
        
        // Show loading state
        showLoading();
        
        try {
            // Collect form data
            const formData = {
                company: document.getElementById('company').value.trim(),
                name1: document.getElementById('name1').value.trim(),
                name2: document.getElementById('name2').value.trim(),
                kana1: document.getElementById('kana1').value.trim(),
                kana2: document.getElementById('kana2').value.trim(),
                email: document.getElementById('e-mail').value.trim(),
                phone: document.getElementById('tel').value.trim(),
                industry: document.getElementById('industry').value,
                inquiry: document.getElementById('toiawase').value.trim()
            };
            
            console.log('Form data collected:', formData);
            
            // Send form data to backend
            const result = await sendFormData(formData);
            
            console.log('Form submitted successfully:', result);
            
            // Redirect to thank you page
            window.location.href = 'thanks.html';
            
        } catch (error) {
            console.error('Form submission failed:', error);
            showErrors([error.message || 'メール送信に失敗しました。しばらく時間をおいて再度お試しください。']);
            hideLoading();
        }
    });
    
    // Phone number input filtering (keep this for real-time character filtering)
    const phoneInput = document.getElementById('tel');
    phoneInput.addEventListener('input', function(e) {
        // Remove any characters that are not numeric, hyphens, parentheses, or spaces
        const filteredValue = e.target.value.replace(/[^0-9\-\(\)\s]/g, '');
        e.target.value = filteredValue;
    });
}); 