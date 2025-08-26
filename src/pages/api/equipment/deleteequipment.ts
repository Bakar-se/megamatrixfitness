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

    // Only owners can delete equipment
    if (user.role !== 'OWNER') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only owners can delete equipment.' });
    }

    const { id } = req.body;

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

    // Soft delete the equipment
    const deletedEquipment = await prisma.equipment.update({
      where: { id: id },
      data: {
        is_deleted: true
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
      equipment: deletedEquipment,
      message: 'Equipment deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
