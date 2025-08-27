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

    // Only owners can add equipment
    if (user.role !== 'OWNER') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only owners can add equipment.' });
    }

    const { name, type, quantity, weight, gym_id } = req.body;

    // Validate required fields
    if (!name || !type || !quantity || !gym_id) {
      return res.status(400).json({
        message: 'Name, type, quantity, and gym ID are required'
      });
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

    // Check if equipment with same name already exists in this gym
    const existingEquipment = await prisma.equipment.findFirst({
      where: {
        name: name.trim(),
        gym_id: gym_id,
        is_deleted: false
      }
    });

    if (existingEquipment) {
      return res.status(400).json({
        message: 'Equipment with this name already exists in this gym'
      });
    }

    // Create the equipment
    const newEquipment = await prisma.equipment.create({
      data: {
        name: name.trim(),
        type,
        quantity,
        weight: weight || null,
        gym_id: gym_id,
        is_active: true
      },
      include: {
        gym: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return res.status(201).json({
      equipment: newEquipment,
      message: 'Equipment added successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding equipment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
