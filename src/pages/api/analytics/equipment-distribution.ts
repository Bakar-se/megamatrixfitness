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

    // Get equipment distribution by type for user's gyms only
    const equipment = await prisma.equipment.findMany({
      where: {
        gym_id: { in: userGymIds },
        is_active: true,
        is_deleted: false
      },
      select: {
        type: true,
        quantity: true,
        gym_id: true,
        gym: {
          select: { name: true }
        }
      }
    });

    // Calculate type distribution
    const typeCount: { [key: string]: number } = {};
    equipment.forEach((eq) => {
      const type = eq.type;
      typeCount[type] = (typeCount[type] || 0) + parseInt(eq.quantity) || 1;
    });

    const equipmentDistribution = Object.entries(typeCount)
      .map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
        value: count,
        type: type
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate gym-wise equipment data
    const gymEquipmentMap: {
      [key: string]: {
        name: string;
        equipment: number;
        fullName: string;
        active: number;
      };
    } = {};

    equipment.forEach((eq) => {
      const gymId = eq.gym_id;
      if (!gymEquipmentMap[gymId]) {
        gymEquipmentMap[gymId] = {
          name:
            eq.gym.name.length > 12
              ? eq.gym.name.substring(0, 12) + '...'
              : eq.gym.name,
          fullName: eq.gym.name,
          equipment: 0,
          active: 1
        };
      }
      gymEquipmentMap[gymId].equipment += parseInt(eq.quantity) || 1;
    });

    const gymEquipmentData = Object.values(gymEquipmentMap).filter(
      (gym) => gym.equipment > 0
    );

    res.status(200).json({
      equipmentDistribution,
      gymEquipmentData
    });
  } catch (error) {
    console.error('Error fetching equipment distribution:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
