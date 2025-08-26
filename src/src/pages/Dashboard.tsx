import Actions from "@/components/dashboard/Actions";
import News from "@/components/dashboard/News";
import InfoCard, { InfoCardBox, InfoSubElement } from "@/components/InfoCard";
import { Users } from "lucide-react";
import React from "react";

interface Props {
}

const Dashboard: React.FC<Props> = ({ }) => {
    return (
        <div className="p-4 rounded-2xl shadow-md bg-background">

            {/* Sidebar */}

            <main>
                {/* Header */}


                {/* Cards */}

                <InfoCardBox>
                    <InfoCard title="Total Members" content="123" Icon={Users} subContent={<InfoSubElement subContent="+2" content="new member joined" />} />
                    <InfoCard title="Total Ranks" content="5" Icon={Users} subContent={<InfoSubElement subContent="+1" content="new rank created" color="text-green-400" />} />
                    <InfoCard title="Total Ranks" content="5" Icon={Users} subContent={<InfoSubElement subContent="+1" content="new rank created" color="text-green-400" />} />
                    <InfoCard title="Total Ranks" content="5" Icon={Users} subContent={<InfoSubElement subContent="+1" content="new rank created" color="text-green-400" />} />
                </InfoCardBox>

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