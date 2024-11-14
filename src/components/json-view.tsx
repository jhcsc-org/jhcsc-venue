// src/components/json-view.tsx
import { FC } from "react";

interface JsonViewProps {
    data: unknown;
}

export const JsonView: FC<JsonViewProps> = ({ data }) => {
    return (
        <pre className="p-4 overflow-x-auto bg-gray-100 rounded-md">
            <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
    );
};