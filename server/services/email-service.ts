import nodemailer from 'nodemailer';

let testAccount: any = null;
let transporter: any = null;

/**
 * Initialize the email service with Ethereal for testing
 * This creates a disposable test account that captures emails without sending them
 */
export async function initEmailService() {
  // Create a test account if we don't have one
  if (!testAccount) {
    console.log('Creating test email account...');
    testAccount = await nodemailer.createTestAccount();
    
    console.log('Test email account created:');
    console.log(`- Email: ${testAccount.user}`);
    console.log(`- Password: ${testAccount.pass}`);
    console.log(`- SMTP Host: ${testAccount.smtp.host}`);
    
    // Create a nodemailer transporter
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('Email service initialized with Ethereal (test mode)');
  }
  
  return { testAccount, transporter };
}

/**
 * Send a verification email
 * @param to Recipient email address
 * @param token Verification token
 * @param host Host for creating verification URL
 */
export async function sendVerificationEmail(to: string, token: string, host: string): Promise<string> {
  // Make sure we have a transporter
  if (!transporter) {
    await initEmailService();
  }
  
  // Create verification URL
  const verificationUrl = `http://${host}/api/verify-email/${token}`;
  
  // Send email
  const info = await transporter.sendMail({
    from: '"Brandentifier" <verification@brandentifier.com>',
    to,
    subject: 'Verify Your Email Address',
    text: `Please verify your email address by clicking the following link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Verify Your Email Address</h2>
        <p>Welcome to Brandentifier! Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #4f46e5; color: white; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verify Email
        </a>
        <p>If the button doesn't work, you can also click on this link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>Thank you,<br>The Brandentifier Team</p>
      </div>
    `,
  });
  
  console.log('Email verification message sent:', info.messageId);
  
  // Get the URL where the email can be previewed (Ethereal feature)
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('Preview URL:', previewUrl);
    return previewUrl.toString();
  } else {
    console.log('No preview URL available');
    return '';
  }
}

/**
 * Send a notification that email verification was successful
 * @param to Recipient email address
 */
export async function sendWelcomeEmail(to: string): Promise<string> {
  // Make sure we have a transporter
  if (!transporter) {
    await initEmailService();
  }
  
  // Send email
  const info = await transporter.sendMail({
    from: '"Brandentifier" <welcome@brandentifier.com>',
    to,
    subject: 'Welcome to Brandentifier!',
    text: 'Your email has been verified successfully. Welcome to Brandentifier!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to Brandentifier!</h2>
        <p>Your email has been verified successfully.</p>
        <p>You can now log in to your account and start using all the features of Brandentifier.</p>
        <p>Thank you,<br>The Brandentifier Team</p>
      </div>
    `,
  });
  
  console.log('Welcome email message sent:', info.messageId);
  
  // Get the URL where the email can be previewed (Ethereal feature)
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('Preview URL:', previewUrl);
    return previewUrl.toString();
  } else {
    console.log('No preview URL available');
    return '';
  }
}