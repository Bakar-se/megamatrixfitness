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

    // Only owners can update equipment
    if (user.role !== 'OWNER') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only owners can update equipment.' });
    }

    const { id, name, type, quantity, weight } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Equipment ID is required' });
    }

    // Check if the equipment exists and belongs to a gym owned by the user
    const existingEquipment = await prisma.equipment.findFirst({
      where: {
        id: id,
        gym: {
          owner_id: user.id,
          is_deleted: false
        },
        is_deleted: false
      },
      include: {
        gym: true
      }
    });

    if (!existingEquipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Check if name already exists for another equipment in the same gym
    if (name && name !== existingEquipment.name) {
      const duplicateEquipment = await prisma.equipment.findFirst({
        where: {
          name: name.trim(),
          gym_id: existingEquipment.gym_id,
          id: { not: id },
          is_deleted: false
        }
      });

      if (duplicateEquipment) {
        return res.status(400).json({
          message: 'Equipment with this name already exists in this gym'
        });
      }
    }

    // Update the equipment
    const updatedEquipment = await prisma.equipment.update({
      where: { id: id },
      data: {
        ...(name && { name: name.trim() }),
        ...(type && { type }),
        ...(quantity && { quantity }),
        ...(weight !== undefined && { weight: weight || null })
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

    return res.status(200).json({
      equipment: updatedEquipment,
      message: 'Equipment updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating equipment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
