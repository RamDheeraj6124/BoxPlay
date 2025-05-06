const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Booking=require('../models/Booking');
const Query=require('../models/Query');
const dns = require('dns');

const validateEmailDomain = async (email) => {
    try {
        // Validate email format
        if (!email || !email.includes('@')) {
            throw new Error('Invalid email format');
        }

        const domain = email.split('@')[1];
        if (!domain) {
            throw new Error('Invalid email format');
        }

        // Check MX records
        const mxRecords = await new Promise((resolve, reject) => {
            dns.resolveMx(domain, (err, addresses) => {
                if (err) {
                    return reject(err);
                }
                resolve(addresses);
            });
        });

        return mxRecords && mxRecords.length > 0;
    } catch (error) {
        console.error('Domain validation error:', error);
        return false;
    }
};

// Set up nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'kunisettyramdheeraj061204@gmail.com', 
        pass: 'vqor kogf cure rbhb' 
    }
});

// Send OTP
exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.otp = otp;
        user.otpExpiration = otpExpiration;
        await user.save();

        const mailOptions = {
            from: 'kunisettyramdheeraj061204@gmail.com',
            to: email,
            subject: 'Forget Password - One Time Password',
            html: `
            <div style="max-width: 500px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; text-align: center;">
                <h2 style="color: #333;">Otp</h2>
                <p>Hi User</p>
                <p>Here is the Otp to reset your password:</p>
                <p style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</p>
                <p>If you have not requested this, please ignore this message.</p>
                <p style="font-size: 12px; color: #777;">- BoxPlay Team</p>
                <p style="font-size: 10px; color: #aaa;">This is a system-generated message. Please do not reply.</p>
            </div>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Error sending OTP' });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).json({ message: 'OTP sent successfully' });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// OTP Login
exports.loginOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.otp) {
            return res.status(401).json({ message: 'OTP already used or expired' });
        }

        if (user.otp !== otp) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        const currentTime = new Date();
        if (currentTime > user.otpExpiration) {
            user.otp = '';
            await user.save();
            return res.status(401).json({ message: 'OTP expired' });
        }

        user.otp = ''; // Clear OTP after successful login
        await user.save();

        // Respond with user details, token, or redirect path
        return res.status(200).json({ message: 'Login successful', role: user.role, username: user.username, email: user.email });
    } catch (err) {
        console.error('Error: ', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.otp) {
            return res.status(401).json({ message: 'OTP already used or expired' });
        }

        if (user.otp !== otp) {
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        const currentTime = new Date();
        if (currentTime > user.otpExpiration) {
            user.otp = ''; 
            await user.save();
            return res.status(401).json({ message: 'OTP expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = ''; // Clear OTP after password reset
        await user.save();

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Signup Controller
//query optimization
exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);
    try {
        if(await validateEmailDomain(email)){
        let user = await User.findOne({ email }).select('_id').exec();
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            username,
            email,
            password: hashedPassword,
        });
        await user.save();
        res.status(200).json({ msg: 'Signup Successful' });
    }else{
        console.log('invalid email address provided')
        return res.status(404).json({ msg: 'invalid email address provided'});
    }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Login Controller
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userfound = await User.findOne({ email }).exec();
        if (!userfound) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, userfound.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        req.session.user = userfound; // Storing user in the session
        console.log('Session ID:', req.sessionID);
        console.log('Session created:', req.session.user);

        res.status(200).json({ msg: 'Login Successful',role:userfound.role });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Check Session Controller
exports.checksession = (req, res) => {

    if (req.session.user) {
        const user=req.session.user;    
        res.status(200).json({user});
    } else {
        res.status(400).json({ msg: "Session does not exist" });
    }
};
exports.userbookings=async (req,res)=>{
    const user = req.session.user;
    try{
        const bookings=await Booking.find({user:user._id}).populate('shop');
        res.status(200).json({bookings});
    }catch(err){
        console.error(err.message);
    }
};
// Update user contact
exports.updatecontact = async (req, res) => {
    const { contact } = req.body;

    // Check if user session exists
    if (!req.session || !req.session.user) {
        return res.status(404).json({ message: 'User not found or session expired' });
    }

    const userId = req.session.user._id;

    if (!contact) {
        return res.status(400).json({ message: 'Contact is required' });
    }

    try {
        // Update the user's contact
        const updatedUser = await User.findByIdAndUpdate(userId, { contact }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update session with new contact
        req.session.user = updatedUser;

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error('Error updating contact:', err.message);
        res.status(500).json({ message: 'Failed to update contact' });
    }
};
exports.logout=async (req,res)=>{
    if (req.session && req.session.user) {
        // Destroy the session
        req.session.destroy(err => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ message: 'Failed to log out' });
            }
            // Clear the cookie

            return res.status(200).json({ message: 'Logged out successfully' });
        });
    } else {
        return res.status(400).json({ message: 'No active session to log out from' });
    }
}

exports.submitfeedback = async (req, res) => {
    const { bookingId, rating, review } = req.body;
    console.log(req.body)
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Update feedback fields
        booking.feedback = {
            rating,
            review,
            feedbackDate: new Date()
        };

        await booking.save();
        console.log(booking);
        res.status(200).json({ message: 'Feedback submitted successfully', booking });
    } catch (err) {
        console.error('Error submitting feedback:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.submitquery=async (req,res)=>{
    console.log('hi')
    const {name,email,mobile,message}=req.body;
    console.log(req.body)
    try{
    userquery=new Query({ 
        name,email,mobile,message
    });
    await userquery.save();
    res.status(200).json({"message":"Query saved successfully"})
    }catch(err){
        console.log(err);
    }
}

