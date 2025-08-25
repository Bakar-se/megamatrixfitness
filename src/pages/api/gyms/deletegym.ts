import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import validateAPI from '@/lib/validateAPI';

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

    // Only owners can delete gyms
    if (user.role !== 'OWNER') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only owners can delete gyms.' });
    }

    const { id } = req.body;
    console.log(id);
    if (!id) {
      return res.status(400).json({ message: 'Gym ID is required' });
    }

    // Check if the gym exists and belongs to the user
    const existingGym = await prisma.gym.findFirst({
      where: {
        id,
        owner_id: user.id,
        is_deleted: false
      }
    });

    if (!existingGym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Soft delete the gym
    await prisma.gym.update({
      where: { id },
      data: { is_deleted: true }
    });

    return res.status(200).json({ id, message: 'Gym deleted successfully' });
  } catch (error) {
    console.error('Error deleting gym:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
