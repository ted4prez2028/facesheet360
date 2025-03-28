
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenDeployer } from "@/components/wallet/TokenDeployer";
import CareCoinGuide from "@/components/wallet/CareCoinGuide";

export default function TokenTab() {
  return (
    <div className="space-y-6">
      <TokenDeployer />
      <CareCoinGuide />
    </div>
  );
}
