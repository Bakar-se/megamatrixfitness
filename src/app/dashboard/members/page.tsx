'use client';
import { useSession } from 'next-auth/react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '@/store/Store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertModal } from '@/components/shared/AlertModal';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import * as yup from 'yup';
import { useFormik } from 'formik';
import {
  addMember,
  fetchMembers,
  toggleMemberStatus,
  updateMember,
  deleteMember
} from '@/store/MemberSlice';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CustomTooltip } from '@/components/shared/CustomTooltip';
import { IconEdit, IconPlus, IconPower, IconTrash } from '@tabler/icons-react';
import PageContainer from '@/components/layout/page-container';
import Loader from '@/components/shared/Loader';
import { toast } from 'sonner';
import { OwnerOnly } from '@/components/permission-guard';
const Page = () => {
  const { data: session, status }: any = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated' || (status !== 'loading' && !session)) {
      router.push('/auth/signin');
    }
  }, [status, session]);

  return (
    <>
      {session && (
        <Suspense>
          <OwnerOnly
            fallback={
              <div className='p-8 text-center'>
                Access Denied. Only Owners can access this page.
              </div>
            }
          >
            <MemberListing session={session} />
          </OwnerOnly>
        </Suspense>
      )}
    </>
  );
};

export default Page;

interface MemberListingProps {
  session: any;
}

const MemberListing: React.FC<MemberListingProps> = ({ session }) => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.members);
  // Get the selected gym ID from session or use the first available gym
  const selectedGymId = session?.user?.selected_location_id || '';

  const [alertState, setAlertState] = useState({
    open: false,
    title: '',
    description: '',
    cancelText: '',
    confirmText: '',
    onConfirm: () => {},
    onClose: () => {},
    type: 'info' as 'info' | 'danger' | 'warning' | 'success'
  });

  const validationSchema = yup.object({
    first_name: yup.string().required('First name is required'),
    last_name: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    phone_number: yup.string().required('Phone is required'),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zip_code: yup.string().required('Zip is required'),
    country: yup.string().required('Country is required'),
    password: yup.string().when('action', {
      is: 'create',
      then: (schema) => schema.required('Password is required'),
      otherwise: (schema) => schema.optional()
    }),
    date_of_birth: yup
      .date()
      .required('Date of birth is required')
      .max(new Date(), 'Date of birth must be in the past')
  });

  const formik = useFormik({
    initialValues: {
      id: '',
      user_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      action: 'create',
      open: false,
      password: '',
      date_of_birth: '',
      gym_id: session?.user?.selected_location_id,
      // Membership fee fields
      membership_price: '',
      membership_start_date: '',
      membership_end_date: '',
      membership_months: '',
      membership_end_date_type: 'months'
    },
    validationSchema: validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      console.log(values);
      try {
        if (!session?.user?.selected_location_id) {
          toast.error('Please select a gym first');
          return;
        }

        if (values.action === 'create') {
          const result = await dispatch(
            addMember({
              ...values,
              gym_id: selectedGymId,
              // Include membership fee fields if provided
              ...(values.membership_price && {
                membership_price: values.membership_price,
                membership_start_date: values.membership_start_date,
                membership_end_date: values.membership_end_date,
                membership_months: values.membership_months,
                membership_end_date_type: values.membership_end_date_type
              })
            })
          );
          if (addMember.fulfilled.match(result)) {
            toast.success('Member added successfully!');
            formik.resetForm();
            formik.setValues({
              ...formik.initialValues,
              open: false
            });
            // Refresh the members list
            dispatch(fetchMembers(selectedGymId));
          } else if (addMember.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to add member';
            toast.error(errorMessage);
          }
        } else {
          const result = await dispatch(
            updateMember({
              ...values,
              // Include membership fee fields if provided
              ...(values.membership_price && {
                membership_price: values.membership_price,
                membership_start_date: values.membership_start_date,
                membership_end_date: values.membership_end_date,
                membership_months: values.membership_months,
                membership_end_date_type: values.membership_end_date_type
              })
            })
          );
          if (updateMember.fulfilled.match(result)) {
            toast.success('Member updated successfully!');
            formik.resetForm();
            formik.setValues({
              ...formik.initialValues,
              open: false
            });
            // Refresh the members list
            dispatch(fetchMembers(selectedGymId));
          } else if (updateMember.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to update member';
            toast.error(errorMessage);
          }
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Form submission error:', error);
      }
    }
  });

  useEffect(() => {
    if (selectedGymId) {
      dispatch(fetchMembers(selectedGymId));
    }
  }, [dispatch, selectedGymId]);

  // Update gym_id when selectedGymId changes
  useEffect(() => {
    formik.setFieldValue('gym_id', selectedGymId);
  }, [selectedGymId]);

  if (!selectedGymId) {
    return (
      <PageContainer>
        <div className='p-8 text-center'>
          <p className='text-muted-foreground text-lg'>
            Please select a gym from the sidebar to view and manage members.
          </p>
        </div>
      </PageContainer>
    );
  }
  console.log(formik.errors);
  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Members</h3>
          <Button
            onClick={() => {
              formik.setValues({
                ...formik.values,
                action: 'create',
                open: true
              });
            }}
          >
            <IconPlus className='mr-2 h-4 w-4' />
            New Member
          </Button>
        </div>
        <Card>
          <CardContent>
            {loading ? (
              <div className='flex items-center justify-center py-12'>
                <Loader isLoading={loading} size={32} />
              </div>
            ) : (
              <div className='max-h-[55vh] overflow-y-auto'>
                <Table className='w-full'>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined Date</TableHead>
                      <TableHead>Membership Status</TableHead>
                      <TableHead>Membership Expiry</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          {member.user.first_name} {member.user.last_name}
                        </TableCell>
                        <TableCell className=''>
                          <div className='flex flex-col gap-2'>
                            <Badge
                              variant={
                                member.user.is_active ? 'default' : 'outline'
                              }
                              className={
                                member.user.is_active
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-destructive'
                              }
                            >
                              {member.user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className=''>{member.user.email}</TableCell>
                        <TableCell className=''>
                          +{member.user.phone_number}
                        </TableCell>
                        <TableCell className=''>
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {member.memberShipFees &&
                          member.memberShipFees.length > 0 ? (
                            <Badge
                              variant={
                                member.memberShipFees[0].is_active
                                  ? 'default'
                                  : 'outline'
                              }
                              className={
                                member.memberShipFees[0].is_active
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-destructive'
                              }
                            >
                              {member.memberShipFees[0].is_active
                                ? 'Active'
                                : 'Inactive'}
                            </Badge>
                          ) : (
                            <Badge
                              variant='outline'
                              className='text-muted-foreground'
                            >
                              No Membership
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.memberShipFees &&
                          member.memberShipFees.length > 0
                            ? new Date(
                                member.memberShipFees[0].end_date
                              ).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className=''>
                          <div className='flex justify-end gap-2'>
                            <CustomTooltip
                              trigger={
                                <Button
                                  variant='outline'
                                  size='icon'
                                  onClick={() => {
                                    const membershipFee =
                                      member.memberShipFees &&
                                      member.memberShipFees.length > 0
                                        ? member.memberShipFees[0]
                                        : null;

                                    formik.setValues({
                                      ...formik.values,
                                      id: member.id,
                                      user_id: member.user_id,
                                      first_name: member.user.first_name,
                                      last_name: member.user.last_name,
                                      email: member.user.email,
                                      phone_number: member.user.phone_number,
                                      address: member.user.address,
                                      city: member.user.city,
                                      state: member.user.state,
                                      zip_code: member.user.zip_code,
                                      country: member.user.country,
                                      date_of_birth: member.user.date_of_birth
                                        ? new Date(member.user.date_of_birth)
                                            .toISOString()
                                            .split('T')[0]
                                        : '',
                                      // Membership fee fields
                                      membership_price: membershipFee
                                        ? membershipFee.price.toString()
                                        : '',
                                      membership_start_date: membershipFee
                                        ? new Date(membershipFee.start_date)
                                            .toISOString()
                                            .split('T')[0]
                                        : '',
                                      membership_end_date: membershipFee
                                        ? new Date(membershipFee.end_date)
                                            .toISOString()
                                            .split('T')[0]
                                        : '',
                                      membership_months: '',
                                      membership_end_date_type: 'months',
                                      action: 'update',
                                      open: true
                                    });
                                  }}
                                >
                                  <IconEdit />
                                </Button>
                              }
                              content={'Edit'}
                            />

                            <CustomTooltip
                              trigger={
                                <Button
                                  variant='outline'
                                  size='icon'
                                  onClick={() =>
                                    setAlertState({
                                      open: true,
                                      title: member.user.is_active
                                        ? 'Deactivate'
                                        : 'Activate',
                                      description: member.user.is_active
                                        ? 'Are you sure you want to deactivate this member?'
                                        : 'Are you sure you want to activate this member?',
                                      cancelText: 'Cancel',
                                      confirmText: member.user.is_active
                                        ? 'Deactivate'
                                        : 'Activate',
                                      onConfirm: async () => {
                                        try {
                                          const result = await dispatch(
                                            toggleMemberStatus({
                                              id: member.id,
                                              status: !member.user.is_active
                                            })
                                          );
                                          if (
                                            toggleMemberStatus.fulfilled.match(
                                              result
                                            )
                                          ) {
                                            toast.success(
                                              `Member ${!member.user.is_active ? 'activated' : 'deactivated'} successfully!`
                                            );
                                            // Refresh the members list
                                            dispatch(
                                              fetchMembers(selectedGymId)
                                            );
                                          } else if (
                                            toggleMemberStatus.rejected.match(
                                              result
                                            )
                                          ) {
                                            const errorMessage =
                                              result.payload &&
                                              typeof result.payload ===
                                                'object' &&
                                              'message' in result.payload
                                                ? (
                                                    result.payload as {
                                                      message: string;
                                                    }
                                                  ).message
                                                : 'Failed to update member status';
                                            toast.error(errorMessage);
                                          }
                                        } catch (error) {
                                          toast.error(
                                            'An unexpected error occurred'
                                          );
                                          console.error(
                                            'Toggle status error:',
                                            error
                                          );
                                        }
                                      },
                                      onClose: () => {
                                        setAlertState({
                                          ...alertState,
                                          open: false
                                        });
                                      },
                                      type: 'danger'
                                    })
                                  }
                                >
                                  <IconPower
                                    className={
                                      member.user.is_active
                                        ? 'text-primary'
                                        : 'text-destructive'
                                    }
                                  />
                                </Button>
                              }
                              content={
                                member.user.is_active
                                  ? 'Deactivate'
                                  : 'Activate'
                              }
                            />
                            <CustomTooltip
                              trigger={
                                <Button
                                  variant='outline'
                                  size='icon'
                                  onClick={() =>
                                    setAlertState({
                                      open: true,
                                      title: 'Delete Member',
                                      description:
                                        'Are you sure you want to delete this member? This action cannot be undone.',
                                      cancelText: 'Cancel',
                                      confirmText: 'Delete',
                                      onConfirm: async () => {
                                        try {
                                          const result = await dispatch(
                                            deleteMember(member.id)
                                          );
                                          if (
                                            deleteMember.fulfilled.match(result)
                                          ) {
                                            toast.success(
                                              'Member deleted successfully!'
                                            );
                                            // Refresh the members list
                                            dispatch(
                                              fetchMembers(selectedGymId)
                                            );
                                          } else if (
                                            deleteMember.rejected.match(result)
                                          ) {
                                            const errorMessage =
                                              result.payload &&
                                              typeof result.payload ===
                                                'object' &&
                                              'message' in result.payload
                                                ? (
                                                    result.payload as {
                                                      message: string;
                                                    }
                                                  ).message
                                                : 'Failed to delete member';
                                            toast.error(errorMessage);
                                          }
                                        } catch (error) {
                                          toast.error(
                                            'An unexpected error occurred'
                                          );
                                          console.error(
                                            'Delete member error:',
                                            error
                                          );
                                        }
                                      },
                                      onClose: () => {
                                        setAlertState({
                                          ...alertState,
                                          open: false
                                        });
                                      },
                                      type: 'danger'
                                    })
                                  }
                                >
                                  <IconTrash />
                                </Button>
                              }
                              content={'Delete'}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertModal {...alertState} />

        <Dialog
          open={formik.values.open}
          onOpenChange={() => {
            formik.resetForm();
          }}
        >
          <form onSubmit={formik.handleSubmit} className='space-y-4'>
            <DialogContent className='sm:max-w-xl'>
              <DialogHeader>
                <DialogTitle>
                  {formik.values.action === 'create'
                    ? 'Add Member'
                    : 'Update Member'}
                </DialogTitle>
              </DialogHeader>
              <div className='space-y-2'>
                <Label htmlFor='first_name'>First Name</Label>
                <Input
                  id='first_name'
                  name='first_name'
                  placeholder='First Name'
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.first_name && formik.errors.first_name
                  )}
                  helperText={formik.errors.first_name as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='last_name'>Last Name</Label>
                <Input
                  id='last_name'
                  name='last_name'
                  placeholder='Last Name'
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.last_name && formik.errors.last_name
                  )}
                  helperText={formik.errors.last_name as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='date_of_birth'>Date of Birth</Label>
                <Input
                  type='date'
                  id='date_of_birth'
                  name='date_of_birth'
                  placeholder='Date of Birth'
                  value={formik.values.date_of_birth}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.date_of_birth && formik.errors.date_of_birth
                  )}
                  helperText={formik.errors.date_of_birth as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  type='email'
                  id='email'
                  name='email'
                  placeholder='Email'
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.email && formik.errors.email)}
                  helperText={formik.errors.email as string}
                />
              </div>
              {formik.values.action === 'create' && (
                <div className='space-y-2'>
                  <Label htmlFor='password'>Password</Label>
                  <Input
                    type='password'
                    id='password'
                    name='password'
                    placeholder='Password'
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      formik.touched.password && formik.errors.password
                    )}
                    helperText={formik.errors.password as string}
                  />
                </div>
              )}
              <div>
                <PhoneInput
                  country='pk'
                  inputStyle={{
                    ...(formik.touched.phone_number &&
                      formik.errors.phone_number && {
                        borderColor: 'red'
                      }),
                    width: '100%'
                  }}
                  buttonStyle={{
                    ...(formik.touched.phone_number &&
                      formik.errors.phone_number && {
                        borderColor: 'red'
                      })
                  }}
                  placeholder='Phone Number'
                  value={formik.values.phone_number}
                  onChange={(value) => {
                    formik.setFieldValue('phone_number', value);
                  }}
                  onBlur={() => {
                    formik.setFieldTouched('phone_number', true);
                  }}
                />
                {formik.errors.phone_number && formik.touched.phone_number && (
                  <p className='text-destructive mt-1 text-sm'>
                    {formik.errors.phone_number as string}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='address'>Address</Label>
                <Input
                  id='address'
                  name='address'
                  placeholder='Address'
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.address && formik.errors.address
                  )}
                  helperText={formik.errors.address as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='city'>City</Label>
                <Input
                  id='city'
                  name='city'
                  placeholder='City'
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.city && formik.errors.city)}
                  helperText={formik.errors.city as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='state'>State</Label>
                <Input
                  id='state'
                  name='state'
                  placeholder='State'
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.state && formik.errors.state)}
                  helperText={formik.errors.state as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='zip_code'>Zip</Label>
                <Input
                  id='zip_code'
                  name='zip_code'
                  placeholder='Zip Code'
                  value={formik.values.zip_code}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.zip_code && formik.errors.zip_code
                  )}
                  helperText={formik.errors.zip_code as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='country'>Country</Label>
                <Input
                  id='country'
                  name='country'
                  placeholder='Country'
                  value={formik.values.country}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.country && formik.errors.country
                  )}
                  helperText={formik.errors.country as string}
                />
              </div>

              {/* Membership Fee Section */}
              <div className='space-y-4 border-t pt-4'>
                <Label className='text-base font-semibold'>
                  Membership Fee
                </Label>

                <div className='space-y-2'>
                  <Label htmlFor='membership_price'>Price</Label>
                  <Input
                    id='membership_price'
                    name='membership_price'
                    type='number'
                    placeholder='Enter price'
                    value={formik.values.membership_price}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='membership_start_date'>Start Date</Label>
                  <Input
                    type='date'
                    id='membership_start_date'
                    name='membership_start_date'
                    value={formik.values.membership_start_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>End Date Type</Label>
                  <RadioGroup
                    value={formik.values.membership_end_date_type || 'months'}
                    onValueChange={(value) => {
                      formik.setFieldValue('membership_end_date_type', value);

                      // Clear the other field when switching types
                      if (value === 'months') {
                        formik.setFieldValue('membership_end_date', '');
                      } else {
                        formik.setFieldValue('membership_months', '');
                      }
                    }}
                    className='flex flex-col space-y-1'
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='months' id='months' />
                      <Label htmlFor='months'>Number of Months</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='end_date' id='end_date' />
                      <Label htmlFor='end_date'>Specific End Date</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formik.values.membership_end_date_type === 'months' ? (
                  <div className='space-y-2'>
                    <Label htmlFor='membership_months'>Number of Months</Label>
                    <Input
                      id='membership_months'
                      name='membership_months'
                      type='number'
                      min='1'
                      placeholder='Enter number of months'
                      value={formik.values.membership_months}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                ) : (
                  <div className='space-y-2'>
                    <Label htmlFor='membership_end_date'>End Date</Label>
                    <Input
                      type='date'
                      id='membership_end_date'
                      name='membership_end_date'
                      value={formik.values.membership_end_date}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                )}
              </div>
              {/* <div className='space-y-2'>
                <Label htmlFor='cnic'>CNIC</Label>
                <SingleFileUploader
                  disabled={false}
                  file={formik.values.cnic as any}
                  setFile={(file) => formik.setFieldValue('cnic', file)}
                >
                  <Avatar className='h-24 w-24'>
                    <AvatarImage
                      src={
                        formik.values.cnic
                          ? formik.values.cnic?.startsWith('data:')
                            ? formik.values.cnic
                            : `${process.env.NEXT_PUBLIC_DIR}images/clients/${formik.values.cnic}`
                          : ''
                      }
                    />
                    <AvatarFallback>
                      {formik.values.first_name?.charAt(0) +
                        formik.values.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </SingleFileUploader>
              </div> */}
              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    formik.resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={formik.isSubmitting}
                  onClick={() => {
                    formik.handleSubmit();
                  }}
                >
                  {formik.isSubmitting ? (
                    <div className='flex items-center gap-2'>
                      <Loader isLoading={true} size={16} />
                      {formik.values.action === 'create'
                        ? 'Adding...'
                        : 'Updating...'}
                    </div>
                  ) : formik.values.action === 'create' ? (
                    'Add Member'
                  ) : (
                    'Update Member'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>
      </div>
    </PageContainer>
  );
};
