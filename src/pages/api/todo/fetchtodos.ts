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
      method: 'GET'
    });

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const todos = await prisma.todo.findMany({
      where: { user_id: session.user.id, is_deleted: false },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ todos, total: todos.length });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
