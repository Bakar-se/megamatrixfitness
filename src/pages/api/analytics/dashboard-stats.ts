import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
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

    // Get total counts for user's gyms only
    const [
      totalGyms,
      activeGyms,
      totalMembers,
      totalEquipment,
      activeMemberships
    ] = await Promise.all([
      prisma.gym.count({
        where: {
          owner_id: user.id,
          is_deleted: false
        }
      }),
      prisma.gym.count({
        where: {
          owner_id: user.id,
          is_active: true,
          is_deleted: false
        }
      }),
      prisma.member.count({
        where: {
          gym_id: { in: userGymIds },
          user: { is_active: true, is_deleted: false }
        }
      }),
      prisma.equipment.count({
        where: {
          gym_id: { in: userGymIds },
          is_active: true,
          is_deleted: false
        }
      }),
      prisma.membership_fee.count({
        where: {
          member: {
            gym_id: { in: userGymIds }
          },
          is_active: true,
          is_deleted: false,
          is_expired: false
        }
      })
    ]);

    // Calculate total revenue from active memberships for user's gyms only
    const activeMembershipFees = await prisma.membership_fee.findMany({
      where: {
        member: {
          gym_id: { in: userGymIds }
        },
        is_active: true,
        is_deleted: false,
        is_expired: false
      },
      select: {
        price: true
      }
    });

    const totalRevenue = activeMembershipFees.reduce(
      (sum, fee) => sum + Number(fee.price),
      0
    );

    // Calculate growth rates (mock data for now)
    const gymGrowthRate =
      totalGyms > 0 ? ((activeGyms / totalGyms) * 100).toFixed(1) : '0';
    const memberGrowthRate = '12.5'; // This could be calculated from historical data
    const equipmentGrowthRate = '8.2'; // This could be calculated from historical data
    const revenueGrowthRate = '15.2'; // This could be calculated from historical data

    const stats = {
      totalGyms,
      activeGyms,
      totalMembers,
      totalEquipment,
      totalRevenue,
      activeMemberships,
      growthRates: {
        gym: gymGrowthRate,
        member: memberGrowthRate,
        equipment: equipmentGrowthRate,
        revenue: revenueGrowthRate
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
