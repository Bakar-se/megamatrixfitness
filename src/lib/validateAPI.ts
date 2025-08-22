import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { StatusCodes } from 'http-status-codes';
import { options } from '@/pages/api/auth/[...nextauth]';

const validateAPI = async ({
  req,
  res,
  sessionRequired,
  allowedRoles,
  method
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  sessionRequired: boolean;
  allowedRoles: string[];
  method: 'GET' | 'PUT' | 'POST' | 'DELETE';
}) => {
  let session: any = await getServerSession(req, res, options as any);

  if (req.method === method && !sessionRequired) {
    return true;
  } else if (req.method !== method) {
    res.status(StatusCodes.METHOD_NOT_ALLOWED);
    res.json({ message: 'Method not allowed' });
  } else if (sessionRequired && !session) {
    res.status(StatusCodes.BAD_REQUEST);
    res.json({ message: 'Session is required' });
  } else if (
    sessionRequired &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(session.user.role)
  ) {
    res.status(StatusCodes.FORBIDDEN);
    res.json({ message: 'You are not authorized to access this resource' });
  }

  return session;
};

export default validateAPI;
