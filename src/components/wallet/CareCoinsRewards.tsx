
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCareCoinsRewards } from '@/hooks/useCareCoinsRewards';
import { useAuth } from '@/hooks/useAuth';

export const CareCoinsRewards = () => {
  const [amount, setAmount] = React.useState<number>(0);
  const [category, setCategory] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const { user } = useAuth();
  const { distributeReward } = useCareCoinsRewards();

  const handleRewardDistribution = async () => {
    if (!user?.id || !amount || !category) return;

    await distributeReward.mutate({
      amount,
      providerId: user.id,
      rewardCategory: category,
      description
    });

    // Reset form
    setAmount(0);
    setCategory('');
    setDescription('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribute CareCoins Rewards</CardTitle>
        <CardDescription>
          Reward healthcare activities with CareCoins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reward category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data_entry">Data Entry</SelectItem>
                <SelectItem value="patient_care">Patient Care</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Input
              type="number"
              placeholder="Amount"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={0}
            />
          </div>
          
          <div>
            <Input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleRewardDistribution}
            disabled={!amount || !category || distributeReward.isPending}
            className="w-full"
          >
            {distributeReward.isPending ? 'Distributing...' : 'Distribute Reward'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareCoinsRewards;
