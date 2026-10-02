import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill="currentColor"
                d="M19 5h7v14c0 6-4 10-10 10S6 25 6 19h7c0 2 1 3 3 3s3-1 3-3V5Z"
            />
            <rect
                x="6"
                y="5"
                width="7"
                height="7"
                rx="2"
                fill="currentColor"
                opacity="0.6"
            />
        </svg>
    );
}
