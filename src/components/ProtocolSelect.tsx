import React from "react";

export type Protocol = "" | "v4" | "v6";

interface Props {
  value: Protocol;
  onChange: (v: Protocol) => void;
}

export function ProtocolSelect({ value, onChange }: Props) {
  return (
    <div>
      <label className="block mb-1 font-medium">Protocol (optional)</label>
      <select
        className="w-full border rounded p-2"
        value={value}
        onChange={e => onChange(e.target.value as Protocol)}
      >
        <option value="">Dual-stack (default)</option>
        <option value="v4">IPv4 only</option>
        <option value="v6">IPv6 only</option>
      </select>
    </div>
  );
}
