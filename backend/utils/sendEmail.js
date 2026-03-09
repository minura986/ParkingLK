import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (options) => {
    try {
        // Create a transporter
        let transporter;

        // For development/testing, Ethereal is often used if no real SMPT is provided.
        // It catches emails and gives you a link to view them.
        if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
            console.log("Using Mock Ethereal Email service...");
            // Generate ethereal auth on the fly if not provided
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
        } else {
            // Production or explicitly configured SMTP
            transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT || 587,
                secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        }

        // Define email options
        const mailOptions = {
            from: `ParkingLK <${process.env.EMAIL_FROM || 'noreply@parkinglk.com'}>`,
            to: options.email,
            subject: options.subject,
            html: options.message, // Assuming HTML messages for richer content
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log(`Email sent: ${info.messageId}`);
        // If using ethereal, log the preview URL
        if (nodemailer.getTestMessageUrl(info)) {
            console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }

        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
