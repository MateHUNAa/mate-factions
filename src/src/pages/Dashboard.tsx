import Actions from "@/components/dashboard/Actions";
import News from "@/components/dashboard/News";
import InfoCard, { InfoCardBox, InfoSubElement } from "@/components/InfoCard";
import { useMembers } from "@/hooks/useMembers";
import { useRanks } from "@/hooks/useRanks";
import { Users } from "lucide-react";
import React from "react";

interface Props {
}

const Dashboard: React.FC<Props> = ({ }) => {
    const ranks = useRanks()
    const members = useMembers()

    const joinedLast7Days = members.filter(member => {
        const joinDate = new Date(member.joinDate);
        if (isNaN(joinDate.getTime())) return false;
        const now = new Date();
        return now.getTime() - joinDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    const activeMembers = members.filter((member) => member.status == "away" || member.status == "online")
    const activeDuty = members.filter((member) => member.status == 'online')


    const activeLast24h = members.filter(member => {
        if (!member.lastActive) return false;
        const lastActiveDate = new Date(member.lastActive);
        if (isNaN(lastActiveDate.getTime())) return false;
        return new Date().getTime() - lastActiveDate.getTime() <= 24 * 60 * 60 * 1000; // last 24h
    }).length;

    return (
        <div className="p-4 rounded-2xl shadow-md bg-background">
            <main className="items-center justify-center mx-auto">
                <InfoCardBox>
                    <InfoCard title="Total Members" content={members.length.toString()} Icon={Users} subContent={<InfoSubElement subContent={`+${joinedLast7Days}`} content="new member joined" />} />
                    <InfoCard title="Total Ranks" content={ranks?.length?.toString() || "0"} Icon={Users} subContent={<InfoSubElement subContent="+1" content="new rank created" color="text-green-400" />} />
                    <InfoCard title="Active Members" content={`${activeMembers.length}`} Icon={Users}
                        subContent={<InfoSubElement subContent={`+${activeLast24h}`} content="was active in the last 24hours" color="text-blue-400" />}
                    />
                    <InfoCard title="Active Duty" content={`${activeDuty.length}`} Icon={Users}
                        subContent={<InfoSubElement subContent={`${Math.round((activeDuty.length / members.length) * 100)}%`} content="currently on duty" color="text-green-400" />}
                    /></InfoCardBox>

                {/* News */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                    <News />
                    <Actions />
                </div>
            </main>

        </div>
    );
};

export default Dashboard;