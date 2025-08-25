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

    // Only owners can add gyms
    if (user.role !== 'OWNER') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only owners can add gyms.' });
    }

    const { name, address, city, state, zip_code, country, phone_number } =
      req.body;

    if (!name) {
      return res.status(400).json({ message: 'Gym name is required' });
    }

    const gym = await prisma.gym.create({
      data: {
        name,
        address,
        city,
        state,
        zip_code,
        country,
        phone_number,
        owner_id: user.id
      }
    });

    return res.status(201).json({ gym, message: 'Gym added successfully' });
  } catch (error) {
    console.error('Error adding gym:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
