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
      allowedRoles: ['OWNER', 'MEMBER', 'SUPERADMIN'],
      method: 'POST'
    });

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'ID is required' });

    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo || todo.user_id !== session.user.id)
      return res.status(404).json({ message: 'Todo not found' });

    const deleted = await prisma.todo.update({
      where: { id },
      data: { is_deleted: true }
    });

    return res.status(200).json({ todo: deleted, message: 'Todo deleted' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
