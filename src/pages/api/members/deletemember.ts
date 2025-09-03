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

    // Only owners can delete members
    if (user.role !== 'OWNER') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only owners can delete members.' });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Member ID is required' });
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

    // Use transaction to soft delete both member and user
    const result = await prisma.$transaction(async (tx: any) => {
      // Soft delete the member

      // Soft delete the user
      const deletedUser = await tx.user.update({
        where: { id: existingMember.user_id },
        data: {
          is_deleted: true
        }
      });
    });

    return res.status(200).json({
      member: { ...existingMember, id: id },
      message: 'Member deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
