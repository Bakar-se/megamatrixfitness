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
      where: { id: session.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only owners can fetch equipment
    if (user.role !== 'OWNER') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only owners can view equipment.' });
    }

    const { gym_id } = req.query;

    if (!gym_id || typeof gym_id !== 'string') {
      return res.status(400).json({ message: 'Gym ID is required' });
    }

    // Verify the gym belongs to the user
    const gym = await prisma.gym.findFirst({
      where: {
        id: gym_id,
        owner_id: user.id,
        is_deleted: false
      }
    });

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Fetch equipment with gym details
    const equipment = await prisma.equipment.findMany({
      where: {
        gym_id: gym_id,
        is_deleted: false
      },
      include: {
        gym: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json({
      equipment,
      total: equipment.length,
      message: 'Equipment fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
