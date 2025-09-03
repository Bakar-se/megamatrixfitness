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

    if (!session) return;

    const { name, address, city, state, zip_code, country, phone_number } =
      req.body;

    if (!name) {
      return res.status(400).json({ message: 'Gym name is required' });
    }
    const totalGyms = await prisma.gym.count({
      where: {
        owner_id: session.user.id,
        is_deleted: false
      }
    });
    if (totalGyms >= session.user.max_gyms) {
      return res
        .status(400)
        .json({ message: 'You have reached the maximum number of gyms' });
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
        owner_id: session.user.id
      }
    });

    return res.status(201).json({ gym, message: 'Gym added successfully' });
  } catch (error) {
    console.error('Error adding gym:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
