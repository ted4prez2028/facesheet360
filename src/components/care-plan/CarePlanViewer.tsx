
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Calendar, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { CarePlan, useUpdateCarePlanStatus } from "@/hooks/useCarePlans";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";

interface CarePlanViewerProps {
  carePlan: CarePlan;
}

export const CarePlanViewer = ({ carePlan }: CarePlanViewerProps) => {
  const { user } = useAuth();
  const { mutate: updateStatus } = useUpdateCarePlanStatus();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleActivate = () => {
    updateStatus({ id: carePlan.id, status: "active" });
  };

  const handleComplete = () => {
    updateStatus({ id: carePlan.id, status: "completed" });
  };

  const handleCancel = () => {
    updateStatus({ id: carePlan.id, status: "cancelled" });
  };

  const formattedDate = format(new Date(carePlan.created_at), "PPP");

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              Care Plan
              {carePlan.is_ai_generated && (
                <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              <span className="inline-flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formattedDate}
              </span>
              <Badge className={`ml-3 ${getStatusColor(carePlan.status)}`}>
                {carePlan.status.charAt(0).toUpperCase() + carePlan.status.slice(1)}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] md:h-[500px] pr-4">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{carePlan.content}</ReactMarkdown>
          </div>
        </ScrollArea>
      </CardContent>
      {carePlan.status === "draft" && (
        <CardFooter className="flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <XCircle className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleActivate} className="bg-health-600 hover:bg-health-700" size="sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Activate Plan
          </Button>
        </CardFooter>
      )}
      {carePlan.status === "active" && (
        <CardFooter className="flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <XCircle className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleComplete} className="bg-health-600 hover:bg-health-700" size="sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Completed
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CarePlanViewer;
