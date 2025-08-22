import prisma from '@/lib/prisma';
import validateAPI from '@/lib/validateAPI';
import { StatusCodes } from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    }
  }
};
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

    await prisma.subscriptionFeature.deleteMany({
      where: {
        subscription_id: req.body.id
      }
    });

    await prisma.subscriptionFeature.createMany({
      data: req.body.SubscriptionFeature.map((feature: any) => ({
        subscription_id: req.body.id,
        feature_id: feature
      }))
    });

    const subscription = await prisma.subscription.update({
      where: {
        id: req.body.id
      },
      data: {
        name: req.body.name,
        monthly_price: req.body.monthly_price,
        yearly_price: req.body.yearly_price,
        max_gyms: req.body.max_gyms,
        max_members: req.body.max_members,
        max_equipment: req.body.max_equipment
      },
      include: {
        SubscriptionFeature: {
          include: {
            feature: true
          }
        }
      }
    });
    subscription.SubscriptionFeature = subscription.SubscriptionFeature.map(
      (feature: any) => feature.feature_id
    );

    if (!subscription) {
      res.status(StatusCodes.NOT_FOUND);
      res.json({ message: 'Subscription not found' });
      return;
    }
    res.status(StatusCodes.CREATED);
    res.json(subscription);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ message: 'Internal server error' });
  }
};
export default handler;
