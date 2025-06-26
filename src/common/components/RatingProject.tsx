import React from 'react';
import { Rate } from 'antd';

interface RatingProjectProps {
  value?: number;
  onChange?: (val: number) => void;
  disabled?: boolean; // Prop để phân biệt giữa tĩnh và interactive

}

const getRatingText = (rating?: number) => {
  if (!rating || rating === 0) return 'Chưa đánh giá';
  if (rating === 1) return 'Tệ!';
  if (rating <= 2) return 'Không hài lòng!';
  if (rating <= 3) return 'Cần cải thiện thêm!';
  if (rating <= 4) return 'Hài lòng!';
  return 'Rất hài lòng!';
};

const RatingProject: React.FC<RatingProjectProps> = ({
  value = 0,
  onChange,
  disabled = false,

}) => {
  const handleChange = (val: number) => {
    console.log('RatingProject onChange:', val);
    if (onChange && !disabled) {
      onChange(val);
    }
  };

  return (
    <div>
      <Rate
        value={value}
        onChange={handleChange}
        disabled={disabled}

      />
      <span style={{
        marginLeft: 8,
        color: disabled ? '#8c8c8c' : '#faad14',
        fontWeight: 500
      }}>
        {getRatingText(value)}
      </span>
    </div>
  );
};

export default RatingProject;