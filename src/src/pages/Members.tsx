import InfoCard, { InfoCardBox, InfoSubElement } from "@/components/InfoCard";
import MemberTable from "../components/MemberTable";
import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus, Users } from "lucide-react";
import React from "react";

const Members: React.FC = () => {
    return (

        <main className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
                {/* Header */}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-white">Member Managment</h1>
                        <p className="text-gray-300">Manage faction members, ranks, and permissions</p>
                    </div>
                    <Button className="gap-2 bg-white/90 hover:bg-white">
                        <UserPlus className="size-4" />
                        Invite Members
                    </Button>
                </div>

                {/* Stats Card */}

                <InfoCardBox >
                    <InfoCard Icon={Users} title="Total Members" content="6" subContent={<InfoSubElement subContent="+12" content="this month" color="text-green-400" />} />
                    <InfoCard Icon={UserCheck} title="Online Members" content="3" subContent={<InfoSubElement subContent="50%" content="active" color="text-blue-400" />} />
                    <InfoCard Icon={UserPlus} title="New Members" content="2" subContent={<InfoSubElement subContent="+2" content="new members" color="text-white" />} />
                    <InfoCard Icon={UserPlus} title="Unknown" content="2" subContent={<InfoSubElement subContent="+2" content="new members" color="text-white" />} />
                </InfoCardBox>

                {/* Search Bar */}


                {/* Member Tabler */}

                <MemberTable />
            </div>
        </main>
    );
};

export default Members;