import { StatusCodes } from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import validateAPI from '@/lib/validateAPI';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await validateAPI({
      req,
      res,
      sessionRequired: false,
      allowedRoles: [],
      method: 'POST'
    });
    if (session) {
      let user;

      if (req.body.action == 'view') {
        user = await prisma.user.findFirst({
          where: {
            email: req.body.email,
            is_deleted: false,
            id: {
              not: req.body.id
            }
          }
        });
      } else {
        user = await prisma.user.findFirst({
          where: {
            email: req.body.email,
            is_deleted: false
          }
        });
      }
      res.status(StatusCodes.OK);
      res.json(!user);
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ message: 'internal_server_error' });
  }
};

export default handler;
