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
      allowedRoles: ['OWNER'],
      method: 'POST'
    });

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only owners can update members
    if (user.role !== 'OWNER') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only owners can update members.' });
    }

    const {
      id,
      user_id,
      first_name,
      last_name,
      email,
      phone_number,
      address,
      city,
      state,
      zip_code,
      country,
      date_of_birth,
      // Membership fee fields
      membership_price,
      membership_start_date,
      membership_end_date,
      membership_months,
      membership_end_date_type
    } = req.body;

    if (!id || !user_id) {
      return res
        .status(400)
        .json({ message: 'Member ID and User ID are required' });
    }

    // Check if the member exists and belongs to a gym owned by the user
    const existingMember = await prisma.member.findFirst({
      where: {
        id: id,
        user_id: user_id,
        gym: {
          owner_id: user.id,
          is_deleted: false
        }
      },
      include: {
        gym: true
      }
    });

    if (!existingMember) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if email already exists for another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          id: { not: user_id },
          is_deleted: false
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Use transaction to update user, member, and handle membership fee
    const result = await prisma.$transaction(async (tx) => {
      // Update user information
      const updatedUser = await tx.user.update({
        where: { id: user_id },
        data: {
          ...(first_name && { first_name }),
          ...(last_name && { last_name }),
          ...(email && { email: email.toLowerCase() }),
          ...(phone_number && { phone_number }),
          ...(address && { address }),
          ...(city && { city }),
          ...(state && { state }),
          ...(zip_code && { zip_code }),
          ...(country && { country }),
          ...(date_of_birth && { date_of_birth: new Date(date_of_birth) })
        }
      });

      // Handle membership fee if provided
      if (
        membership_price &&
        membership_start_date &&
        membership_end_date_type
      ) {
        let calculatedEndDate: Date;

        if (membership_end_date_type === 'months' && membership_months) {
          // Calculate end date based on months
          const startDate = new Date(membership_start_date);
          calculatedEndDate = new Date(startDate);
          calculatedEndDate.setMonth(
            calculatedEndDate.getMonth() + parseInt(membership_months)
          );
        } else if (
          membership_end_date_type === 'end_date' &&
          membership_end_date
        ) {
          // Use provided end date
          calculatedEndDate = new Date(membership_end_date);
        } else {
          throw new Error('Invalid membership end date configuration');
        }

        // Check if membership fee already exists
        const existingFee = await tx.membership_fee.findFirst({
          where: { member_id: id }
        });

        if (existingFee) {
          // Update existing fee
          await tx.membership_fee.update({
            where: { id: existingFee.id },
            data: {
              price: parseInt(membership_price),
              start_date: new Date(membership_start_date),
              end_date: calculatedEndDate
            }
          });
        } else {
          // Create new fee
          await tx.membership_fee.create({
            data: {
              price: parseInt(membership_price),
              start_date: new Date(membership_start_date),
              end_date: calculatedEndDate,
              member_id: id,
              is_active: true
            }
          });
        }
      }

      // Get the updated member with user and gym details
      const updatedMember = await tx.member.findUnique({
        where: { id: id },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true,
              address: true,
              city: true,
              state: true,
              zip_code: true,
              country: true,
              date_of_birth: true,
              is_active: true,
              role: true
            }
          },
          gym: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return { user: updatedUser, member: updatedMember };
    });

    return res.status(200).json({
      member: result.member,
      message: 'Member updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating member:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
