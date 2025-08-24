'use client';
import { useSession } from 'next-auth/react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '@/store/Store';
import { Feature, Subscription } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertModal } from '@/components/shared/AlertModal';
import * as yup from 'yup';
import { useFormik } from 'formik';
import {
  addSubscription,
  fetchSubscriptions,
  fetchFeatures,
  toggleSubscriptionStatus,
  updateSubscription,
  deleteSubscription
} from '@/store/SubscriptionSlice';
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
import MultiSelectWithCheckbox from '@/components/shared/MultiSelectWithCheckbox';
import PageContainer from '@/components/layout/page-container';
import Loader from '@/components/shared/Loader';
import { toast } from 'sonner';
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
          <SubscriptionListing session={session} />
        </Suspense>
      )}
    </>
  );
};

export default Page;

interface StagesTabProps {
  session: any;
}
const SubscriptionListing: React.FC<StagesTabProps> = ({ session }) => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.subscriptions);
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
    monthly_price: yup.number().required('Monthly price is required'),
    yearly_price: yup.number().required('Yearly price is required'),
    max_gyms: yup.number().required('Max gyms is required'),
    max_members: yup.number().required('Max members is required'),
    max_equipment: yup.number().required('Max equipment is required')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      monthly_price: 0,
      yearly_price: 0,
      max_gyms: 0,
      max_members: 0,
      max_equipment: 0,
      action: 'create',
      open: false,
      SubscriptionFeature: []
    },
    validationSchema: validationSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        if (values.action === 'create') {
          const result = await dispatch(
            addSubscription({
              subscription: {
                ...values
              } as any
            })
          );
          if (addSubscription.fulfilled.match(result)) {
            toast.success('Subscription added successfully!');
            formik.resetForm();
            formik.setValues({
              ...formik.values,
              open: false
            });
          } else if (addSubscription.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to add subscription';
            toast.error(errorMessage);
          }
        } else {
          const result = await dispatch(
            updateSubscription({
              subscription: {
                ...values
              } as any
            })
          );
          if (updateSubscription.fulfilled.match(result)) {
            toast.success('Subscription updated successfully!');
            formik.resetForm();
            formik.setValues({
              ...formik.values,
              open: false
            });
          } else if (updateSubscription.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to update subscription';
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
        await Promise.all([
          dispatch(fetchSubscriptions()),
          dispatch(fetchFeatures())
        ]);
      } catch (error) {
        toast.error('Failed to fetch data');
        console.error('Data fetching error:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
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
            New Subscription
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
                      <TableHead>Monthly Price</TableHead>
                      <TableHead>Yearly Price</TableHead>
                      <TableHead>Max Gyms</TableHead>
                      <TableHead>Max Members</TableHead>
                      <TableHead>Max Equipment</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.subscriptions.map((row: Subscription) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className=''>
                          <div className='flex flex-col gap-2'>
                            <Badge
                              variant={row.is_active ? 'default' : 'outline'}
                              className={
                                row.is_active
                                  ? 'bg-green-500'
                                  : 'text-destructive'
                              }
                            >
                              {row.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className=''>{row.monthly_price}</TableCell>
                        <TableCell className=''>{row.yearly_price}</TableCell>
                        <TableCell className=''>{row.max_gyms}</TableCell>
                        <TableCell className=''>{row.max_members}</TableCell>
                        <TableCell className=''>{row.max_equipment}</TableCell>
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
                                      open: true
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
                                        try {
                                          const result = await dispatch(
                                            toggleSubscriptionStatus({
                                              id: row.id,
                                              status: !row.is_active
                                            })
                                          );
                                          if (
                                            toggleSubscriptionStatus.fulfilled.match(
                                              result
                                            )
                                          ) {
                                            toast.success(
                                              `Subscription ${!row.is_active ? 'activated' : 'deactivated'} successfully!`
                                            );
                                          } else if (
                                            toggleSubscriptionStatus.rejected.match(
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
                                                : 'Failed to update subscription status';
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
                                      row.is_active
                                        ? 'text-primary'
                                        : 'text-destructive'
                                    }
                                  />
                                </Button>
                              }
                              content={
                                row.is_active ? 'Deactivate' : 'Activate'
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
                                      title: 'Delete Subscription',
                                      description:
                                        'Are you sure you want to delete this subscription?',
                                      cancelText: 'Cancel',
                                      confirmText: 'Delete',
                                      onConfirm: async () => {
                                        try {
                                          const result = await dispatch(
                                            deleteSubscription({
                                              id: row.id
                                            })
                                          );
                                          if (
                                            deleteSubscription.fulfilled.match(
                                              result
                                            )
                                          ) {
                                            toast.success(
                                              'Subscription deleted successfully!'
                                            );
                                          } else if (
                                            deleteSubscription.rejected.match(
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
                                                : 'Failed to delete subscription';
                                            toast.error(errorMessage);
                                          }
                                        } catch (error) {
                                          toast.error(
                                            'An unexpected error occurred'
                                          );
                                          console.error(
                                            'Delete subscription error:',
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
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>
                  {formik.values.action === 'create'
                    ? 'Add Subscription'
                    : 'Update Subscription'}
                </DialogTitle>
              </DialogHeader>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  name='name'
                  placeholder='Name'
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  helperText={formik.errors.name as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='monthly_price'>Monthly Price</Label>
                <Input
                  id='monthly_price'
                  type='number'
                  name='monthly_price'
                  placeholder='Monthly Price'
                  value={formik.values.monthly_price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.monthly_price && formik.errors.monthly_price
                  )}
                  helperText={formik.errors.monthly_price as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='yearly_price'>Yearly Price</Label>
                <Input
                  type='number'
                  id='yearly_price'
                  name='yearly_price'
                  placeholder='Yearly Price'
                  value={formik.values.yearly_price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.yearly_price && formik.errors.yearly_price
                  )}
                  helperText={formik.errors.yearly_price as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='max_gyms'>Max Gyms</Label>
                <Input
                  type='number'
                  id='max_gyms'
                  name='max_gyms'
                  placeholder='Max Gyms'
                  value={formik.values.max_gyms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.max_gyms && formik.errors.max_gyms
                  )}
                  helperText={formik.errors.max_gyms as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='max_members'>Max Members</Label>
                <Input
                  type='number'
                  id='max_members'
                  name='max_members'
                  placeholder='Max Members'
                  value={formik.values.max_members}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.max_members && formik.errors.max_members
                  )}
                  helperText={formik.errors.max_members as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='max_equipment'>Max Equipment</Label>
                <Input
                  type='number'
                  id='max_equipment'
                  name='max_equipment'
                  placeholder='Max Equipment'
                  value={formik.values.max_equipment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(
                    formik.touched.max_equipment && formik.errors.max_equipment
                  )}
                  helperText={formik.errors.max_equipment as string}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='description'>Features</Label>
                <MultiSelectWithCheckbox
                  items={data.features.map((feature: Feature) => ({
                    label: feature.name,
                    value: feature.id
                  }))}
                  selectedValues={formik.values.SubscriptionFeature}
                  onSelectionChange={(ids: string[]) => {
                    formik.setValues({
                      ...formik.values,
                      SubscriptionFeature: ids as any
                    });
                  }}
                />
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
                  {formik.isSubmitting ? (
                    <div className='flex items-center gap-2'>
                      <Loader isLoading={true} size={16} />
                      {formik.values.action === 'create'
                        ? 'Adding...'
                        : 'Updating...'}
                    </div>
                  ) : formik.values.action === 'create' ? (
                    'Add Subscription'
                  ) : (
                    'Update Subscription'
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
