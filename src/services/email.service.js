import transporter from "../config/email.js";

export const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"ShopSphere" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "ShopSphere - Password Reset OTP",
        text: `Your password reset OTP is ${otp}. It is valid for 10 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>ShopSphere Password Reset</h2>
                <p>Your OTP for resetting your password is:</p>
                <h1 style="letter-spacing: 5px;">${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `,
    });
};