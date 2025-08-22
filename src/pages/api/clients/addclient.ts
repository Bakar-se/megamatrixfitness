import { hashPassword } from '@/lib/authHelper';
import { fileSaver } from '@/lib/filesaver';
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
    let next_payment_date = new Date();
    if (req.body.billing_model === 'YEARLY') {
      next_payment_date.setFullYear(next_payment_date.getFullYear() + 1);
    } else {
      next_payment_date.setMonth(next_payment_date.getMonth() + 1);
    }

    const client = await prisma.user.create({
      data: {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zip_code: req.body.zip_code,
        country: req.body.country,
        date_of_birth: new Date(req.body.date_of_birth),
        profile_picture: req.body.profile_picture,
        subscription_id: req.body.subscription_id,
        billing_model: req.body.billing_model,
        role: 'MEMBER',
        cnic: req.body.cnic?.startsWith('data:')
          ? fileSaver(
              req.body.cnic,
              `${process.env.NEXT_PUBLIC_SHARED_IMG_DIR}/documents`
            )
          : req.body.cnic,
        password: await hashPassword(req.body.password),
        next_payment_date: next_payment_date
      }
    });

    res.status(StatusCodes.CREATED);
    res.json({
      ...client
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ message: 'Internal server error' });
  }
};
export default handler;
