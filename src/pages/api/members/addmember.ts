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
      gym_id
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

    // Use transaction to create both user and member
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
