import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Palette, Plus } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";


export const permissions = [
    { id: "manageRanks", label: "Manage Ranks", description: "Create, edit, and delete ranks" },
    { id: "manageMembers", label: "Manage Members", description: "Edit memeber profiles and ranks" },
    { id: "manageNews", label: "Manage News", description: "Create and edit news posts" },
    { id: "kickMembers", label: "Kick Members", description: "Remove members" },
    { id: "stashAccess", label: "Stash Access", description: "Allow access for faction stash" },
]
const colorPresets = [
    "#ff0000",
    "#ff6b35",
    "#f7b731",
    "#5f27cd",
    "#00d2d3",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
    "#10ac84",
    "#ee5a24",
]


const CreateRankDialog: React.FC = ({ }) => {
    const [open, setOpen] = useState<boolean>(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        level: [5],
        color: colorPresets[0],
        permissions: {} as Record<string, boolean>,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Createing Rank: ", formData)
        setOpen(false)
        setFormData({
            name: "",
            color: colorPresets[0],
            description: "",
            level: [5],
            permissions: {}
        })
    }

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
        setFormData({
            ...formData,
            permissions: {
                ...formData.permissions,
                [permissionId]: checked
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="text-white" variant={"outline"}>
                    <Plus className="size-4 " />
                    Create Rank
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-zinc-800/80 border-zinc-700/80 ">
                <DialogHeader>
                    <DialogTitle className="font-heading text-white">Create New Rank</DialogTitle>
                    <DialogDescription className="text-gray-300">Set up a new rank with custom permissions and styling.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={"name"} className="text-white/80">Rank Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter rank name..."
                                value={formData.name}
                                onChange={({ target }) => setFormData({ ...formData, name: target.value })}
                                required
                                className="text-white border-gray-500"
                            />
                        </div>


                        <div className="space-y-2">
                            <Label className="text-white/80">Rank Level</Label>
                            <div className="px-3">
                                <Slider
                                    value={formData.level}
                                    onValueChange={(value) => setFormData({ ...formData, level: value })}
                                    max={98}
                                    min={1}
                                    step={1}
                                    className="w-full bg-zinc-900 rounded-md"
                                />
                                <div className="flex justify-between text-xs text-gray-300 mt-2">
                                    <span>1</span>
                                    <span>Level {formData.level[0]}</span>
                                    <span>98</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-white/80">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Describe this rank..."
                            value={formData.description}
                            onChange={({ target }) => setFormData({ ...formData, description: target.value })}
                            className="bg-input border-zinc-700 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-white/80 flex items-center gap-2">
                            <Palette className="size-4" />
                            Rank color
                        </Label>
                        <div className="flex gap-2 flex-wrap">
                            {colorPresets.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`size-8 rounded-full border-2 ${formData.color === color ? "border-primary" : "border-border"}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormData({ ...formData, color })}
                                />
                            ))}
                            <Input
                                type="color"
                                value={formData.color}
                                onChange={({ target }) => setFormData({ ...formData, color: target.value })}
                                className="size-8 p-0 border-0"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-white/80">Permissions</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {permissions.map((perm) => (
                                <div
                                    key={perm.id}
                                    className="flex items-start space-x-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-700"
                                >
                                    <Checkbox
                                        id={perm.id}
                                        checked={formData.permissions[perm.id] || false}
                                        onCheckedChange={(checked) => handlePermissionChange(perm.id, checked as boolean)}
                                        className="text-white data-[state=checked]:text-green-400"
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white">
                                            {perm.label}
                                        </Label>
                                        <p className="text-xs text-gray-400">{perm.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    <DialogFooter className="p-2 text-white/90">
                        <Button type="button" variant={"outline"} onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant={"outline"}>Create Rank</Button>
                    </DialogFooter>
                </form>

            </DialogContent>
        </Dialog>
    );
};

export default CreateRankDialog;