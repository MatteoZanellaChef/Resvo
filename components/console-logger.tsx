"use client";

import { useEffect } from "react";

export function ConsoleLogger() {
    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            const originalLog = console.log;
            const originalInfo = console.info;

            const ignoredMessages = [
                "[HMR] connected",
                "Download the React DevTools",
            ];

            console.log = (...args) => {
                const message = args.map(arg => String(arg)).join(" ");
                if (ignoredMessages.some(ignored => message.includes(ignored))) {
                    return;
                }
                originalLog.apply(console, args);
            };

            console.info = (...args) => {
                const message = args.map(arg => String(arg)).join(" ");
                if (ignoredMessages.some(ignored => message.includes(ignored))) {
                    return;
                }
                originalInfo.apply(console, args);
            };
        }
    }, []);

    return null;
}
