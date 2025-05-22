import React from "react";
export type Protocol = "" | "v4" | "v6";

interface ProtocolSelectProps {
  protocol: Protocol;
  onChange: (protocol: Protocol) => void;
}

export const ProtocolSelect: React.FC<ProtocolSelectProps> = ({
  protocol,
  onChange,
}) => (
  <select
    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
    value={protocol}
    onChange={e => onChange(e.target.value as Protocol)}
    required
  >
    <option value="">Dual Stack</option>
    <option value="v4">IPv4</option>
    <option value="v6">IPv6</option>
  </select>
);
