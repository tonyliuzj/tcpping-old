import React from "react";

export type Protocol = "dual" | "v4" | "v6";

const protocolOptionLabels: { [K in Protocol]: string } = {
  dual: "Dual Stack (IPv4 + IPv6)",
  v4: "IPv4 Only",
  v6: "IPv6 Only"
};

interface ProtocolSelectProps {
  value: string;
  onChange: (val: Protocol) => void;
  disabled?: boolean;
  v4?: boolean;  // Add these two props!
  v6?: boolean;
}

const ProtocolSelect: React.FC<ProtocolSelectProps> = ({
  value,
  onChange,
  disabled = false,
  v4,
  v6
}) => {
  // Dynamically build available options
  const options: Protocol[] = [];
  if (v4 && v6) options.push("dual");
  if (v4) options.push("v4");
  if (v6) options.push("v6");

  return (
    <div>
      <label className="block mb-1 font-medium">Protocol</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Protocol)}
        className={`w-full p-2 border rounded ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        disabled={disabled}
      >
        <option value="" disabled hidden>
          Select protocol
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {protocolOptionLabels[option]}
          </option>
        ))}
      </select>
    </div>
  );
};

export { ProtocolSelect };
