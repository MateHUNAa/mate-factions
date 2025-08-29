import React, { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { ArrowDownCircle, ArrowRightFromLine, ArrowUpCircle, Bell, BookOpen, Calendar, Megaphone, Minus, RadioTower } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useFaction } from "@/hooks/useFaction";
import { fetchNui } from "@/utils/fetchNui";
import { useAppDispatch } from "@/store";
import { addNews, NewsItem } from "@/store/newsSlice";
import { useUser } from "@/store/userSlice";
interface Props {
    children: React.ReactNode
}

const CreateNewsDialog: React.FC<Props> = ({ children }) => {
    const [open, setOpen] = useState(false)
    const { selectedFaction } = useFaction()
    const [formData, setFormData] = useState<Omit<NewsItem, "creator" | "createdAt">>({
        title: "",
        content: "",
        category: "notice" as const,
        priority: "medium" as const,
    })

    const dispatch = useAppDispatch()
    const user = useUser()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Createing pos:", formData)

        if (selectedFaction) {
            const { success } = await fetchNui<{ success: boolean }>("postFactionPost", {
                factionId: selectedFaction.id,
                ...formData
            })

            if (success && user) {
                dispatch(addNews({
                    ...formData,
                    creator: user?.identifier,
                    createdAt: Date.now()
                }))
            }
        }

        setOpen(false)
        setFormData({
            title: "",
            content: "",
            category: "notice" as const,
            priority: "medium" as const,
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen} >

            <DialogTrigger>
                {children}
            </DialogTrigger>

            <DialogContent className="bg-zinc-800/90 border-zinc-700/80 text-white">
                <DialogHeader>
                    <DialogTitle>
                        Create New Post
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                        Share imporant updates and announcements with your faction.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="flex  items-center gap-2">
                            <ArrowRightFromLine /> Title
                        </Label>
                        <Input
                            id="title"
                            placeholder="Enter news title..."
                            value={formData.title}
                            onChange={({ target }) => setFormData({ ...formData, title: target.value })}
                            className="border border-zinc-700"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category" className="flex  items-center gap-2">
                                <ArrowRightFromLine /> Category
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={(v) => setFormData({ ...formData, category: v as NewsItem["category"] })}
                            >
                                <SelectTrigger className="border border-zinc-700">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>

                                <SelectContent className="text-gray-400 bg-zinc-700">
                                    <SelectItem className="focus:text-white group focus:bg-zinc-800" value="update">
                                        <div className="flex items-center gap-2">
                                            <RadioTower className="text-white group-focus:text-green-400" />
                                            Update
                                        </div>
                                    </SelectItem>
                                    <SelectItem className="focus:text-white focus:bg-zinc-800 group" value="event">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="text-white group-focus:text-green-400" />
                                            Event
                                        </div>
                                    </SelectItem>
                                    <SelectItem className="focus:text-white focus:bg-zinc-800 group" value="notice">
                                        <div className="flex items-center gap-2">
                                            <Bell className="text-white group-focus:text-green-400" />
                                            Notice
                                        </div>
                                    </SelectItem>
                                    <SelectItem className="focus:text-white focus:bg-zinc-800 group" value="guide">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="text-white group-focus:text-green-400" />
                                            Guide
                                        </div>
                                    </SelectItem>
                                    <SelectItem className="focus:text-white focus:bg-zinc-800 group" value="announcement">
                                        <div className="flex items-center gap-2">
                                            <Megaphone className="text-white group-focus:text-green-400" />
                                            Announcement
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority" className="flex  items-center gap-2">
                                <ArrowRightFromLine /> Priority
                            </Label>
                            <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as NewsItem["priority"] })}>
                                <SelectTrigger className="border border-zinc-700">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem className="focus:text-white group focus:bg-zinc-800" value="high">
                                        <div className="flex items-center gap-2">
                                            <ArrowUpCircle className="text-white group-focus:text-green-400" />
                                            High
                                        </div>
                                    </SelectItem>
                                    <SelectItem className="focus:text-white group focus:bg-zinc-800" value="medium">
                                        <div className="flex items-center gap-2">
                                            <Minus className="text-white group-focus:text-green-400" />
                                            Medium
                                        </div>
                                    </SelectItem>
                                    <SelectItem className="focus:text-white group focus:bg-zinc-800" value="low">
                                        <div className="flex items-center gap-2">
                                            <ArrowDownCircle className="text-white group-focus:text-green-400" />
                                            Low
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content" className="flex  items-center gap-2">
                            <ArrowRightFromLine /> Content
                        </Label>
                        <Textarea
                            id="content"
                            placeholder="Write your new content..."
                            value={formData.content}
                            onChange={({ target }) => setFormData({ ...formData, content: target.value })}
                            className="border border-zinc-700"
                            required
                        />
                    </div>

                    {/* Footer */}
                    <DialogFooter className="p-2 text-white/90">
                        <Button type="button" variant={"outline"} onClick={() => setOpen(false)}>
                            Cancel
                        </Button>

                        <Button type="submit" variant={"outline"} >
                            Change Rank
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateNewsDialog;
