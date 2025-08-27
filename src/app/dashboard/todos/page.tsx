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
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompleted
} from '@/store/TodoSlice';
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
import { CustomTooltip } from '@/components/shared/CustomTooltip';
import { IconEdit, IconPlus, IconTrash, IconCheck } from '@tabler/icons-react';
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
            <TodoListing session={session} />
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

const TodoListing: React.FC<EquipmentListingProps> = ({ session }) => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.todos);

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
    title: yup.string().required('Title is required'),
    description: yup.string().optional()
  });

  const formik = useFormik({
    initialValues: {
      id: '',
      title: '',
      description: '',
      action: 'create',
      open: false,
      completed: false
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

        if (values.action === 'create') {
          const result = await dispatch(
            addTodo({ title: values.title, description: values.description })
          );
          if (addTodo.fulfilled.match(result)) {
            toast.success('Todo added successfully!');
            formik.resetForm();
            formik.setValues({
              ...formik.initialValues,
              open: false
            });
            dispatch(fetchTodos());
          } else if (addTodo.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to add todo';
            toast.error(errorMessage);
          }
        } else {
          const result = await dispatch(
            updateTodo({
              id: values.id,
              title: values.title,
              description: values.description
            })
          );
          if (updateTodo.fulfilled.match(result)) {
            toast.success('Todo updated successfully!');
            formik.resetForm();
            formik.setValues({
              ...formik.initialValues,
              open: false
            });
            dispatch(fetchTodos());
          } else if (updateTodo.rejected.match(result)) {
            const errorMessage =
              result.payload &&
              typeof result.payload === 'object' &&
              'message' in result.payload
                ? (result.payload as { message: string }).message
                : 'Failed to update todo';
            toast.error(errorMessage);
          }
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
      }
    }
  });

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  // no gym dependency for todos

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Todos</h3>
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
            New Todo
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
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.todos.map((todo: any) => (
                      <TableRow key={todo.id}>
                        <TableCell className='font-medium'>
                          {todo.title}
                        </TableCell>
                        <TableCell className='max-w-[400px] truncate'>
                          {todo.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={todo.is_completed ? 'ghost' : 'ghost'}
                            size='sm'
                            onClick={async () => {
                              const result = await dispatch(
                                toggleTodoCompleted({
                                  id: todo.id,
                                  completed: !todo.is_completed
                                })
                              );
                              if (toggleTodoCompleted.fulfilled.match(result)) {
                                toast.success('Todo status updated');
                              } else {
                                toast.error(
                                  (result.payload as any)?.message ||
                                    'Failed to update status'
                                );
                              }
                            }}
                          >
                            <IconCheck
                              className={
                                todo.is_completed ? 'text-primary' : ''
                              }
                            />
                          </Button>
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
                                      id: todo.id,
                                      title: todo.title,
                                      description: todo.description || '',
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
                                      title: 'Delete Todo',
                                      description:
                                        'Are you sure you want to delete this todo? This action cannot be undone.',
                                      cancelText: 'Cancel',
                                      confirmText: 'Delete',
                                      onConfirm: async () => {
                                        try {
                                          const result = await dispatch(
                                            deleteTodo(todo.id)
                                          );
                                          if (
                                            deleteTodo.fulfilled.match(result)
                                          ) {
                                            toast.success(
                                              'Todo deleted successfully!'
                                            );
                                            dispatch(fetchTodos());
                                          } else if (
                                            deleteTodo.rejected.match(result)
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
                                                : 'Failed to delete todo';
                                            toast.error(errorMessage);
                                          }
                                        } catch (error) {
                                          toast.error(
                                            'An unexpected error occurred'
                                          );
                                          console.error(
                                            'Delete todo error:',
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
                    ? 'Add Todo'
                    : 'Update Todo'}
                </DialogTitle>
              </DialogHeader>

              <div className='space-y-2'>
                <Label htmlFor='title'>Title</Label>
                <Input
                  id='title'
                  name='title'
                  placeholder='e.g., Call supplier, update landing copy'
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={
                    formik.touched.title && (formik.errors as any).title
                      ? 'border-destructive'
                      : ''
                  }
                />
                {formik.touched.title && (formik.errors as any).title && (
                  <p className='text-destructive text-sm'>
                    {(formik.errors as any).title as string}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description (Optional)</Label>
                <Input
                  id='description'
                  name='description'
                  placeholder='Details about this task'
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
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
                    'Add Todo'
                  ) : (
                    'Update Todo'
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
