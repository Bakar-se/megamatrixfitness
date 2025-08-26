import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone_number: string;
      address: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
      date_of_birth: Date;
      cnic: string | null;
      profile_picture: string | null;
      role: string;
      createdAt: Date;
      updatedAt: Date;
      selected_location_id: string;
    } & {
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    date_of_birth: Date;
    cnic: string | null;
    profile_picture: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    date_of_birth: Date;
    cnic: string | null;
    profile_picture: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }
}
