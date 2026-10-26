'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const schema = z
  .object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'End date must be greater than start date',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onApply: (range: { startDate: string; endDate: string }) => void;
  defaultRange: { startDate: string; endDate: string };
  onCancel: () => void;
};

const CustomRangePopup = ({ open, setOpen, onApply, defaultRange, onCancel }: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultRange,
  });

  const onSubmit = (data: FormValues) => {
    onApply(data);
    setOpen(false);
    // form.reset();
  };

  const resetForm = () =>
    form.reset({
      startDate: '',
      endDate: '',
    });

  useEffect(() => {
    if (open) {
      form.reset(defaultRange);
    }
  }, [defaultRange, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          resetForm();
          onCancel();
        }
        setOpen(state);
      }}
    >
      <DialogContent
        className="max-w-sm rounded-lg p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-base font-semibold">Select Custom Date Range</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="">
            {/* START DATE */}
            <div className="space-y-6 px-6 ">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <label className="text-sm font-medium">
                      Start Date <span className="text-red-500">*</span>
                    </label>

                    <FormControl>
                      <input
                        type="date"
                        {...field}
                        className="w-full h-10 rounded-lg border focus:outline-none bg-gray-50 text-sm font-medium text-gray-600 border-gray-200 px-4"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <label className="text-sm font-medium">
                      End Date <span className="text-red-500">*</span>
                    </label>

                    <FormControl>
                      <input
                        type="date"
                        {...field}
                        className="w-full h-10 rounded-lg border bg-gray-50 text-sm font-medium text-gray-600 border-gray-200 px-4"
                      />
                      {/* <Input
                        type="date"
                        className="w-full flex justify-between h-10 rounded-lg border bg-gray-50 text-sm font-medium border-gray-200 px-4"
                        {...field}
                      /> */}
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 flex justify-end border-t border-gray-200 px-6 py-4 mt-6">
              <Button
                type="button"
                variant="outline"
                className="px-5"
                onClick={() => {
                  resetForm();
                  setOpen(false);
                  onCancel();
                }}
              >
                Reset
              </Button>

              <Button type="submit" className="px-5">
                Apply
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomRangePopup;
