'use client';
import { useSession } from 'next-auth/react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '@/store/Store';
import { Gym } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertModal } from '@/components/shared/AlertModal';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';
import * as yup from 'yup';
import { useFormik } from 'formik';
import {
  addGym,
  fetchGyms,
  toggleGymStatus,
  updateGym,
  deleteGym
} from '@/store/GymsSlice';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CustomTooltip } from '@/components/shared/CustomTooltip';
import {
  IconEdit,
  IconPlus,
  IconPower,
  IconTrash,
  IconMapPin,
  IconPhone,
  IconBuilding
} from '@tabler/icons-react';
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
                Access Denied. Only owners can access this page.
              </div>
            }
          >
            <LocationsListing session={session} />
          </OwnerOnly>
        </Suspense>
      )}
    </>
  );
};

export default Page;

interface LocationsTabProps {
  session: any;
}

const LocationsListing: React.FC<LocationsTabProps> = ({ session }) => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.gyms);
  const [dialogOpen, setDialogOpen] = useState(false);
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
    name: yup.string().required('Name is required'),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    zip_code: yup.string().required('ZIP code is required'),
    country: yup.string().required('Country is required'),
    phone_number: yup.string().required('Phone number is required')
  });

  const formik = useFormik({
    initialValues: {
      id: '',
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      phone_number: '',
      action: 'create' as 'create' | 'update'
    },
    validationSchema: validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        if (values.action === 'create') {
          const result = await dispatch(
            addGym({
              name: values.name,
              address: values.address,
              city: values.city,
              state: values.state,
              zip_code: values.zip_code,
              country: values.country,
              phone_number: values.phone_number
            })
          );
          if (addGym.fulfilled.match(result)) {
            toast.success('Location added successfully!');
            formik.resetForm();
            setDialogOpen(false);
            window.location.reload();
          } else if (addGym.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to add location';
            toast.error(errorMessage);
          }
        } else {
          const result = await dispatch(
            updateGym({
              id: values.id,
              name: values.name,
              address: values.address,
              city: values.city,
              state: values.state,
              zip_code: values.zip_code,
              country: values.country,
              phone_number: values.phone_number
            })
          );
          if (updateGym.fulfilled.match(result)) {
            toast.success('Location updated successfully!');
            formik.resetForm();
            setDialogOpen(false);
            window.location.reload();
          } else if (updateGym.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to update location';
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
    const fetchData = async () => {
      try {
        await dispatch(fetchGyms());
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Data fetching error:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleEdit = (gym: Gym) => {
    formik.setValues({
      id: gym.id,
      name: gym.name,
      address: gym.address || '',
      city: gym.city || '',
      state: gym.state || '',
      zip_code: gym.zip_code || '',
      country: gym.country || '',
      phone_number: gym.phone_number || '',
      action: 'update'
    });
    setDialogOpen(true);
  };

  const handleDelete = (gym: Gym) => {
    setAlertState({
      open: true,
      title: 'Delete Location',
      description: `Are you sure you want to delete "${gym.name}"? This action cannot be undone.`,
      cancelText: 'Cancel',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const result = await dispatch(deleteGym(gym.id));
          if (deleteGym.fulfilled.match(result)) {
            toast.success('Location deleted successfully!');
            window.location.reload();
          } else if (deleteGym.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to delete location';
            toast.error(errorMessage);
          }
        } catch (error) {
          toast.error('An unexpected error occurred');
          console.error('Delete location error:', error);
        }
        setAlertState({ ...alertState, open: false });
      },
      onClose: () => {
        setAlertState({ ...alertState, open: false });
      },
      type: 'danger'
    });
  };

  const handleToggleStatus = (gym: Gym) => {
    setAlertState({
      open: true,
      title: gym.is_active ? 'Deactivate Location' : 'Activate Location',
      description: gym.is_active
        ? `Are you sure you want to deactivate "${gym.name}"?`
        : `Are you sure you want to activate "${gym.name}"?`,
      cancelText: 'Cancel',
      confirmText: gym.is_active ? 'Deactivate' : 'Activate',
      onConfirm: async () => {
        try {
          const result = await dispatch(
            toggleGymStatus({
              id: gym.id,
              status: !gym.is_active
            })
          );
          if (toggleGymStatus.fulfilled.match(result)) {
            toast.success(
              `Location ${!gym.is_active ? 'activated' : 'deactivated'} successfully!`
            );
          } else if (toggleGymStatus.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to update location status';
            toast.error(errorMessage);
          }
        } catch (error) {
          toast.error('An unexpected error occurred');
          console.error('Toggle status error:', error);
        }
        setAlertState({ ...alertState, open: false });
      },
      onClose: () => {
        setAlertState({ ...alertState, open: false });
      },
      type: 'danger'
    });
  };

  const openCreateDialog = () => {
    formik.resetForm();
    formik.setValues({
      id: '',
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      phone_number: '',
      action: 'create'
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    formik.resetForm();
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Locations</h3>
          <Button onClick={openCreateDialog}>
            <IconPlus className='mr-2 h-4 w-4' />
            New Location
          </Button>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader isLoading={loading} size={32} />
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {data.gyms.map((gym: Gym) => (
              <Card key={gym.id} className='transition-shadow hover:shadow-lg'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-2'>
                      <IconBuilding className='text-primary h-5 w-5' />
                      <CardTitle className='text-lg'>{gym.name}</CardTitle>
                    </div>
                    <Badge
                      variant={gym.is_active ? 'default' : 'outline'}
                      className={
                        gym.is_active
                          ? 'bg-primary/10 text-primary'
                          : 'text-destructive'
                      }
                    >
                      {gym.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {gym.address && (
                    <div className='text-muted-foreground flex items-start gap-2 text-sm'>
                      <IconMapPin className='mt-0.5 h-4 w-4 flex-shrink-0' />
                      <div>
                        <p>{gym.address}</p>
                        <p>
                          {gym.city}, {gym.state} {gym.zip_code}
                        </p>
                        <p>{gym.country}</p>
                      </div>
                    </div>
                  )}

                  {gym.phone_number && (
                    <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                      <IconPhone className='h-4 w-4' />
                      <span>+{gym.phone_number}</span>
                    </div>
                  )}

                  <div className='flex justify-end gap-2 border-t pt-2'>
                    <CustomTooltip
                      trigger={
                        <Button
                          variant='outline'
                          size='icon'
                          onClick={() => handleEdit(gym)}
                        >
                          <IconEdit className='h-4 w-4' />
                        </Button>
                      }
                      content='Edit'
                    />

                    <CustomTooltip
                      trigger={
                        <Button
                          variant='outline'
                          size='icon'
                          onClick={() => handleToggleStatus(gym)}
                        >
                          <IconPower
                            className={`h-4 w-4 ${
                              gym.is_active
                                ? 'text-primary'
                                : 'text-destructive'
                            }`}
                          />
                        </Button>
                      }
                      content={gym.is_active ? 'Deactivate' : 'Activate'}
                    />

                    <CustomTooltip
                      trigger={
                        <Button
                          variant='outline'
                          size='icon'
                          onClick={() => handleDelete(gym)}
                        >
                          <IconTrash className='h-4 w-4' />
                        </Button>
                      }
                      content='Delete'
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && data.gyms.length === 0 && (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
              <IconBuilding className='text-muted-foreground mb-4 h-12 w-12' />
              <h3 className='mb-2 text-lg font-semibold'>No locations yet</h3>
              <p className='text-muted-foreground mb-4'>
                Get started by adding your first gym location.
              </p>
              <Button onClick={openCreateDialog}>
                <IconPlus className='mr-2 h-4 w-4' />
                Add Location
              </Button>
            </CardContent>
          </Card>
        )}

        <AlertModal {...alertState} />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
              <DialogTitle>
                {formik.values.action === 'create'
                  ? 'Add New Location'
                  : 'Edit Location'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={formik.handleSubmit} className='space-y-4'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Location Name</Label>
                  <Input
                    id='name'
                    name='name'
                    placeholder='Enter location name'
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.name && formik.errors.name)}
                    helperText={
                      formik.touched.name && formik.errors.name
                        ? (formik.errors.name as string)
                        : ''
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='address'>Address</Label>
                  <Input
                    id='address'
                    name='address'
                    placeholder='Enter street address'
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(
                      formik.touched.address && formik.errors.address
                    )}
                    helperText={
                      formik.touched.address && formik.errors.address
                        ? (formik.errors.address as string)
                        : ''
                    }
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='city'>City</Label>
                    <Input
                      id='city'
                      name='city'
                      placeholder='Enter city'
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={Boolean(formik.touched.city && formik.errors.city)}
                      helperText={
                        formik.touched.city && formik.errors.city
                          ? (formik.errors.city as string)
                          : ''
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='state'>State</Label>
                    <Input
                      id='state'
                      name='state'
                      placeholder='Enter state'
                      value={formik.values.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={Boolean(
                        formik.touched.state && formik.errors.state
                      )}
                      helperText={
                        formik.touched.state && formik.errors.state
                          ? (formik.errors.state as string)
                          : ''
                      }
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='zip_code'>ZIP Code</Label>
                    <Input
                      id='zip_code'
                      name='zip_code'
                      placeholder='Enter ZIP code'
                      value={formik.values.zip_code}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={Boolean(
                        formik.touched.zip_code && formik.errors.zip_code
                      )}
                      helperText={
                        formik.touched.zip_code && formik.errors.zip_code
                          ? (formik.errors.zip_code as string)
                          : ''
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='country'>Country</Label>
                    <Input
                      id='country'
                      name='country'
                      placeholder='Enter country'
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={Boolean(
                        formik.touched.country && formik.errors.country
                      )}
                      helperText={
                        formik.touched.country && formik.errors.country
                          ? (formik.errors.country as string)
                          : ''
                      }
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone_number'>Phone Number</Label>
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
                    placeholder='Enter phone number'
                    value={formik.values.phone_number}
                    onChange={(value) => {
                      formik.setFieldValue('phone_number', value);
                    }}
                    onBlur={() => {
                      formik.setFieldTouched('phone_number', true);
                    }}
                  />
                  {formik.errors.phone_number &&
                    formik.touched.phone_number && (
                      <p className='text-destructive mt-1 text-sm'>
                        {formik.errors.phone_number as string}
                      </p>
                    )}
                </div>
              </div>

              <DialogFooter>
                <Button type='button' variant='outline' onClick={closeDialog}>
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
                    'Add Location'
                  ) : (
                    'Update Location'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
};
