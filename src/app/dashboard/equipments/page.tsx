'use client';
import { useSession } from 'next-auth/react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from '@/store/Store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertModal } from '@/components/shared/AlertModal';
import * as yup from 'yup';
import { useFormik } from 'formik';
import {
  addEquipment,
  fetchEquipment,
  toggleEquipmentStatus,
  updateEquipment,
  deleteEquipment,
  EquipmentType
} from '@/store/EquipmentSlice';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

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
            <EquipmentListing session={session} />
          </OwnerOnly>
        </Suspense>
      )}
    </>
  );
};

export default Page;

interface EquipmentListingProps {
  session: any;
}

const EquipmentListing: React.FC<EquipmentListingProps> = ({ session }) => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.equipment);
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
    name: yup.string().required('Equipment name is required'),
    type: yup.string().required('Equipment type is required'),
    quantity: yup.string().required('Quantity is required'),
    weight: yup.string().optional()
  });

  const formik = useFormik({
    initialValues: {
      id: '',
      name: '',
      type: '' as EquipmentType,
      quantity: '',
      weight: '',
      action: 'create',
      open: false,
      gym_id: selectedGymId
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        // Manual validation check
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          toast.error('Please fix the form errors before submitting');
          return;
        }

        if (!selectedGymId) {
          toast.error('Please select a gym first');
          return;
        }

        if (values.action === 'create') {
          const result = await dispatch(
            addEquipment({
              ...values,
              gym_id: selectedGymId
            })
          );
          if (addEquipment.fulfilled.match(result)) {
            toast.success('Equipment added successfully!');
            formik.resetForm();
            formik.setValues({
              ...formik.initialValues,
              open: false
            });
            // Refresh the equipment list
            dispatch(fetchEquipment(selectedGymId));
          } else if (addEquipment.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to add equipment';
            toast.error(errorMessage);
          }
        } else {
          const result = await dispatch(
            updateEquipment({
              ...values
            })
          );
          if (updateEquipment.fulfilled.match(result)) {
            toast.success('Equipment updated successfully!');
            formik.resetForm();
            formik.setValues({
              ...formik.initialValues,
              open: false
            });
            // Refresh the equipment list
            dispatch(fetchEquipment(selectedGymId));
          } else if (updateEquipment.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to update equipment';
            toast.error(errorMessage);
          }
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
      }
    }
  });

  useEffect(() => {
    if (selectedGymId) {
      dispatch(fetchEquipment(selectedGymId));
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
            Please select a gym from the sidebar to view and manage equipment.
          </p>
        </div>
      </PageContainer>
    );
  }

  // Equipment type options for the select dropdown
  const equipmentTypeOptions = Object.values(EquipmentType).map((type) => ({
    value: type,
    label: type.charAt(0) + type.slice(1).toLowerCase()
  }));

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Equipment</h3>
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
            New Equipment
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
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.equipment.map((equipment) => (
                      <TableRow key={equipment.id}>
                        <TableCell className='font-medium'>
                          {equipment.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline' className='capitalize'>
                            {equipment.type.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{equipment.quantity}</TableCell>
                        <TableCell>{equipment.weight || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              equipment.is_active ? 'default' : 'outline'
                            }
                            className={
                              equipment.is_active
                                ? 'bg-primary/10 text-primary'
                                : 'text-destructive'
                            }
                          >
                            {equipment.is_active ? 'Active' : 'Inactive'}
                          </Badge>
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
                                      id: equipment.id,
                                      name: equipment.name,
                                      type: equipment.type,
                                      quantity: equipment.quantity,
                                      weight: equipment.weight || '',
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
                                      title: equipment.is_active
                                        ? 'Deactivate'
                                        : 'Activate',
                                      description: equipment.is_active
                                        ? 'Are you sure you want to deactivate this equipment?'
                                        : 'Are you sure you want to activate this equipment?',
                                      cancelText: 'Cancel',
                                      confirmText: equipment.is_active
                                        ? 'Deactivate'
                                        : 'Activate',
                                      onConfirm: async () => {
                                        try {
                                          const result = await dispatch(
                                            toggleEquipmentStatus({
                                              id: equipment.id,
                                              status: !equipment.is_active
                                            })
                                          );
                                          if (
                                            toggleEquipmentStatus.fulfilled.match(
                                              result
                                            )
                                          ) {
                                            toast.success(
                                              `Equipment ${!equipment.is_active ? 'activated' : 'deactivated'} successfully!`
                                            );
                                            // Refresh the equipment list
                                            dispatch(
                                              fetchEquipment(selectedGymId)
                                            );
                                          } else if (
                                            toggleEquipmentStatus.rejected.match(
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
                                                : 'Failed to update equipment status';
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
                                      equipment.is_active
                                        ? 'text-primary'
                                        : 'text-destructive'
                                    }
                                  />
                                </Button>
                              }
                              content={
                                equipment.is_active ? 'Deactivate' : 'Activate'
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
                                      title: 'Delete Equipment',
                                      description:
                                        'Are you sure you want to delete this equipment? This action cannot be undone.',
                                      cancelText: 'Cancel',
                                      confirmText: 'Delete',
                                      onConfirm: async () => {
                                        try {
                                          const result = await dispatch(
                                            deleteEquipment(equipment.id)
                                          );
                                          if (
                                            deleteEquipment.fulfilled.match(
                                              result
                                            )
                                          ) {
                                            toast.success(
                                              'Equipment deleted successfully!'
                                            );
                                            // Refresh the equipment list
                                            dispatch(
                                              fetchEquipment(selectedGymId)
                                            );
                                          } else if (
                                            deleteEquipment.rejected.match(
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
                                                : 'Failed to delete equipment';
                                            toast.error(errorMessage);
                                          }
                                        } catch (error) {
                                          toast.error(
                                            'An unexpected error occurred'
                                          );
                                          console.error(
                                            'Delete equipment error:',
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
          <form
            onSubmit={(e) => {
              formik.handleSubmit(e);
            }}
            className='space-y-4'
          >
            <DialogContent className='sm:max-w-xl'>
              <DialogHeader>
                <DialogTitle>
                  {formik.values.action === 'create'
                    ? 'Add Equipment'
                    : 'Update Equipment'}
                </DialogTitle>
              </DialogHeader>

              <div className='space-y-2'>
                <Label htmlFor='name'>Equipment Name</Label>
                <Input
                  id='name'
                  name='name'
                  placeholder='e.g., Treadmill, 50kg Plates, Olympic Bar'
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.name && formik.errors.name
                      ? 'border-destructive'
                      : ''
                  }
                />
                {formik.touched.name && formik.errors.name && (
                  <p className='text-destructive text-sm'>
                    {formik.errors.name}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='type'>Equipment Type</Label>
                <Select
                  value={formik.values.type}
                  onValueChange={(value) => {
                    formik.setFieldValue('type', value);
                    formik.setFieldTouched('type', true);
                  }}
                >
                  <SelectTrigger
                    className={
                      formik.touched.type && formik.errors.type
                        ? 'border-destructive'
                        : ''
                    }
                  >
                    <SelectValue placeholder='Select equipment type' />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <p className='text-destructive text-sm'>
                    {formik.errors.type}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='quantity'>Quantity</Label>
                <Input
                  id='quantity'
                  name='quantity'
                  placeholder='e.g., 2, 10 pairs, 1 set'
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.quantity && formik.errors.quantity
                      ? 'border-destructive'
                      : ''
                  }
                />
                {formik.touched.quantity && formik.errors.quantity && (
                  <p className='text-destructive text-sm'>
                    {formik.errors.quantity}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='weight'>Weight (Optional)</Label>
                <Input
                  id='weight'
                  name='weight'
                  placeholder='e.g., 50kg, 25lbs, 10kg each'
                  value={formik.values.weight}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <p className='text-muted-foreground text-sm'>
                  Use for dumbbells, plates, bars, and other weighted equipment
                </p>
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
                  //   type='submit'
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
                    'Add Equipment'
                  ) : (
                    'Update Equipment'
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
