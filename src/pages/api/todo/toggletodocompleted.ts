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

    const { id, completed } = req.body as { id: string; completed: boolean };
    if (!id || typeof completed !== 'boolean')
      return res.status(400).json({ message: 'Invalid payload' });

    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo || todo.user_id !== session.user.id)
      return res.status(404).json({ message: 'Todo not found' });

    const updated = await prisma.todo.update({
      where: { id },
      data: { is_completed: completed }
    });

    return res
      .status(200)
      .json({ todo: updated, message: 'Todo status updated' });
  } catch (error) {
    console.error('Error toggling todo:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
