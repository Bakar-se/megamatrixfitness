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

    const subscription = await prisma.subscription.create({
      data: {
        name: req.body.name,
        monthly_price: req.body.monthly_price,
        yearly_price: req.body.yearly_price,
        max_gyms: req.body.max_gyms,
        max_members: req.body.max_members,
        max_equipment: req.body.max_equipment
      }
    });

    await prisma.subscriptionFeature.createMany({
      data: req.body.SubscriptionFeature.map((feature: any) => ({
        subscription_id: subscription.id,
        feature_id: feature
      }))
    });

    const subscriptionFeatures = await prisma.subscriptionFeature.findMany({
      where: {
        subscription_id: subscription.id
      }
    });

    if (!subscription) {
      res.status(StatusCodes.NOT_FOUND);
      res.json({ message: 'Subscription not found' });
      return;
    }
    res.status(StatusCodes.CREATED);
    res.json({
      ...subscription,
      SubscriptionFeature: subscriptionFeatures.map(
        (feature: any) => feature.feature_id
      )
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ message: 'Internal server error' });
  }
};
export default handler;
