
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCashOut } from '@/hooks/useCashOut';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  amount: z.number().positive("Amount must be positive").int("Amount must be a whole number"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  accountName: z.string().min(2, "Account name must be at least 2 characters"),
  accountNumber: z.string().min(5, "Account number must be at least 5 characters"),
  routingNumber: z.string().min(9, "Routing number must be at least 9 characters"),
  bankName: z.string().min(2, "Bank name is required"),
});

export const CashOutView = () => {
  const {
    formState: { amount, paymentMethod, accountInfo, isProcessing },
    exchangeRate,
    usdAmount,
    isLoading,
    setters: { setAmount, setPaymentMethod, setAccountInfo },
    handleCashOut,
  } = useCashOut();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: 'bank_transfer',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setAmount(values.amount);
    setPaymentMethod(values.paymentMethod);
    setAccountInfo({
      accountName: values.accountName,
      accountNumber: values.accountNumber,
      routingNumber: values.routingNumber,
      bankName: values.bankName,
    });
    
    await handleCashOut();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Cash Out CareCoins</CardTitle>
        <CardDescription>
          Convert your CareCoins to USD and transfer to your bank account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (CareCoins)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter CareCoins amount" 
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                        setAmount(isNaN(value) ? 0 : value);
                      }}
                      min={1}
                    />
                  </FormControl>
                  <FormDescription>
                    {isLoading || !exchangeRate ? "Loading exchange rate..." : (
                      `Estimated USD: $${usdAmount?.toFixed(2) || (exchangeRate?.rate_to_usd * (field.value || 0)).toFixed(2)}`
                    )}
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setPaymentMethod(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="venmo">Venmo</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="accountName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter account number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter routing number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bank name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Cash Out CareCoins'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
