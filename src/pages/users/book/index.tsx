import {
  Badge,
  Button,
  Calendar,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { TableType } from "@/types/dev.types";
import { supabaseClient } from "@/utility";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HttpError,
  useCreate,
  useCreateMany,
  useDelete,
  useList,
  useNavigation,
  useOne,
  useResourceParams,
} from "@refinedev/core";
import { format, parse } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building,
  CalendarIcon,
  CheckCircle,
  ChevronLeftIcon,
  Clock,
  CloudUpload,
  MapPin,
  Paperclip,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { venueAllQuery } from "../venues/utils/venue-query";
import { TVenueQuery } from "../venues/utils/venue-query.types";

const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
});

// Add this helper function at the top with other utility functions
function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Update the calculateHoursBetween function to handle precision
function calculateHoursBetween(start: string, end: string): number {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;

  // Round to 2 decimal places to avoid floating point precision errors
  return roundToTwoDecimals((endInMinutes - startInMinutes) / 60);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const bookingScheduleSchema = z
  .object({
    date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    start_time: z
      .string()
      .refine((val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
        message: "Invalid time format. Use HH:MM",
      }),
    end_time: z
      .string()
      .refine((val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
        message: "Invalid time format. Use HH:MM",
      }),
  })
  .refine(
    (data) => {
      const start = parse(data.start_time, "HH:mm", new Date(data.date));
      const end = parse(data.end_time, "HH:mm", new Date(data.date));
      return start < end;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  )
  .refine(
    (data) => {
      const hours = calculateHoursBetween(data.start_time, data.end_time);
      return hours >= 1;
    },
    {
      message: "Booking duration must be at least 1 hour",
      path: ["end_time"],
    }
  );

const bookFormSchema = z.object({
  venue_id: z.number(),
  total_amount: z.number().optional(),
  schedules: z
    .array(bookingScheduleSchema)
    .min(1, "At least one schedule is required"),
  payment: z
    .object({
      amount: z.number().min(0, "Amount must be greater than 0"),
      payment_mode_id: z.number({
        required_error: "Please select a payment mode",
      }),
      is_down_payment: z.boolean().default(false),
    })
    .optional(),
  receipt_reference: z.any().optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export const BookVenuePage = () => {
  const [files, setFiles] = useState<File[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [minPaymentAmount, setMinPaymentAmount] = useState<number>(0);
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<number>(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { id: venueId } = useResourceParams();
  const bookingForm = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      venue_id: Number(venueId),
      schedules: [
        {
          date: new Date().toISOString().split("T")[0],
          start_time: "09:00",
          end_time: "17:00",
        },
      ],
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = bookingForm;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules",
  });

  const addNewSchedule = () => {
    const lastExistingSchedule = fields[fields.length - 1];
    const lastDate = lastExistingSchedule
      ? new Date(lastExistingSchedule.date)
      : new Date();
    const newDate = new Date(lastDate);
    newDate.setDate(newDate.getDate() + 1);

    const newSchedule = {
      date: newDate.toISOString().split("T")[0],
      start_time: lastExistingSchedule?.start_time || "09:00",
      end_time: lastExistingSchedule?.end_time || "17:00",
    };
    append(newSchedule);
  };

  const { data: currentVenueView, isLoading: isVenueLoading } = useOne<
    TVenueQuery
  >({
    resource: "venues",
    id: venueId,
    meta: {
      select: venueAllQuery,
    },
    queryOptions: {
      enabled: !!venueId,
    },
  });

  const { mutateAsync: createBooking } = useCreate<
    TableType<"bookings">,
    HttpError,
    Pick<TableType<"bookings">, "venue_id" | "total_amount">
  >({
    resource: "bookings",
  });
  const { mutateAsync: createBookingSchedule } = useCreateMany<
    TableType<"booking_schedule">,
    HttpError,
    Omit<TableType<"booking_schedule">, "id">
  >({
    resource: "booking_schedule",
  });
  const { mutateAsync: deleteBooking } = useDelete();

  const uploadReceipt = async (
    file: File,
    bookingId: number
  ): Promise<string | null> => {
    const fileExtension = file.name.split(".").pop();
    const filePath = `payment_reference_${bookingId}.${fileExtension}`;

    try {
      const { error: uploadError } = await supabaseClient.storage
        .from("receipts")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabaseClient.storage.from("receipts").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      try {
        await supabaseClient.storage.from("receipts").remove([filePath]);
      } catch (cleanupError) {
        console.error("Error cleaning up failed upload:", cleanupError);
      }
      throw new Error(`Failed to upload receipt: ${(error as Error).message}`);
    }
  };

  const { mutateAsync: createPayment } = useCreate<
    TableType<"payments">,
    HttpError
  >({
    resource: "payments",
  });

  const { mutateAsync: createPaymentReference } = useCreate<
    TableType<"payment_reference">,
    HttpError
  >({
    resource: "payment_reference",
  });

  const { data: paymentModes } = useList<TableType<"payment_modes">[], HttpError>(
    {
      resource: "payment_modes",
      meta: {
        select: "*",
      },
    }
  );

  // Update the useEffect where total amount is calculated
  useEffect(() => {
    if (currentVenueView?.data?.rate) {
      const rate = currentVenueView.data.rate;
      const schedules = watch("schedules");
      const totalHours = schedules.reduce((acc, schedule) => {
        const hours = calculateHoursBetween(schedule.start_time, schedule.end_time);
        // Ensure we're using at least 1 hour for billing purposes
        return acc + Math.max(hours, 1);
      }, 0);

      const totalAmount = roundToTwoDecimals(rate * totalHours);
      const minPayment = roundToTwoDecimals(totalAmount * 0.5);
      const maxPayment = totalAmount;

      setMinPaymentAmount(minPayment);
      setMaxPaymentAmount(maxPayment);

      // Update the form values
      bookingForm.setValue("total_amount", totalAmount);

      // If there's a payment amount set, ensure it stays within the new bounds
      const currentPayment = bookingForm.getValues("payment.amount");
      if (currentPayment) {
        if (currentPayment > maxPayment) {
          bookingForm.setValue("payment.amount", maxPayment);
          bookingForm.setValue("payment.is_down_payment", false);
        } else if (currentPayment < minPayment) {
          bookingForm.setValue("payment.amount", minPayment);
          bookingForm.setValue("payment.is_down_payment", true);
        }
      }
    }
  }, [
    currentVenueView?.data?.rate,
    // Watch all schedule fields explicitly
    watch("schedules"),
    bookingForm
  ]);

  const handleConfirm = async (data: BookFormValues) => {
    setShowConfirmDialog(false);

    toast.promise(
      async () => {
        let bookingResponse: { data: TableType<"bookings"> } | null = null;
        let paymentResponse: { data: TableType<"payments"> } | null = null;
        let uploadedFilePath: string | null = null;

        try {
          setIsUploading(true);

          const bookingPromise = createBooking({
            values: {
              venue_id: data.venue_id,
              total_amount: data.total_amount || 0,
            },
          });
          const delayPromise = new Promise((resolve) => setTimeout(resolve, 1000));
          const [bookingDataResponse] = await Promise.all([
            bookingPromise,
            delayPromise,
          ]);
          bookingResponse = bookingDataResponse;

          const schedulePromise = createBookingSchedule({
            values: data.schedules.map((schedule) => ({
              booking_id: bookingDataResponse.data.id,
              date: schedule.date,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
            })),
          });

          if (currentVenueView?.data.is_paid && files?.[0]) {
            try {
              const publicUrl = await uploadReceipt(
                files[0],
                bookingResponse.data.id
              );
              uploadedFilePath = publicUrl;

              if (!publicUrl) {
                throw new Error("Failed to upload receipt");
              }

              paymentResponse = await createPayment({
                values: {
                  booking_id: bookingResponse.data.id,
                  amount: data.payment!.amount,
                  payment_mode_id: data.payment!.payment_mode_id,
                  payment_status_id: 6,
                  is_down_payment: data.payment!.is_down_payment,
                },
              });

              await createPaymentReference({
                values: {
                  payment_id: paymentResponse.data.id,
                  receipt_link: publicUrl,
                },
              });
            } catch (error) {
              if (uploadedFilePath) {
                try {
                  const fileName = `payment_reference_${bookingResponse.data.id
                    }.${files[0].name.split(".").pop()}`;
                  await supabaseClient.storage
                    .from("receipts")
                    .remove([fileName]);
                } catch (cleanupError) {
                  console.error("Error cleaning up uploaded file:", cleanupError);
                }
              }

              if (paymentResponse?.data?.id) {
                try {
                  await supabaseClient
                    .from("payments")
                    .delete()
                    .eq("id", paymentResponse.data.id);
                } catch (cleanupError) {
                  console.error("Error cleaning up payment record:", cleanupError);
                }
              }

              throw error;
            }
          }

          await schedulePromise;
          navigate.replace(`/book/show/${bookingResponse?.data?.id}`);
          return bookingResponse.data.id;
        } catch (error) {
          console.error("Error in booking process:", error);

          if (bookingResponse?.data?.id) {
            try {
              await deleteBooking({
                resource: "bookings",
                id: bookingResponse.data.id,
              });

              if (uploadedFilePath) {
                const fileName = `payment_reference_${bookingResponse.data.id
                  }.${files?.[0].name.split(".").pop()}`;
                await supabaseClient.storage
                  .from("receipts")
                  .remove([fileName]);
              }
            } catch (deleteError) {
              console.error("Error during cleanup:", deleteError);
              toast.error("Error during cleanup. Please contact support.");
            }
          }

          toast.error("Failed to complete booking", {
            description: (error as Error).message,
          });
          throw error;
        } finally {
          setIsUploading(false);
        }
      },
      {
        loading: "Creating your booking...",
        success: (bookingId) => `Booking #${bookingId} created successfully!`,
        error: (error) => `Booking failed: ${(error as Error).message}`,
        duration: 4000,
      }
    );
  };

  const navigate = useNavigation();

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log(errors);
      toast.error(errors.root?.message as string);
    }
  }, [errors]);

  const handleFormSubmit = (data: BookFormValues) => {
    setShowConfirmDialog(true);
  };

  return (
    <div className="lg:max-w-6xl mx-auto pt-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate.push("/venues/list")}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold">Request to Book</h1>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Form {...bookingForm}>
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={control}
                          name={`schedules.${index}.date`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col gap-1.5 mt-1">
                              <FormLabel>Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(
                                          new Date(field.value),
                                          "PPP"
                                        )
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="start"
                                  className="w-auto p-0"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={(date) =>
                                      field.onChange(
                                        date?.toISOString().split("T")[0]
                                      )
                                    }
                                    disabled={(date) => date <= new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col items-end gap-2 sm:flex-row">
                          <FormField
                            control={control}
                            name={`schedules.${index}.start_time`}
                            render={({ field }) => (
                              <FormItem className="flex-1 w-full">
                                <FormLabel>Start Time</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select start time" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeOptions.map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`schedules.${index}.end_time`}
                            render={({ field }) => (
                              <FormItem className="flex-1 w-full">
                                <FormLabel>End Time</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select end time" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {timeOptions.map((time) => {
                                      const startTime = watch(
                                        `schedules.${index}.start_time`
                                      );
                                      const hours = calculateHoursBetween(startTime, time);
                                      const isDisabled = time <= startTime || hours < 1;
                                      return (
                                        <SelectItem
                                          key={time}
                                          value={time}
                                          disabled={isDisabled}
                                        >
                                          {time}
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => remove(index)}
                              className="mt-2 sm:mt-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addNewSchedule}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Schedule
                  </Button>
                </div>
                <div className="flex flex-col gap-4">
                  <Separator />
                  <h1 className="text-lg font-semibold">Payment Details</h1>
                  {currentVenueView?.data.is_paid ? (
                    <div className="space-y-4">
                      <div>
                        <Table className="text-xs">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Hours</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {watch("schedules").map((schedule, index) => {
                              const hours = calculateHoursBetween(
                                schedule.start_time,
                                schedule.end_time
                              );
                              const subtotal =
                                hours * (currentVenueView?.data.rate || 0);
                              return (
                                <TableRow key={index}>
                                  <TableCell>
                                    {format(new Date(schedule.date), "MMM d, yyyy")}
                                  </TableCell>
                                  <TableCell>
                                    {schedule.start_time} - {schedule.end_time}
                                  </TableCell>
                                  <TableCell>{hours}</TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(subtotal)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                            <TableRow className="font-medium bg-muted/30">
                              <TableCell colSpan={3} className="text-right">
                                Total Amount:
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(maxPaymentAmount)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Rate: {formatCurrency(currentVenueView?.data.rate || 0)}{" "}
                          per hour
                        </p>
                      </div>

                      <FormField
                        control={control}
                        name="payment.amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Amount</FormLabel>
                            <FormControl>
                              <div className="flex flex-row gap-2">
                                <div className="relative w-full">
                                  <span className="absolute -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
                                    ₱
                                  </span>
                                  <Input
                                    type="number"
                                    className="pl-7 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    {...field}
                                    min={minPaymentAmount}
                                    max={maxPaymentAmount}
                                    value={field.value || 0}
                                    step="0.01"
                                    // Debounce the expensive operations
                                    onChange={(e) => {
                                      // Just update the field value immediately
                                      const rawValue = e.target.value;
                                      field.onChange(rawValue === "" ? 0 : parseFloat(rawValue));

                                      // Debounce the expensive operations
                                      const timeoutId = setTimeout(() => {
                                        const value = rawValue === "" ? 0 : parseFloat(rawValue);
                                        if (!isNaN(value)) {
                                          const roundedValue = roundToTwoDecimals(value);
                                          if (roundedValue !== value) {
                                            field.onChange(roundedValue);
                                          }
                                          bookingForm.setValue(
                                            "payment.is_down_payment",
                                            roundedValue < maxPaymentAmount
                                          );
                                        }
                                      }, 300);

                                      return () => clearTimeout(timeoutId);
                                    }}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const amount = roundToTwoDecimals(maxPaymentAmount * 0.5);
                                      field.onChange(amount);
                                      bookingForm.setValue(
                                        "payment.is_down_payment",
                                        true
                                      );
                                    }}
                                  >
                                    50%
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      const amount = roundToTwoDecimals(maxPaymentAmount * 0.75);
                                      field.onChange(amount);
                                      bookingForm.setValue(
                                        "payment.is_down_payment",
                                        true
                                      );
                                    }}
                                  >
                                    75%
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      field.onChange(maxPaymentAmount);
                                      bookingForm.setValue(
                                        "payment.is_down_payment",
                                        false
                                      );
                                    }}
                                  >
                                    100%
                                  </Button>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription className="flex items-center gap-2 text-sm">
                              <span>Acceptable payment range:</span>
                              <span className="font-medium text-green-500">
                                {formatCurrency(minPaymentAmount)}
                              </span>
                              <span>to</span>
                              <span className="font-medium text-green-500">
                                {formatCurrency(maxPaymentAmount)}
                              </span>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="payment.payment_mode_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Mode</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(Number(value))}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {paymentModes?.data.map((mode) => (
                                  <SelectItem key={mode.id} value={mode.id.toString()}>
                                    {mode.mode}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="receipt_reference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload Proof of Payment</FormLabel>
                            <FormControl>
                              <FileUploader
                                value={files}
                                onValueChange={setFiles}
                                dropzoneOptions={{
                                  maxFiles: 1,
                                  maxSize: 1024 * 1024 * 4,
                                  accept: {
                                    "image/*": [".png", ".jpg", ".jpeg"],
                                    "application/pdf": [".pdf"],
                                  },
                                }}
                                className="p-2 rounded-lg bg-background"
                              >
                                <FileInput className="outline-dashed outline-1 outline-slate-500">
                                  <div className="flex flex-col items-center justify-center w-full p-8">
                                    <CloudUpload className="w-10 h-10 text-gray-500" />
                                    <p className="mb-1 text-sm text-gray-500">
                                      <span className="font-semibold">
                                        Click to upload
                                      </span>
                                      &nbsp;or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      PNG, JPG, PDF up to 4MB
                                    </p>
                                  </div>
                                </FileInput>
                                <FileUploaderContent>
                                  {files?.map((file, i) => (
                                    <FileUploaderItem key={i} index={i}>
                                      <Paperclip className="w-4 h-4 stroke-current" />
                                      <span>{file.name}</span>
                                    </FileUploaderItem>
                                  ))}
                                </FileUploaderContent>
                              </FileUploader>
                            </FormControl>
                            <FormDescription>
                              Please upload your proof of payment for verification.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <Card className="flex items-center justify-center p-4 text-center bg-transparent border-dashed rounded-lg h-[150px]">
                      <p className="text-sm font-medium text-muted-foreground/80">
                        Venue is Free
                      </p>
                    </Card>
                  )}
                </div>
                <div className="space-y-4">
                  <Separator />
                  <h4 className="text-sm font-semibold">
                    Ground Rules for Venue Booking
                  </h4>
                  <ul className="pl-5 space-y-2 text-sm list-disc text-muted-foreground">
                    <li>Follow all venue-specific rules and guidelines</li>
                    <li>Treat the venue with respect, as if it were your own</li>
                    <li>Adhere to the agreed-upon booking schedule</li>
                  </ul>
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    By selecting the button below, I agree to the venue booking
                    terms and conditions. I understand that the venue manager has
                    the right to deny or revoke my booking, and that terms may be
                    subject to change at any time. I also acknowledge that I am
                    responsible for any damages to the venue or its amenities during
                    my booking period.
                  </p>
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Confirm Booking"}
                </Button>
              </form>
            </Form>
          </div>
          <div className="space-y-4 lg:sticky lg:top-24">
            <AnimatePresence mode="wait">
              {currentVenueView && !isVenueLoading ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <BookVenuePreview currentVenueView={currentVenueView} />
                </motion.div>
              ) : (
                <BookVenueSkeleton />
              )}
            </AnimatePresence>
            <BookingScheduleSummary schedules={watch("schedules")} />
          </div>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Booking Details</DialogTitle>
            <DialogDescription>
              Please review your booking details before confirming.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="pr-4 space-y-6">
              <div className="space-y-2">
                <h4 className="font-medium">Venue Information</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {currentVenueView?.data.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Location:</span>{" "}
                    {currentVenueView?.data.location}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    {currentVenueView?.data.venue_types?.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Venue Fee:</span>{" "}
                    {currentVenueView?.data.is_paid ? (
                      <span>
                        {formatCurrency(currentVenueView.data.rate!)} per hour
                      </span>
                    ) : (
                      <span className="text-green-500">Free</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Schedule Details</h4>
                <div className="space-y-1 text-sm">
                  {watch("schedules").map((schedule, index) => (
                    <div key={index} className="p-2 rounded-md bg-muted">
                      <p>
                        Date: {format(new Date(schedule.date), "MMMM d, yyyy")}
                      </p>
                      <p>
                        Time: {schedule.start_time} - {schedule.end_time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {currentVenueView?.data.is_paid ? (
                <div className="space-y-2">
                  <h4 className="font-medium">Payment Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Total Amount:</span>{" "}
                      {formatCurrency(maxPaymentAmount)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Payment Amount:
                      </span>{" "}
                      {formatCurrency(watch("payment.amount") || 0)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Payment Type:</span>{" "}
                      {watch("payment.amount") < maxPaymentAmount
                        ? "Down Payment"
                        : "Full Payment"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        Payment Mode:
                      </span>{" "}
                      {
                        paymentModes?.data.find(
                          (mode) =>
                            mode.id === watch("payment.payment_mode_id")
                        )?.mode
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 text-sm border rounded-md bg-muted/50">
                  <p className="font-medium text-green-500">
                    This is a free venue booking
                  </p>
                  <p className="text-muted-foreground">
                    No payment is required for this booking.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium text-destructive">Important Notes</h4>
                <ul className="pl-4 space-y-1 text-sm list-disc text-muted-foreground">
                  <li>This booking will be subject to venue manager approval</li>
                  <li>Cancellation policies may apply</li>
                  <li>Please arrive on time for your scheduled booking</li>
                  {!currentVenueView?.data.is_paid && (
                    <li>
                      While this venue is free, please treat it with respect and
                      follow all venue rules
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleConfirm(bookingForm.getValues())}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent" />
                  Processing...
                </span>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const BookVenuePreview = ({
  currentVenueView,
}: {
  currentVenueView: { data: TVenueQuery };
}) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="flex items-center text-lg font-semibold leading-7">
          <Building className="mr-2 size-4" />
          {currentVenueView?.data.name || "Venue Details"}
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Separator />
          <dl className="divide-y">
            <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="flex items-center text-sm font-medium leading-6">
                <MapPin className="mr-2 size-4" />
                Address
              </dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                {currentVenueView?.data.location || "Address not provided"}
              </dd>
            </div>
            <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="flex items-center text-sm font-medium leading-6">
                <CheckCircle className="mr-2 size-4" />
                Type
              </dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                {currentVenueView?.data.venue_types?.name ||
                  "Type not specified"}
              </dd>
            </div>
            <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="flex items-center text-sm font-medium leading-6">
                <User className="mr-2 size-4" />
                Manager
              </dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                {currentVenueView?.data.profiles?.name || "Manager not assigned"}
              </dd>
            </div>
            <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="flex items-center text-sm font-medium leading-6">
                <Phone className="mr-2 size-4" />
                Contact
              </dt>
              <dd className="mt-1 text-sm leading-6 sm:col-span-2 sm:mt-0">
                {currentVenueView?.data.profiles?.phone_number ||
                  "Contact not available"}
              </dd>
            </div>
          </dl>
          <Separator />
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {currentVenueView?.data.venue_amenities?.map(
                ({ amenities }) => (
                  <Badge
                    variant="outline"
                    key={amenities.id}
                    className="mb-2"
                  >
                    {amenities.name}
                  </Badge>
                )
              ) || "No amenities listed"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BookingScheduleSummary = ({
  schedules,
}: {
  schedules: { date: string; start_time: string; end_time: string }[];
}) => {
  const formatDateTimeRange = (schedule: {
    date: string;
    start_time: string;
    end_time: string;
  }) => {
    const date = new Date(schedule.date);
    return `${format(date, "MMMM d, yyyy")} - ${schedule.start_time} to ${schedule.end_time
      }`;
  };
  return (
    <Card className="p-4">
      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="flex items-center mb-2 text-sm font-medium leading-6 sm:mb-0">
          <Clock className="mr-2 size-4" />
          Booking Times
        </dt>
        <dd className="text-sm leading-6 sm:col-span-2">
          {schedules.map((schedule, index) => (
            <div key={index} className="mb-1">
              {formatDateTimeRange(schedule)}
            </div>
          ))}
        </dd>
      </div>
    </Card>
  );
};

const BookVenueSkeleton = () => {
  return (
    <Card className="p-6">
      <div className="animate-pulse">
        <div className="h-6 mb-2 rounded-md bg-muted-foreground/25" />
        <div className="h-4 mb-4 rounded-md bg-muted-foreground/25" />

        <div className="space-y-4">
          {/* Venue Details */}
          <div className="space-y-2">
            <div className="w-24 h-4 rounded-md bg-muted-foreground/25" />
            <div className="h-20 rounded-md bg-muted-foreground/25" />
          </div>

          {/* Schedule Selection */}
          <div className="space-y-2">
            <div className="w-32 h-4 rounded-md bg-muted-foreground/25" />
            <div className="grid gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 rounded-md bg-muted-foreground/25" />
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <div className="h-4 rounded-md w-28 bg-muted-foreground/25" />
            <div className="h-40 rounded-md bg-muted-foreground/25" />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <div className="h-4 rounded-md w-36 bg-muted-foreground/25" />
            <div className="h-32 rounded-md bg-muted-foreground/25" />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <div className="w-24 h-10 rounded-md bg-muted-foreground/25" />
            <div className="w-24 h-10 rounded-md bg-muted-foreground/25" />
          </div>
        </div>
      </div>
    </Card>
  );
};




