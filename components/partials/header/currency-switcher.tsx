"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Check, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";

const supportedCurrencies = [
    "USD",
    "EUR",
    "GBP",
    "INR",
    "PKR",
    "AED",
    "AUD",
    "CAD",
    "JPY",
] as const;

const CurrencySwitcher = () => {
    const { currency, setCurrency, loading } = useCurrency();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative md:h-9 md:w-9 h-8 w-8 hover:bg-default-100 
            dark:hover:bg-default-200 data-[state=open]:bg-default-100 
            dark:data-[state=open]:bg-default-200 hover:text-primary 
            text-default-500 dark:text-default-800 rounded-full"
                    title="Change Currency"
                >
                    <DollarSign className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="p-2 min-w-[120px]">
                {supportedCurrencies.map((cur) => (
                    <DropdownMenuItem
                        key={cur}
                        onClick={() => setCurrency(cur)}
                        className={cn(
                            "p-2 font-medium text-sm cursor-pointer rounded-md hover:bg-primary hover:text-primary-foreground",
                            {
                                "bg-primary text-primary-foreground": cur === currency,
                            }
                        )}
                    >
                        <span>{cur}</span>
                        {cur === currency && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                ))}

                {loading && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        Updating…
                    </p>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CurrencySwitcher;
