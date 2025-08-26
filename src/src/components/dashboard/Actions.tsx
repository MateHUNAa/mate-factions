import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Bell, Shield, Users } from "lucide-react";
interface Props {
}

const Actions: React.FC<Props> = ({ }) => {
    return (
        <Card className="bg-zinc-800/80 border-zinc-700/80 ">
            <CardHeader>
                <CardTitle className="text-white font-heading">Quick Actions</CardTitle>
                <CardDescription className="text-gray-300">Common management tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-zinc-900/80 hover:bg-zinc-900/50">
                        <Users className="h-6 w-6 text-white" />
                        <span className="text-sm text-gray-300">Manage Members</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-zinc-900/80 hover:bg-zinc-900/50">
                        <Shield className="h-6 w-6 text-white" />
                        <span className="text-sm text-gray-300">Edit Ranks</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-zinc-900/80 hover:bg-zinc-900/50">
                        <Bell className="h-6 w-6 text-white" />
                        <span className="text-sm text-gray-300">Send Notice</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2 bg-zinc-900/80 hover:bg-zinc-900/50">
                        <Activity className="h-6 w-6 text-white" />
                        <span className="text-sm text-gray-300">View Analytics</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default Actions;