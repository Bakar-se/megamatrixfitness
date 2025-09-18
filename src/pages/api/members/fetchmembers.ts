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

    // Only owners can fetch members
    if (user.role !== 'OWNER') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only owners can view members.' });
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

    // Fetch members with user, gym, and membership fee details
    const members = await prisma.member.findMany({
      where: {
        gym_id: gym_id,
        user: {
          is_deleted: false,
          role: 'MEMBER'
        }
      },
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
        },
        membership_fee: {
          where: { is_deleted: false },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    return res.status(200).json({
      members,
      total: members.length,
      message: 'Members fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
