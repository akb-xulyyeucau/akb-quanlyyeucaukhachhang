import React from 'react';
import { Rate } from 'antd';
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface RatingProjectProps {
  value?: number;
  onChange?: (val: number) => void;
  disabled?: boolean; // Prop để phân biệt giữa tĩnh và interactive
}

const RatingProject: React.FC<RatingProjectProps> = ({
  value = 0,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation('projectResponse');

  const handleChange = (val: number) => {
    console.log('RatingProject onChange:', val);
    if (onChange && !disabled) {
      onChange(val);
    }
  };


  const getTranslatedRatingText = (rating?: number) => {
    if (!rating || rating === 0) return t('RatingProject.notRated');
    if (rating === 1) return t('RatingProject.terrible');
    if (rating <= 2) return t('RatingProject.dissatisfied');
    if (rating <= 3) return t('RatingProject.needsImprovement');
    if (rating <= 4) return t('RatingProject.satisfied');
    return t('RatingProject.verySatisfied');
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
        {getTranslatedRatingText(value)}
      </span>
    </div>
  );
};

export default RatingProject;