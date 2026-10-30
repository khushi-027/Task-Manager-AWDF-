import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTACT_FILE = path.resolve(__dirname, '../data/contacts.json');

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Name, Email, Subject, and Message) are required.',
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const contactEntry = {
      id: 'msg_' + Date.now().toString(36),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      receivedAt: new Date().toISOString(),
    };

    // Store in contacts log
    let list = [];
    if (fs.existsSync(CONTACT_FILE)) {
      try {
        list = JSON.parse(fs.readFileSync(CONTACT_FILE, 'utf-8') || '[]');
      } catch (e) {
        list = [];
      }
    }
    list.push(contactEntry);
    fs.writeFileSync(CONTACT_FILE, JSON.stringify(list, null, 2));

    return res.status(200).json({
      success: true,
      message: 'Thank you for reaching out! Your message has been received by our support team.',
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your message. Please try again later.',
    });
  }
};
