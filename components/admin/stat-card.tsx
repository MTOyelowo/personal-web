import type { FC, JSX, ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}

const StatCard: FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
}): JSX.Element => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-1 ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
