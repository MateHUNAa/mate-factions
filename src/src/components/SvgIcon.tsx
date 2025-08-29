import { useEffect, useState } from "react";

interface SvgIconProps {
    src: string;
    className?: string;
}

export default function SvgIcon({ src, className }: SvgIconProps) {
    const [svgContent, setSvgContent] = useState<string>("");

    useEffect(() => {
        fetch(src)
            .then((res) => res.text())
            .then((data) => {
                const colored = data
                    .replace(/fill=".*?"/g, 'fill="currentColor"')
                    .replace(/stroke=".*?"/g, 'stroke="currentColor"');
                setSvgContent(colored);
            });
    }, [src]);

    return (
        <span
            className={className}
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
}
