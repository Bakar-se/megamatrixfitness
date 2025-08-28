import prisma from '@/lib/prisma';
import sendEmail from '@/lib/sendEmail';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const membershipFees = await prisma.membership_fee.findMany({
      where: {
        end_date: {
          lte: new Date()
        },
        is_expired: false,
        notification_sent: false
      },
      include: {
        member: {
          include: {
            user: true
          }
        }
      }
    });
    for (const membershipFee of membershipFees) {
      await sendEmail(
        membershipFee.member.user.email as string,
        'Membership Expiry',
        'Your membership is expiring soon'
      );
      await prisma.membership_fee.update({
        where: { id: membershipFee.id },
        data: {
          notification_sent: true,
          is_expired: true
        }
      });
    }

    res
      .status(200)
      .json({ message: 'Membership fees expired and emails sent' });
  } catch (error) {
    console.error('Error in handleExpiry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
