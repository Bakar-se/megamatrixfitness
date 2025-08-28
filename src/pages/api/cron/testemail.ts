import sendEmail from '@/lib/sendEmail';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await sendEmail(
      'kashif31819@gmail.com',
      'Test Email',
      'This is a test email'
    );
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error in testEmail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
