"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    value: string[];
    onChange: (value: string[]) => void;
    onRemove: (value: string) => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
    const [loading, setLoading] = useState(false);

    async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                onChange([...value, data.url]);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                {value.map((url) => (
                    <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden border">
                        <div className="z-10 absolute top-2 right-2">
                            <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="icon">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            fill
                            className="object-cover"
                            alt="Property Image"
                            src={url.startsWith("http") ? url : url}
                        />
                    </div>
                ))}
            </div>
            <div>
                <Button disabled={loading} variant="secondary" onClick={() => document.getElementById("fileInput")?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? "Uploading..." : "Upload Image"}
                </Button>
                <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onUpload}
                />
            </div>
        </div>
    );
}
