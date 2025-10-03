import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, Check } from "lucide-react";
import type { PricingTier } from "@shared/schema";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/pricing',
      },
      redirect: 'if_required',
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Your credits have been added!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
        data-testid="button-complete-payment"
      >
        {isProcessing ? "Processing..." : "Complete Purchase"}
      </Button>
    </form>
  );
};

export default function Pricing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { data: tiers = [] } = useQuery<PricingTier[]>({
    queryKey: ['/api/pricing'],
  });

  const tiersByZhi = {
    'ZHI 1': tiers.filter(t => t.id.startsWith('zhi1')),
    'ZHI 2': tiers.filter(t => t.id.startsWith('zhi2')),
    'ZHI 3': tiers.filter(t => t.id.startsWith('zhi3')),
    'ZHI 4': tiers.filter(t => t.id.startsWith('zhi4')),
  };

  const handlePurchase = async (tier: PricingTier) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to purchase credits",
        variant: "destructive",
      });
      return;
    }

    setSelectedTier(tier);
    
    try {
      const data = await apiRequest("/api/create-payment-intent", {
        method: "POST",
        body: { tierId: tier.id }
      });
      setClientSecret(data.clientSecret);
      setCheckoutOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment",
        variant: "destructive",
      });
    }
  };

  const handleCheckoutSuccess = () => {
    setCheckoutOpen(false);
    setClientSecret("");
    setSelectedTier(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Purchase Credits</h1>
          <p className="text-lg text-gray-600">Choose your credit package based on your AI provider</p>
        </div>

        <div className="space-y-12">
          {Object.entries(tiersByZhi).map(([zhiName, zhiTiers]) => (
            <div key={zhiName}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{zhiName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {zhiTiers.map((tier) => (
                  <Card key={tier.id} className="relative" data-testid={`card-tier-${tier.id}`}>
                    <CardHeader>
                      <CardTitle className="text-2xl">${tier.priceUsd}</CardTitle>
                      <CardDescription className="text-lg font-semibold text-blue-600">
                        {tier.credits.toLocaleString()} credits
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>{(tier.credits / 1000).toLocaleString()}K words</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          <span>Never expires</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handlePurchase(tier)}
                        data-testid={`button-purchase-${tier.id}`}
                      >
                        <Coins className="h-4 w-4 mr-2" />
                        Purchase
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              {selectedTier && (
                <>
                  Purchasing {selectedTier.credits.toLocaleString()} credits for ${selectedTier.priceUsd}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm onSuccess={handleCheckoutSuccess} />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
