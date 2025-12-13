"use client";

import React, { createContext, useEffect, useState } from "react";
export type SupportedCurrency =
    | "USD"
    | "EUR"
    | "INR"
    | "GBP"
    | "JPY"
    | "AED"
    | "AUD"
    | "CAD"
    | "PKR";
export interface CurrencyContextProps {
    currency: SupportedCurrency;
    setCurrency: (currency: SupportedCurrency) => void;
    rate: number;
    loading: boolean;
    lastUpdated?: string;
}

export const CurrencyContext = createContext<CurrencyContextProps | undefined>(
    undefined
);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrency] = useState<SupportedCurrency>("EUR");
    const [rate, setRate] = useState(1);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string | undefined>();
    const dummyRates: Record<SupportedCurrency, number> = {
        USD: 1,
        EUR: 0.91,
        GBP: 0.78,
        INR: 84.2,
        JPY: 150,
        AED: 3.67,
        AUD: 1.53,
        CAD: 1.37,
        PKR: 278.5,
    };
    useEffect(() => {
        const locale = navigator.language || "en-US";
        const localeToCurrency: Record<string, SupportedCurrency> = {
            "en-US": "USD",
            "en-GB": "GBP",
            "en-IN": "INR",
            "en-AU": "AUD",
            "en-CA": "CAD",
            "en-AE": "AED",
            "de-DE": "EUR",
            "fr-FR": "EUR",
            "es-ES": "EUR",
            "it-IT": "EUR",
            "ja-JP": "JPY",
            "ur-PK": "PKR",
        };
        const detectedCurrency =
            localeToCurrency[locale] ||
            localeToCurrency[locale.split("-")[0]] ||
            "EUR";
        setCurrency(detectedCurrency);
    }, []);
    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => {
            setRate(dummyRates[currency]);
            setLastUpdated(new Date().toLocaleString());
            setLoading(false);
        }, 300);
        return () => clearTimeout(timeout);
    }, [currency]);

    return (
        <CurrencyContext.Provider
            value={{ currency, setCurrency, rate, loading, lastUpdated }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};
