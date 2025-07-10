const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: true, // すべてのオリジンを許可（開発環境用）
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const createAdminEmailTemplate = (formData) => {
  return `
    <h2>新しいお問い合わせが届きました</h2>
    
    <h3>お客様情報</h3>
    <table style="border-collapse: collapse; width: 100%;">
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">企業名・団体名</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${formData.company}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">氏名</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${formData.name1} ${formData.name2}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">氏名（かな）</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${formData.kana1} ${formData.kana2}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">メールアドレス</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${formData.email}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">電話番号</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${formData.phone}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">業種</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${formData.industry}</td>
      </tr>
    </table>
    
    <h3>お問い合わせ内容</h3>
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${formData.inquiry}</div>
  `;
};

const createThankYouEmailTemplate = (formData) => {
  return `
    <h2>お問い合わせありがとうございます</h2>
    <p>${formData.name1} ${formData.name2} 様</p>
    
    <p>この度は、お問い合わせいただきありがとうございます。<br>
    以下の内容で承りました。</p>
    
    <h3>お問い合わせ内容</h3>
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${formData.inquiry}</div>
    
    <p>担当者より2-3営業日以内にご連絡いたします。<br>
    しばらくお待ちください。</p>
    
    <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
    
    <hr>
    <p style="font-size: 12px; color: #666;">
      ${process.env.COMPANY_NAME}<br>
      ${process.env.COMPANY_EMAIL}
    </p>
  `;
};

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const {
      company,
      name1,
      name2,
      kana1,
      kana2,
      email,
      phone,
      industry,
      inquiry
    } = req.body;

    // Validation
    if (!company || !name1 || !name2 || !kana1 || !kana2 || !email || !phone || !industry || !inquiry) {
      return res.status(400).json({
        success: false,
        message: '必須項目が入力されていません'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '有効なメールアドレスを入力してください'
      });
    }

    const formData = {
      company,
      name1,
      name2,
      kana1,
      kana2,
      email,
      phone,
      industry,
      inquiry
    };

    const transporter = createTransporter();

    // Send email to admin
    const adminMailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '【新規お問い合わせ】新しいお問い合わせが届きました',
      html: createAdminEmailTemplate(formData)
    };

    await transporter.sendMail(adminMailOptions);
    console.log('Admin email sent successfully');

    // Send thank you email to customer
    const thankYouMailOptions = {
      from: `"${process.env.COMPANY_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '【自動返信】お問い合わせありがとうございます',
      html: createThankYouEmailTemplate(formData)
    };

    await transporter.sendMail(thankYouMailOptions);
    console.log('Thank you email sent successfully');

    res.json({
      success: true,
      message: 'お問い合わせを送信しました'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: 'メール送信に失敗しました。しばらく時間をおいて再度お試しください。'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test email configuration endpoint
app.get('/api/test-email-config', (req, res) => {
  const config = {
    SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
    SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
    SMTP_USER: process.env.SMTP_USER || 'NOT SET',
    SMTP_PASS: process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'NOT SET',
    COMPANY_NAME: process.env.COMPANY_NAME || 'NOT SET',
    COMPANY_EMAIL: process.env.COMPANY_EMAIL || 'NOT SET'
  };
  
  res.json({
    success: true,
    message: 'Email configuration check',
    config: config,
    hasAllRequiredVars: !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS)
  });
});

// Test email sending endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration is incomplete. Please check your .env file.',
        missing: {
          SMTP_HOST: !process.env.SMTP_HOST,
          SMTP_PORT: !process.env.SMTP_PORT,
          SMTP_USER: !process.env.SMTP_USER,
          SMTP_PASS: !process.env.SMTP_PASS
        }
      });
    }

    const transporter = createTransporter();
    
    // Test email
    const testMailOptions = {
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: 'Test Email from Contact Form Backend',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify that your SMTP configuration is working correctly.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    };

    await transporter.sendMail(testMailOptions);
    
    res.json({
      success: true,
      message: 'Test email sent successfully!'
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Handle preflight requests
app.options('/api/contact', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Contact form endpoint: http://localhost:${PORT}/api/contact`);
  console.log(`CORS enabled for all origins (development mode)`);
}); 