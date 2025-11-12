import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestTube, UserPlus, MessageSquare } from "lucide-react";

export const BetaTesterManagement = () => {
  const { data: betaTesters } = useQuery({
    queryKey: ["beta-testers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beta_testers")
        .select(`
          *,
          profiles!beta_testers_user_id_fkey(name, email)
        `)
        .order("invited_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const stats = {
    invited: betaTesters?.filter((t) => t.status === "invited").length || 0,
    active: betaTesters?.filter((t) => t.status === "active").length || 0,
    completed: betaTesters?.filter((t) => t.status === "completed").length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Beta Testing Program</h3>
        </div>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Tester
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">{stats.invited}</div>
            <div className="text-sm text-muted-foreground">Invited</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {betaTesters?.map((tester: any) => (
          <Card key={tester.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{tester.profiles?.name}</div>
                  <div className="text-xs text-muted-foreground">{tester.profiles?.email}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Group: <span className="font-medium">{tester.beta_group}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tester.status === "active" ? "default" : "secondary"} 
                    className={tester.status === "active" ? "bg-success text-success-foreground" : ""}>
                    {tester.status}
                  </Badge>
                  {tester.feedback_provided && (
                    <Badge variant="outline">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Feedback
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Transactions:</span>
                  <span className="ml-2 font-medium">
                    {tester.transactions_used || 0} / {tester.transaction_limit || "∞"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Invited:</span>
                  <span className="ml-2">{new Date(tester.invited_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {betaTesters?.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No beta testers yet. Start by inviting users to the program.
          </div>
        )}
      </div>
    </div>
  );
};
