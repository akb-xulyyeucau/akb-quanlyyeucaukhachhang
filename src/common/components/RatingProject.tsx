import React from 'react';
import { Rate } from 'antd';

interface RatingProjectProps {
  value?: number;
}

const getRatingText = (rating?: number) => {
  if (!rating) return 'Tệ !';
  if (rating <= 2) return 'Không hài lòng!';
  if(rating <= 3) return 'Cần cải thiện thêm!'
  if (rating <= 4) return 'Hài lòng!';
  return 'Rất hài lòng!';
};

const RatingProject: React.FC<RatingProjectProps> = ({ value }) => (
  <div>
    <Rate disabled value={value || 0} />
    <span style={{ marginLeft: 8, color: '#faad14', fontWeight: 500 }}>
      {getRatingText(value)}
    </span>
  </div>
);

export default RatingProject;