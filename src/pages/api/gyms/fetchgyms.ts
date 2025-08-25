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
      method: 'GET'
    });

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { gyms_owned: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only owners can fetch gyms
    if (user.role !== 'OWNER') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only owners can view gyms.' });
    }

    const gyms = await prisma.gym.findMany({
      where: {
        owner_id: user.id,
        is_deleted: false
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ gyms });
  } catch (error) {
    console.error('Error fetching gyms:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
