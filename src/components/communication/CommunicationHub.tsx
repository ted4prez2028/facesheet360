// Temporarily disabled during backend migration - conversations table doesn't exist
import { Card, CardContent } from '@/components/ui/card';

export const CommunicationHub = () => {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-muted-foreground">
          Communication features temporarily disabled during backend migration
        </p>
      </CardContent>
    </Card>
  );
};

export default CommunicationHub;
