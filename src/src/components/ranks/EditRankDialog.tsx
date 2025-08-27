import React, { useEffect, useState } from "react";
import { colorPresets, permissions } from "./CreateRankDialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { Palette } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useRanks } from "@/lib/permission";
import { fetchNui } from "@/utils/fetchNui";

interface Props {
    rank: {
        id: number;
        name: string;
        color: string;
        permissions: string[];
        description: string;
    },
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const EditRankDialog: React.FC<Props> = ({ rank, open, onOpenChange }) => {

    const ranks = useRanks()
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        level: 5,
        color: colorPresets[0],
        permissions: {} as Record<string, boolean>,
    })
    useEffect(() => {
        if (rank) {
            let perms: Record<string, boolean> = {}

            rank.permissions.forEach(r => perms[r] = true)


            setFormData({
                name: rank.name,
                description: rank.description,
                level: rank.id,
                color: rank.color,
                permissions: perms || {}
            })
        }
    }, [rank])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Updateing rank: ", formData)

        try {
            const { success } = await fetchNui<{ success: boolean }>("updateFactionRank", {
                old: { id: rank.id },
                new: formData
            })
        } catch (err) {
            console.error(err)
        }

        onOpenChange(false)
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700/80'>
                <DialogHeader>
                    <DialogTitle className="text-gray-200">Edit Rank: {rank.name}</DialogTitle>
                    <DialogDescription className="text-gray-400">Modify rank settings, permissions, and styling</DialogDescription>
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
                                    value={[formData.level]}
                                    onValueChange={(value) => setFormData({ ...formData, level: value[0] })}
                                    max={98}
                                    min={1}
                                    step={1}
                                    className="w-full bg-zinc-800 rounded-md"
                                />
                                <div className="flex justify-between text-xs text-gray-300 mt-2">
                                    <span>1</span>
                                    <span>Level {formData.level}</span>
                                    <span>98</span>
                                </div>
                                {ranks.some((rank) => Number(rank.id) === formData.level) && (
                                    <p className="text-red-500 text-xs mt-1">This level is already assigned.</p>
                                )}
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
                            {colorPresets.map((color, i) => (
                                <button
                                    key={`${color}-${i}`}
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
                        <Button type="button" variant={"outline"} onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant={"outline"}>Save Changes</Button>
                    </DialogFooter>
                </form>

            </DialogContent>
        </Dialog>
    );
};

export default EditRankDialog;