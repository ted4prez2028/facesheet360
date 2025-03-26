
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenDeployer } from "@/components/wallet/TokenDeployer";

export default function TokenTab() {
  return (
    <div className="space-y-6">
      <TokenDeployer />
      
      <Card>
        <CardHeader>
          <CardTitle>CareCoin Information</CardTitle>
          <CardDescription>
            Learn about the CareCoin cryptocurrency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">What is CareCoin?</h3>
            <p className="text-sm">
              CareCoin is an ERC-20 token designed for the healthcare industry, allowing
              seamless rewards and payments between patients, healthcare providers and administrators.
              It aims to incentivize quality care and patient engagement.
            </p>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Token Economics</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Initial Supply:</p>
                <p className="font-medium">1,000,000 CARE</p>
              </div>
              <div>
                <p className="text-muted-foreground">Decimals:</p>
                <p className="font-medium">18</p>
              </div>
              <div>
                <p className="text-muted-foreground">Max Supply:</p>
                <p className="font-medium">100,000,000 CARE</p>
              </div>
              <div>
                <p className="text-muted-foreground">Distribution:</p>
                <p className="font-medium">Healthcare rewards, patient incentives</p>
              </div>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Use Cases</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Reward healthcare providers for quality care</li>
              <li>Incentivize patients for adherence to treatment plans</li>
              <li>Pay for healthcare services</li>
              <li>Access premium features in health applications</li>
              <li>Facilitate micropayments in healthcare ecosystems</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <a href="https://ethereum.org/en/developers/docs/standards/tokens/erc-20/" target="_blank" rel="noopener noreferrer">
              Learn More About ERC-20 Tokens
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
