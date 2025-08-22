'use client';
import { useSession } from 'next-auth/react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '@/store/Store';
import { BillingModel, User } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertModal } from '@/components/shared/AlertModal';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import * as yup from 'yup';
import { useFormik } from 'formik';
import {
  addClient,
  fetchClients,
  toggleClientStatus,
  updateClient,
  deleteClient
} from '@/store/ClientsSlice';
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
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import SingleFileUploader from '@/components/shared/SingleImageUploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fetchSubscriptions } from '@/store/SubscriptionSlice';
const page = () => {
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
          <ClientListing session={session} />
        </Suspense>
      )}
    </>
  );
};

export default page;

interface StagesTabProps {
  session: any;
}
const ClientListing: React.FC<StagesTabProps> = ({ session }) => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.clients);
  const { subscriptions } = useSelector((state) => state.subscriptions.data);
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
    email: yup
      .string()
      .email('Invalid email')
      .required('Email is required')
      .test('email-exists', 'Email already exists', async (value, schema) => {
        try {
          const response = await axios.post('/api/clients/verifyemail', {
            email: value,
            id: schema.parent.id,
            action: schema.parent.action
          });
          const isExist = response.data;
          return value && isExist;
        } catch (error) {}
      }),
    phone_number: yup.string().required('Phone is required'),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zip_code: yup.string().required('Zip is required'),
    country: yup.string().required('Country is required'),
    subscription_id: yup.string().required('Subscription is required'),
    billing_model: yup.string().required('Billing Model is required'),
    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .required('Password is required'),
    date_of_birth: yup
      .date()
      .required('Date of birth is required')
      .max(new Date(), 'Date of birth must be in the past')
  });

  const formik = useFormik({
    initialValues: {
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
      SubscriptionFeature: [],
      subscription_id: '',
      billing_model: 'MONTHLY' as BillingModel,
      cnic: '',
      password: '',
      date_of_birth: ''
    },
    validationSchema: validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (values.action === 'create') {
        const result = await dispatch(
          addClient({
            client: {
              ...values
            } as any
          })
        );
        if (addClient.fulfilled.match(result)) {
          formik.resetForm();
        }
      } else {
        const result = await dispatch(
          updateClient({
            client: {
              ...values
            } as any
          })
        );
        if (updateClient.fulfilled.match(result)) {
          formik.resetForm();
        }
      }
    }
  });

  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  console.log(formik.errors);
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Subscriptions</h3>
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
          New Client
        </Button>
      </div>
      <Card>
        <CardContent>
          <div className='max-h-[55vh] overflow-y-auto'>
            <Table className='w-full'>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Zip</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.clients.map((row: User) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.first_name} {row.last_name}
                    </TableCell>
                    <TableCell className=''>
                      <div className='flex flex-col gap-2'>
                        <Badge
                          variant={row.is_active ? 'default' : 'outline'}
                          className={
                            row.is_active
                              ? 'bg-green-500'
                              : row.is_active
                                ? 'bg-destructive'
                                : ''
                          }
                        >
                          {row.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className=''>{row.email}</TableCell>
                    <TableCell className=''>{row.phone_number}</TableCell>
                    <TableCell className=''>{row.address}</TableCell>
                    <TableCell className=''>{row.city}</TableCell>
                    <TableCell className=''>{row.state}</TableCell>
                    <TableCell className=''>{row.zip_code}</TableCell>
                    <TableCell className=''>{row.country}</TableCell>
                    <TableCell></TableCell>
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
                                  ...row,
                                  action: 'view',
                                  open: true,
                                  date_of_birth: row.date_of_birth
                                    ? new Date(row.date_of_birth)
                                        .toISOString()
                                        .split('T')[0]
                                    : ''
                                } as any)
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
                                  title: row.is_active
                                    ? 'Deactivate'
                                    : 'Activate',
                                  description: row.is_active
                                    ? 'Are you sure you want to deactivate this subscription?'
                                    : 'Are you sure you want to activate this subscription?',
                                  cancelText: 'Cancel',
                                  confirmText: row.is_active
                                    ? 'Deactivate'
                                    : 'Activate',
                                  onConfirm: async () => {
                                    const result = await dispatch(
                                      toggleClientStatus({
                                        id: row.id
                                      })
                                    );
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
                                  row.is_active
                                    ? 'text-primary'
                                    : 'text-destructive'
                                }
                              />
                            </Button>
                          }
                          content={row.is_active ? 'Deactivate' : 'Activate'}
                        />
                        <CustomTooltip
                          trigger={
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={() =>
                                setAlertState({
                                  open: true,
                                  title: 'Delete Subscription',
                                  description:
                                    'Are you sure you want to delete this subscription?',
                                  cancelText: 'Cancel',
                                  confirmText: 'Delete',
                                  onConfirm: async () => {
                                    const result = await dispatch(
                                      deleteClient({
                                        id: row.id
                                      })
                                    );
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
                  ? 'Add Client'
                  : 'Update Client'}
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-2'>
              <Label htmlFor='first_name'>First Name</Label>
              <Input
                id='name'
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
                placeholder='Organisation Telephone No.'
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
                error={Boolean(formik.touched.address && formik.errors.address)}
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
                placeholder='State'
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
                error={Boolean(formik.touched.country && formik.errors.country)}
                helperText={formik.errors.country as string}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='country'>Subscription</Label>
              <Select
                value={formik.values.subscription_id || ''}
                onValueChange={(value) => {
                  formik.setValues({
                    ...formik.values,
                    subscription_id: value
                  });
                }}
              >
                <SelectTrigger
                  className='w-full'
                  onBlur={() => {
                    formik.setFieldTouched('subscription_id', true);
                  }}
                >
                  <SelectValue placeholder='Subscription' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {subscriptions.map((subscription) => (
                      <SelectItem value={subscription.id}>
                        {subscription.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {formik.touched.subscription_id &&
                formik.errors.subscription_id && (
                  <p className='text-destructive -mt-3 text-sm'>
                    {formik.errors.subscription_id as string}
                  </p>
                )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='country'>Billing Model</Label>
              <Select
                value={formik.values.billing_model || ''}
                onValueChange={(value) => {
                  formik.setValues({
                    ...formik.values,
                    billing_model: value as BillingModel
                  });
                }}
              >
                <SelectTrigger
                  className='w-full'
                  onBlur={() => {
                    formik.setFieldTouched('billing_model', true);
                  }}
                >
                  <SelectValue placeholder='Billing Model' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {['MONTHLY', 'YEARLY'].map((billingModel) => (
                      <SelectItem value={billingModel}>
                        {billingModel}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {formik.touched.billing_model && formik.errors.billing_model && (
                <p className='text-destructive -mt-3 text-sm'>
                  {formik.errors.billing_model as string}
                </p>
              )}
            </div>
            <div className='space-y-2'>
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
            </div>
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
                disabled={loading || formik.isSubmitting}
                onClick={() => {
                  formik.handleSubmit();
                }}
              >
                {formik.values.action === 'create'
                  ? 'Add Client'
                  : 'Update Client'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  );
};
