export const OTP_EMAIL_TEMPLATE = (otp: string, expirationMinutes: number) => ({
    subject: 'Your Uber Verification Code',
    text: `Your Uber verification code is ${otp}. This code will expire in ${expirationMinutes} minutes.`,
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Uber Verification Code</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 2px solid #f4f4f4;
                }
                .logo {
                    max-width: 120px;
                    height: auto;
                }
                .content {
                    padding: 30px 20px;
                    text-align: center;
                }
                .otp-code {
                    font-size: 32px;
                    font-weight: bold;
                    color: #000000;
                    letter-spacing: 4px;
                    padding: 20px;
                    background-color: #f8f8f8;
                    border-radius: 8px;
                    margin: 20px 0;
                    display: inline-block;
                }
                .expiry {
                    color: #666;
                    font-size: 14px;
                    margin: 15px 0;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #666;
                    font-size: 12px;
                    border-top: 2px solid #f4f4f4;
                }
                .warning {
                    color: #ff6b6b;
                    font-size: 12px;
                    margin-top: 20px;
                    padding: 10px;
                    background-color: #fff5f5;
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://uber-assets-image.s3-us-west-1.amazonaws.com/logo.png" alt="Uber Logo" class="logo">
                </div>
                <div class="content">
                    <h2>Verify Your Account</h2>
                    <p>Please use the following verification code to complete your account verification:</p>
                    <div class="otp-code">${otp}</div>
                    <p class="expiry">This code will expire in ${expirationMinutes} minutes</p>
                    <div class="warning">
                        If you didn't request this code, please ignore this email or contact support if you have concerns.
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                    <p>© ${new Date().getFullYear()} Uber Technologies Inc.</p>
                </div>
            </div>
        </body>
        </html>
    `
});