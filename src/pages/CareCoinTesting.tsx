import { CareCoinTestingDashboard } from "@/components/carecoin/CareCoinTestingDashboard";
import { TokenDeployer } from "@/components/wallet/TokenDeployer";

export default function CareCoinTesting() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">CareCoin Phase 1: Testnet Testing</h1>
        <p className="text-muted-foreground">
          Deploy to Polygon Mumbai Testnet and run comprehensive tests on all 35 CareCoin triggers
        </p>
      </div>

      <TokenDeployer />
      <CareCoinTestingDashboard />
    </div>
  );
}
