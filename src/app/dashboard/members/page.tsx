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
    password: yup.string().required('Password is required'),
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
      gym_id: session?.user?.selected_location_id
    },
    validationSchema: validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        if (!session?.user?.selected_location_id) {
          toast.error('Please select a gym first');
          return;
        }

        if (values.action === 'create') {
          const result = await dispatch(
            addMember({
              ...values,
              gym_id: selectedGymId
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
              ...values
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
                        <TableCell className=''>
                          <div className='flex justify-end gap-2'>
                            <CustomTooltip
                              trigger={
                                <Button
                                  variant='outline'
                                  size='icon'
                                  onClick={() =>
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
                                      action: 'update',
                                      open: true
                                    })
                                  }
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
                <Button type='submit' disabled={loading || formik.isSubmitting}>
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
