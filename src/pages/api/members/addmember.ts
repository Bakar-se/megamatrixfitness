import prisma from '@/lib/prisma';
import validateAPI from '@/lib/validateAPI';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

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

    // Only owners can add members
    if (user.role !== 'OWNER') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only owners can add members.' });
    }

    const {
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
      password,
      gym_id,
      // Membership fee fields
      membership_price,
      membership_start_date,
      membership_end_date,
      membership_months,
      membership_end_date_type
    } = req.body;

    // Validate required fields
    if (
      !first_name ||
      !last_name ||
      !email ||
      !phone_number ||
      !address ||
      !city ||
      !state ||
      !zip_code ||
      !country ||
      !date_of_birth ||
      !password ||
      !gym_id
    ) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    // Verify the gym belongs to the user
    const gym = await prisma.gym.findFirst({
      where: {
        id: gym_id,
        owner_id: user.id,
        is_deleted: false
      }
    });

    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        is_deleted: false
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Use transaction to create user, member, and membership fee
    const result = await prisma.$transaction(async (tx) => {
      // First, create the user
      const newUser = await tx.user.create({
        data: {
          first_name,
          last_name,
          email: email.toLowerCase(),
          phone_number,
          address,
          city,
          state,
          zip_code,
          country,
          date_of_birth: new Date(date_of_birth),
          password: hashedPassword,
          role: 'MEMBER',
          is_active: true
        }
      });

      // Then, create the member record
      const newMember = await tx.member.create({
        data: {
          user_id: newUser.id,
          gym_id: gym_id
        },
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

      // Create membership fee if provided
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

        await tx.membership_fee.create({
          data: {
            price: parseInt(membership_price),
            start_date: new Date(membership_start_date),
            end_date: calculatedEndDate,
            member_id: newMember.id,
            is_active: true
          }
        });
      }

      return { user: newUser, member: newMember };
    });

    return res.status(201).json({
      member: result.member,
      message: 'Member added successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding member:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
