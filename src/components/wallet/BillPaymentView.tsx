
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBillPayment } from '@/hooks/useBillPayment';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, Receipt } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserBillPayments } from '@/lib/api/careCoinsApi';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const formSchema = z.object({
  billType: z.string().min(1, "Bill type is required"),
  amount: z.number().positive("Amount must be positive").int("Amount must be a whole number"),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientAccount: z.string().min(1, "Recipient account is required"),
  accountNumber: z.string().optional(),
  dueDate: z.string().optional(),
});

const BILL_TYPES = [
  { value: 'rent', label: 'Rent/Mortgage' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'phone', label: 'Phone/Internet' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'medical', label: 'Medical Bills' },
  { value: 'other', label: 'Other' },
];

export const BillPaymentView = () => {
  const {
    formState: { billType, amount, recipientName, recipientAccount, billInfo, isProcessing },
    setters: { setBillType, setAmount, setRecipientName, setRecipientAccount, setBillInfo },
    handleBillPayment,
    resetForm,
  } = useBillPayment();

  const { user } = useAuth();
  
  const { data: billPayments = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ['userBillPayments', user?.id],
    queryFn: () => user?.id ? getUserBillPayments(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billType: '',
      amount: 0,
      recipientName: '',
      recipientAccount: '',
      accountNumber: '',
      dueDate: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setBillType(values.billType);
    setAmount(values.amount);
    setRecipientName(values.recipientName);
    setRecipientAccount(values.recipientAccount);
    setBillInfo({
      accountNumber: values.accountNumber,
      dueDate: values.dueDate,
    });
    
    const result = await handleBillPayment();
    if (result) {
      form.reset();
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Pay Bills with CareCoins
          </CardTitle>
          <CardDescription>
            Use your CareCoins to pay for your bills directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="billType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bill type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BILL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (CareCoins)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter amount" 
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                        min={1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name (Company)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Account/Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bill account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Pay Bill'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Bill Payments</CardTitle>
          <CardDescription>
            Your recent bill payment history
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[400px] overflow-y-auto">
          {isLoadingBills ? (
            <p className="text-center py-4 text-sm text-muted-foreground">Loading payment history...</p>
          ) : billPayments.length > 0 ? (
            <div className="space-y-4">
              {billPayments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{payment.recipient_name}</p>
                      <p className="text-sm text-muted-foreground">{payment.bill_type}</p>
                    </div>
                    <p className="font-semibold">{payment.amount} CC</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(payment.created_at), 'MMM d, yyyy')}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getStatusBadgeColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-sm text-muted-foreground">No payment history found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
