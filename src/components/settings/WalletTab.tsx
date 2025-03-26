
import ConnectWallet from "@/components/wallet/ConnectWallet";
import SendTransaction from "@/components/wallet/SendTransaction";
import { WalletBalance } from "@/components/wallet/WalletBalance";

export default function WalletTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConnectWallet />
        <WalletBalance />
      </div>
      
      <SendTransaction />
    </div>
  );
}
