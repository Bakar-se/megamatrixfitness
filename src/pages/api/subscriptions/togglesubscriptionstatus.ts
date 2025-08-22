import prisma from '@/lib/prisma';
import validateAPI from '@/lib/validateAPI';
import { StatusCodes } from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await validateAPI({
      req,
      res,
      sessionRequired: true,
      allowedRoles: ['SUPERADMIN'],
      method: 'POST'
    });
    if (!session) {
      return;
    }

    const subscription = await prisma.subscription.update({
      where: {
        id: req.body.id
      },
      data: {
        is_active: !prisma.subscription.fields.is_active
      }
    });
    if (!subscription) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Subscription not found' });
    }
    res.status(StatusCodes.OK);
    res.json(subscription);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ message: 'Internal server error' });
  }
};
export default handler;
