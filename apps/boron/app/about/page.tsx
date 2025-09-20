import React from "react";
import { Check } from "lucide-react";

function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for trying out BoronGPT",
      features: [
        "5 apps per month",
        "Basic templates",
        "Community support",
        "Standard deployment",
      ],
      buttonText: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For professionals and growing teams",
      features: [
        "Unlimited apps",
        "Premium templates",
        "Priority support",
        "Custom domains",
        "Advanced analytics",
        "Team collaboration",
      ],
      buttonText: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with specific needs",
      features: [
        "Everything in Pro",
        "Dedicated support",
        "Custom integrations",
        "On-premise deployment",
        "SLA guarantee",
        "Custom training",
      ],
      buttonText: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core
            AI-powered app building features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border ${
                plan.popular
                  ? "border-yellow-400 bg-yellow-400/5 scale-105"
                  : "border-gray-700 bg-gray-900/30"
              } backdrop-blur-sm`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-400">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-400">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center space-x-3"
                  >
                    <Check className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
                    : "border border-gray-600 hover:border-yellow-400 hover:text-yellow-400"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-xl font-semibold mb-3 text-yellow-400">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>
            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-xl font-semibold mb-3 text-yellow-400">
                What happens to my apps if I downgrade?
              </h3>
              <p className="text-gray-300">
                Your existing apps will continue to work. You&apos;ll just be
                limited by your new plan&apos;s features for future apps.
              </p>
            </div>
            <div className="border-b border-gray-700 pb-6">
              <h3 className="text-xl font-semibold mb-3 text-yellow-400">
                Do you offer refunds?
              </h3>
              <p className="text-gray-300">
                We offer a 30-day money-back guarantee for all paid plans. No
                questions asked.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PricingPage;
