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

    const { title, description } = req.body as {
      title: string;
      description?: string;
    };

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description ? String(description) : '',
        user_id: session.user.id
      }
    });

    return res.status(201).json({ todo, message: 'Todo created' });
  } catch (error) {
    console.error('Error adding todo:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
