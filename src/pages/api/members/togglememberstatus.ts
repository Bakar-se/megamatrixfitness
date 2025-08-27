import prisma from '@/lib/prisma';
import validateAPI from '@/lib/validateAPI';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await validateAPI({
      req,
      res,
      sessionRequired: true,
      allowedRoles: ['OWNER'],
      method: 'POST'
    });

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only owners can toggle member status
    if (user.role !== 'OWNER') {
      return res.status(403).json({
        message: 'Access denied. Only owners can toggle member status.'
      });
    }

    const { id, status } = req.body;

    if (!id || typeof status !== 'boolean') {
      return res
        .status(400)
        .json({ message: 'Member ID and status are required' });
    }

    // Check if the member exists and belongs to a gym owned by the user
    const existingMember = await prisma.member.findFirst({
      where: {
        id: id,
        gym: {
          owner_id: user.id,
          is_deleted: false
        }
      },
      include: {
        user: true,
        gym: true
      }
    });

    if (!existingMember) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Update the user's active status
    const updatedUser = await prisma.user.update({
      where: { id: existingMember.user_id },
      data: {
        is_active: status
      }
    });

    // Get the updated member with user and gym details
    const updatedMember = await prisma.member.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
            address: true,
            city: true,
            state: true,
            zip_code: true,
            country: true,
            date_of_birth: true,
            is_active: true,
            role: true
          }
        },
        gym: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return res.status(200).json({
      member: updatedMember,
      message: `Member ${status ? 'activated' : 'deactivated'} successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error toggling member status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
