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
    if (!session.user.selected_location_id) {
      return res.status(400).json({ message: 'Gym ID is required' });
    }
    const totalEquipment = await prisma.equipment.count({
      where: {
        gym_id: session.user.selected_location_id,
        is_deleted: false
      }
    });
    if (totalEquipment >= session.user.max_equipment) {
      return res
        .status(400)
        .json({ message: 'You have reached the maximum number of equipment' });
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
        owner_id: session.user.id,
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
