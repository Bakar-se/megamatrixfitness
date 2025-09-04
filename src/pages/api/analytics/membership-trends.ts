import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { subDays, format } from 'date-fns';
import validateAPI from '@/lib/validateAPI';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate session and get user
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

    // Get user's gyms
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { gyms_owned: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userGymIds = user.gyms_owned.map((gym) => gym.id);

    if (userGymIds.length === 0) {
      return res.status(200).json([]);
    }

    const now = new Date();
    const days = 30;
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'MMM dd');

      // Calculate members who joined on or before this date for user's gyms only
      const membersJoinedByDate = await prisma.member.count({
        where: {
          gym_id: { in: userGymIds },
          joinedAt: { lte: date },
          user: { is_active: true, is_deleted: false }
        }
      });

      // Calculate active memberships on this date for user's gyms only
      const activeMemberships = await prisma.membership_fee.count({
        where: {
          member: {
            gym_id: { in: userGymIds }
          },
          is_active: true,
          is_deleted: false,
          start_date: { lte: date },
          end_date: { gte: date }
        }
      });

      // Calculate new memberships started on this date for user's gyms only
      const newMemberships = await prisma.membership_fee.count({
        where: {
          member: {
            gym_id: { in: userGymIds }
          },
          is_active: true,
          is_deleted: false,
          start_date: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() + 1
            )
          }
        }
      });

      trends.push({
        date: dateStr,
        totalMembers: membersJoinedByDate,
        activeMemberships: activeMemberships,
        newMemberships: newMemberships,
        revenue: activeMemberships * 50 // Mock revenue calculation in rupees
      });
    }

    res.status(200).json(trends);
  } catch (error) {
    console.error('Error fetching membership trends:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
