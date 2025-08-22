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

    const subscriptions: any = await prisma.subscription.findMany({
      where: {
        is_deleted: false
      },
      include: {
        SubscriptionFeature: {
          include: {
            feature: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    for (const subscription of subscriptions) {
      subscription.SubscriptionFeature = subscription.SubscriptionFeature.map(
        (feature: any) => feature.feature_id
      );
    }

    res.status(StatusCodes.OK);
    res.json(subscriptions);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ message: 'Internal server error' });
  }
};

export default handler;
