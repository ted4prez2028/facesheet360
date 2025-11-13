import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Flag, Users, Percent } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

export const FeatureFlagsAdmin = () => {
  const queryClient = useQueryClient();

  const { data: flags } = useQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("feature_flags")
        .update({ 
          is_enabled: enabled
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      toast.success("Feature flag updated");
    },
    onError: () => {
      toast.error("Failed to update feature flag");
    },
  });

  const updateRollout = useMutation({
    mutationFn: async ({ id, percentage }: { id: string; percentage: number }) => {
      const { error } = await supabase
        .from("feature_flags")
        .update({ rollout_percentage: percentage })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Flag className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Feature Flags</h3>
      </div>

      <div className="space-y-4">
        {flags?.map((flag) => (
          <Card key={flag.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{flag.feature_name}</CardTitle>
                <Switch
                  checked={flag.is_enabled}
                  onCheckedChange={(checked) => toggleFlag.mutate({ id: flag.id, enabled: checked })}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {flag.description && (
                <p className="text-sm text-muted-foreground">{flag.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Rollout Percentage
                  </span>
                  <span className="font-medium">{flag.rollout_percentage}%</span>
                </div>
                <Slider
                  value={[flag.rollout_percentage]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={([value]) => updateRollout.mutate({ id: flag.id, percentage: value })}
                  disabled={!flag.is_enabled}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {flag.target_roles && flag.target_roles.length > 0 && (
                  <>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Roles: {flag.target_roles.join(", ")}
                    </Badge>
                  </>
                )}
                {flag.is_enabled && flag.updated_at && (
                  <Badge variant="default" className="bg-success text-success-foreground">
                    Enabled {new Date(flag.updated_at).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {flags?.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No feature flags configured yet
          </div>
        )}
      </div>
    </div>
  );
};
