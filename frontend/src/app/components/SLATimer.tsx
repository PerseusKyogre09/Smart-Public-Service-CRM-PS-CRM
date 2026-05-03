import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface SLATimerProps {
    deadline: string;
    status: string;
    onOverdue?: () => void;
    showIcon?: boolean;
    startTime?: string;
}

export const SLATimer: React.FC<SLATimerProps> = ({
    deadline,
    status,
    onOverdue,
    showIcon = true,
    startTime
}) => {
    const [timeLeft, setTimeLeft] = useState<{
        hours: number;
        minutes: number;
        seconds: number;
        isOverdue: boolean;
        progress: number;
    } | null>(null);

    useEffect(() => {
        if (["Resolved", "Closed"].includes(status)) {
            setTimeLeft(null);
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date(deadline);
            const diff = target.getTime() - now.getTime();

            const isOverdue = diff <= 0;
            const absoluteDiff = Math.abs(diff);

            const hours = Math.floor(absoluteDiff / (1000 * 60 * 60));
            const minutes = Math.floor((absoluteDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((absoluteDiff % (1000 * 60)) / 1000);

            // Calculate progress if startTime is provided
            let progress = 100;
            if (startTime) {
                const total = new Date(deadline).getTime() - new Date(startTime).getTime();
                const elapsed = now.getTime() - new Date(startTime).getTime();
                progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
            }

            const newTimeLeft = { hours, minutes, seconds, isOverdue, progress };

            if (isOverdue && !timeLeft?.isOverdue && onOverdue) {
                onOverdue();
            }

            setTimeLeft(newTimeLeft);
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [deadline, status]);

    if (["Resolved", "Closed"].includes(status)) {
        return (
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold uppercase text-[10px]">
                {showIcon && <CheckCircle size={12} />}
                <span>COMPLETED</span>
            </div>
        );
    }

    if (!timeLeft) return null;

    const { hours, minutes, seconds, isOverdue, progress } = timeLeft;

    // Determine colors based on remaining time
    let textColor = "text-emerald-600";
    let bgColor = "bg-emerald-50";
    let borderColor = "border-emerald-100";

    if (isOverdue) {
        textColor = "text-red-600 animate-pulse";
        bgColor = "bg-red-50";
        borderColor = "border-red-100";
    } else if (hours < 12) {
        textColor = "text-amber-600";
        bgColor = "bg-amber-50";
        borderColor = "border-amber-100";
    }

    return (
        <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${bgColor} ${borderColor} ${textColor} transition-colors duration-500 cursor-help`}
            title={`Deadline: ${new Date(deadline).toLocaleString()}`}
        >
            {showIcon && (isOverdue ? <AlertCircle size={14} /> : <Clock size={14} />)}
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-tighter leading-none mb-0.5">
                    {isOverdue ? "OVERDUE" : "SLA DEADLINE"}
                </span>
                <span className="text-[11px] font-bold font-mono tracking-tight leading-none">
                    {isOverdue ? "-" : ""}{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
                {!isOverdue && progress !== 100 && (
                    <div className="mt-1.5 h-1 w-20 bg-black/10 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ${hours < 6 ? 'bg-red-500' : hours < 12 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
