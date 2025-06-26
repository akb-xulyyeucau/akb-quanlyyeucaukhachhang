import React from 'react';
import { Progress } from 'antd';

interface StatisticCardProps {
  icon: React.ReactNode;
  title: string;
  number: number | string;
  color?: string;
  percent?: number; // Thêm prop này
}

const StatisticCard: React.FC<StatisticCardProps> = ({
  icon, title, number, color = '#1890ff', percent
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 8px #f0f1f2',
      padding: 20,
      minWidth: 220,
      gap: 16,
    }}
  >
    <div
      style={{
        fontSize: 32,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: `${color}22`,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 16, color: '#888' }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{number}</div>
      {typeof percent === 'number' && (
        <div style={{ marginTop: 8 }}>
          <Progress percent={percent} size="small" strokeColor={color} showInfo={false} />
          <span style={{ color, fontSize: 13 }}>{percent}%</span>
        </div>
      )}
    </div>
  </div>
);

export default StatisticCard;