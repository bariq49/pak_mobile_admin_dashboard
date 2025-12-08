"use client";

import { useContext } from "react";
import {
    CurrencyContext,
    CurrencyContextProps,
} from "@/provider/currency.provider";

export const useCurrency = (): CurrencyContextProps => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error("useCurrency must be used within a CurrencyProvider");
    }
    return context;
};
