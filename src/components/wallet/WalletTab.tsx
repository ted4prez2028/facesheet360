
import ConnectWallet from "@/components/wallet/ConnectWallet";
import SendTransaction from "@/components/wallet/SendTransaction";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { CareCoinsRewards } from "@/components/wallet/CareCoinsRewards";
import { CareCoinsActivity } from "@/components/wallet/CareCoinsActivity";

export default function WalletTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ConnectWallet />
          <WalletBalance />
        </div>
        <div className="lg:col-span-2">
          <CareCoinsActivity />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SendTransaction />
        <CareCoinsRewards />
      </div>
    </div>
  );
}
