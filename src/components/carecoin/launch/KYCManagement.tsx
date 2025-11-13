import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const KYCManagement = () => {
  const { data: kycRecords, isLoading } = useQuery({
    queryKey: ["kyc-verifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kyc_verifications")
        .select(`
          *,
          profiles!kyc_verifications_user_id_fkey(name, email)
        `)
        .order("submitted_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "in_review":
        return "default";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading KYC records...</div>;
  }

  const stats = {
    pending: kycRecords?.filter((r) => r.verification_status === "pending").length || 0,
    in_review: kycRecords?.filter((r) => r.verification_status === "in_review").length || 0,
    approved: kycRecords?.filter((r) => r.verification_status === "approved").length || 0,
    rejected: kycRecords?.filter((r) => r.verification_status === "rejected").length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">{stats.in_review}</div>
            <div className="text-sm text-muted-foreground">In Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Recent KYC Submissions</h3>
        {kycRecords?.map((record: any) => (
          <Card key={record.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{record.profiles?.name}</div>
                    <div className="text-xs text-muted-foreground">{record.profiles?.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(record.verification_status)}
                  <Badge variant={getStatusVariant(record.verification_status)}>
                    {record.verification_status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="ml-2 font-medium">{record.verification_provider}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Level:</span>
                  <span className="ml-2 font-medium">{record.verification_level || "N/A"}</span>
                </div>
                {record.country_code && (
                  <div>
                    <span className="text-muted-foreground">Country:</span>
                    <span className="ml-2 font-medium">{record.country_code}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="ml-2">{new Date(record.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>

              {record.verification_status === "pending" && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button size="sm" variant="default">
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {kycRecords?.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No KYC submissions yet
          </div>
        )}
      </div>
    </div>
  );
};
