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

    // Get user's gyms with their member and equipment counts
    const gyms = await prisma.gym.findMany({
      where: {
        owner_id: session.user.id,
        is_deleted: false
      },
      select: {
        id: true,
        name: true,
        is_active: true,
        members: {
          where: {
            user: { is_active: true, is_deleted: false }
          },
          select: { id: true }
        },
        equipment: {
          where: { is_active: true, is_deleted: false },
          select: { id: true }
        }
      }
    });

    const chartData = gyms.map((gym) => ({
      name: gym.name.length > 10 ? gym.name.substring(0, 10) + '...' : gym.name,
      fullName: gym.name,
      members: gym.members.length,
      equipment: gym.equipment.length,
      active: gym.is_active ? 1 : 0,
      revenue: Math.floor(Math.random() * 10000) + 5000 // Mock revenue data
    }));

    // Calculate pie chart data
    const activeGyms = gyms.filter((gym) => gym.is_active).length;
    const inactiveGyms = gyms.length - activeGyms;

    const pieData = [
      { name: 'Active Gyms', value: activeGyms, color: '#00C49F' },
      { name: 'Inactive Gyms', value: inactiveGyms, color: '#FF8042' }
    ];

    res.status(200).json({
      chartData,
      pieData
    });
  } catch (error) {
    console.error('Error fetching gym stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
