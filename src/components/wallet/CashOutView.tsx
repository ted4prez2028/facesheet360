
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
  routingNumber: z.string().optional(),
  bankName: z.string().optional(),
}).refine((data) => {
  // Require routing number and bank name only for bank transfers
  if (data.paymentMethod === 'bank_transfer') {
    return data.routingNumber && data.routingNumber.length >= 9 && data.bankName && data.bankName.length >= 2;
  }
  return true;
}, {
  message: "Routing number and bank name are required for bank transfers",
  path: ["routingNumber"],
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
        {exchangeRate && (
          <div className="mb-4 p-3 border border-blue-500/20 rounded-lg bg-blue-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Current Exchange Rate</p>
                <p className="text-xs text-muted-foreground">
                  Source: {(exchangeRate as any)?.source === 'uniswap_v3' ? '🔵 Uniswap V3 Oracle' : '📊 Default Rate'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${(exchangeRate as any)?.rate_to_usd?.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">per CARE</p>
              </div>
            </div>
          </div>
        )}
        
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
                      `Estimated USD: $${usdAmount?.toFixed(2) || ((exchangeRate as any)?.rate_to_usd * (field.value || 0)).toFixed(2)}`
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
                      <SelectItem value="amazon_gift_card">Amazon Gift Card</SelectItem>
                      <SelectItem value="visa_gift_card">Visa Gift Card</SelectItem>
                      <SelectItem value="mastercard_gift_card">Mastercard Gift Card</SelectItem>
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
                    <FormLabel>
                      {form.watch('paymentMethod')?.includes('gift_card') 
                        ? 'Email Address' 
                        : 'Account Name'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={
                          form.watch('paymentMethod')?.includes('gift_card')
                            ? 'Enter email for gift card delivery'
                            : 'Enter account name'
                        } 
                        {...field} 
                      />
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
                      <FormLabel>
                        {form.watch('paymentMethod') === 'bank_transfer' 
                          ? 'Account Number' 
                          : form.watch('paymentMethod')?.includes('gift_card')
                          ? 'Confirm Email'
                          : 'Account ID'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            form.watch('paymentMethod') === 'bank_transfer'
                              ? 'Enter account number'
                              : form.watch('paymentMethod')?.includes('gift_card')
                              ? 'Confirm email address'
                              : 'Enter account ID'
                          } 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('paymentMethod') === 'bank_transfer' && (
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
                )}
              </div>

              {form.watch('paymentMethod') === 'bank_transfer' && (
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
              )}

              {form.watch('paymentMethod')?.includes('gift_card') && (
                <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <p className="text-sm text-muted-foreground">
                    Your gift card will be delivered via email within 24-48 hours after approval.
                    Make sure the email addresses match.
                  </p>
                </div>
              )}
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
