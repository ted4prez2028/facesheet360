
import ConnectWallet from "@/components/wallet/ConnectWallet";
import SendTransaction from "@/components/wallet/SendTransaction";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { CareCoinsRewards } from "@/components/wallet/CareCoinsRewards";
import { TokenDeployer } from "@/components/wallet/TokenDeployer";

export default function WalletTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <TokenDeployer />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConnectWallet />
        <WalletBalance />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SendTransaction />
        <CareCoinsRewards />
      </div>
    </div>
  );
}
