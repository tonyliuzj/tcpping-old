import React from "react";

export type Protocol = "dual" | "v4" | "v6";

const protocolOptions: { value: Protocol; label: string }[] = [
  { value: "dual", label: "Dual Stack (IPv4 + IPv6)" },
  { value: "v4", label: "IPv4 Only" },
  { value: "v6", label: "IPv6 Only" },
];

interface ProtocolSelectProps {
  value: string;
  onChange: (val: Protocol) => void;
}

const ProtocolSelect: React.FC<ProtocolSelectProps> = ({ value, onChange }) => (
  <div>
    <label className="block mb-1 font-medium">Protocol</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Protocol)}
      className="w-full p-2 border rounded"
    >
      <option value="" disabled hidden>
        Select protocol
      </option>
      {protocolOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export { ProtocolSelect };
