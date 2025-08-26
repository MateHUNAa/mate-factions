import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    title: string;
    Icon: LucideIcon;
    content: string;
    subContent?: React.ReactNode;
}

const InfoCard: React.FC<Props> = ({ title, Icon, content, subContent }) => {
    return (
        <Card className="bg-zinc-800/80 border-zinc-700/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
                <Icon className="text-white" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white/90">{content}</div>
                {subContent && <div className="mt-1">{subContent}</div>}
            </CardContent>
        </Card>
    );
};

export default InfoCard;

export const InfoCardBox: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
            {children}
        </div>
    )
}


export const InfoSubElement: React.FC<{ color?: string; content: string; subContent: string; }> = ({ color, content, subContent }) => {

    return (
        <p className="text-xs  text-gray-300">
            <span className={color ?? "text-blue-400"}>{subContent}</span> {" "} {content}
        </p>
    )
}