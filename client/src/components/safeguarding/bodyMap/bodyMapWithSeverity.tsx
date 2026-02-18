import React, { useRef, useEffect } from 'react';
import head from '../../../assets/safeguarding/bodymap/head.svg';
import neck from '../../../assets/safeguarding/bodymap/neck.svg';
import rightShoulder from '../../../assets/safeguarding/bodymap/shoulder.svg';
import chest from '../../../assets/safeguarding/bodymap/chest.svg';
import abdomen from '../../../assets/safeguarding/bodymap/abdomen.svg';
import rightTigh from '../../../assets/safeguarding/bodymap/rightThigh.svg';
import rightLeg from '../../../assets/safeguarding/bodymap/rightLeg.svg';
import foot from '../../../assets/safeguarding/bodymap/foot.svg';
import upperArm from '../../../assets/safeguarding/bodymap/upperArm.svg';
import lowerArm from '../../../assets/safeguarding/bodymap/lowerArm.svg';
import hand from '../../../assets/safeguarding/bodymap/hand.svg';
import './bodyMapWithSeverity.scss';

export type SeverityLevel = 1 | 2 | 3; // 1=green, 2=orange, 3=red

const SEVERITY_FILTERS: Record<string, string> = {
  grey: 'grayscale(100%) brightness(0.8)',
  green: 'brightness(0) saturate(100%) invert(58%) sepia(98%) saturate(1024%) hue-rotate(91deg) brightness(95%) contrast(92%)',
  orange: 'brightness(0) saturate(100%) invert(65%) sepia(98%) saturate(1000%) hue-rotate(360deg) brightness(102%) contrast(94%)',
  red: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)',
};

interface RegionSpec {
  id: string;
  name: string;
  src: string;
  style: React.CSSProperties;
}

const FRONT_REGIONS: RegionSpec[] = [
  { id: 'head-front', name: 'Head', src: head, style: { width: '20%', height: '20%', top: '10%', left: '40%' } },
  { id: 'neck-front', name: 'Neck', src: neck, style: { width: '15%', height: '15%', top: '19.5%', left: '42.5%' } },
  { id: 'leftShoulder-front', name: 'Left Shoulder', src: rightShoulder, style: { width: '15%', height: '15%', top: '21.7%', left: '50%', transform: 'scaleX(-1)' } },
  { id: 'rightShoulder-front', name: 'Right Shoulder', src: rightShoulder, style: { width: '15%', height: '15%', top: '21.7%', left: '35%' } },
  { id: 'chest-front', name: 'Chest', src: chest, style: { width: '15%', height: '15%', top: '28.3%', left: '42.5%' } },
  { id: 'abdomen-front', name: 'Abdomen', src: abdomen, style: { width: '15%', height: '15%', top: '34.7%', left: '42.5%' } },
  { id: 'rightThigh-front', name: 'Right Thigh', src: rightTigh, style: { width: '8%', height: '8%', top: '44.6%', left: '42.5%' } },
  { id: 'leftThigh-front', name: 'Left Thigh', src: rightTigh, style: { width: '8%', height: '8%', top: '44.6%', left: '49.5%', transform: 'scaleX(-1)' } },
  { id: 'rightLeg-front', name: 'Right Leg', src: rightLeg, style: { width: '9%', height: '9%', top: '52.5%', left: '41.5%' } },
  { id: 'leftLeg-front', name: 'Left Leg', src: rightLeg, style: { width: '9%', height: '9%', top: '52.5%', left: '49.5%', transform: 'scaleX(-1)' } },
  { id: 'right-foot-front', name: 'Right Foot', src: foot, style: { width: '9%', height: '9%', top: '59%', left: '40.5%' } },
  { id: 'left-foot-front', name: 'Left Foot', src: foot, style: { width: '9%', height: '9%', top: '59%', left: '50.5%', transform: 'scaleX(-1)' } },
  { id: 'right-upper-arm-front', name: 'Right Upper Arm', src: upperArm, style: { width: '9%', height: '9%', top: '30.3%', left: '32.5%' } },
  { id: 'left-upper-arm-front', name: 'Left Upper Arm', src: upperArm, style: { width: '9%', height: '9%', top: '30.3%', left: '58.5%', transform: 'scaleX(-1)' } },
  { id: 'right-lower-arm-front', name: 'Right Lower Arm', src: lowerArm, style: { width: '10%', height: '9%', top: '35.7%', left: '30%' } },
  { id: 'left-lower-arm-front', name: 'Left Lower Arm', src: lowerArm, style: { width: '10%', height: '9%', top: '35.7%', left: '59.9%', transform: 'scaleX(-1)' } },
  { id: 'right-hand-front', name: 'Right Hand', src: hand, style: { width: '10%', height: '9%', top: '42%', left: '27.1%' } },
  { id: 'left-hand-front', name: 'Left Hand', src: hand, style: { width: '10%', height: '9%', top: '42%', left: '62.9%', transform: 'scaleX(-1)' } },
];

const BACK_REGIONS: RegionSpec[] = FRONT_REGIONS.map((r) => ({
  ...r,
  id: r.id.replace('-front', '-back'),
}));

const SEVERITY_OPTIONS: { value: SeverityLevel; color: string }[] = [
  { value: 1, color: 'green' },
  { value: 2, color: 'orange' },
  { value: 3, color: 'red' },
];

export interface BodyMapWithSeverityProps {
  view: 'front' | 'back';
  markers: Record<string, number>;
  activeRegionId: string | null;
  onRegionClick: (regionId: string) => void;
  onSeveritySelect: (regionId: string, severity: SeverityLevel) => void;
  descriptionValue?: string;
  onDescriptionChange?: (regionId: string, value: string) => void;
  width?: number;
  height?: number;
}

const BodyMapWithSeverity: React.FC<BodyMapWithSeverityProps> = ({
  view,
  markers,
  activeRegionId,
  onRegionClick,
  onSeveritySelect,
  descriptionValue = '',
  onDescriptionChange,
  width = 400,
  height = 600,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const regions = view === 'front' ? FRONT_REGIONS : BACK_REGIONS;

  const getFilter = (regionId: string): string | undefined => {
    const severity = markers[regionId];
    const isActive = activeRegionId === regionId;
    if (isActive && !severity) return SEVERITY_FILTERS.grey;
    if (severity === 1) return SEVERITY_FILTERS.green;
    if (severity === 2) return SEVERITY_FILTERS.orange;
    if (severity === 3) return SEVERITY_FILTERS.red;
    return undefined;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        // Optionally clear active region on outside click - parent can handle if needed
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="body-map-with-severity">
      <div className="body-map-with-severity__map" style={{ position: 'relative', width, height }}>
        {regions.map((region) => {
          const filter = getFilter(region.id);
          return (
            <img
              key={region.id}
              src={region.src}
              alt={region.name}
              className="body-map-with-severity__part"
              style={{
                ...region.style,
                position: 'absolute',
                objectFit: 'contain',
                cursor: 'pointer',
                filter: filter || undefined,
              }}
              onClick={() => onRegionClick(region.id)}
            />
          );
        })}
      </div>
      {activeRegionId && (
        <div className="body-map-with-severity__dropdown-wrap" ref={dropdownRef}>
          <p className="body-map-with-severity__dropdown-label">Level of severity</p>
          <div className="body-map-with-severity__severity-options">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`body-map-with-severity__severity-btn body-map-with-severity__severity-btn--${opt.color}`}
                title={opt.color}
                onClick={() => onSeveritySelect(activeRegionId, opt.value)}
              />
            ))}
          </div>
          {onDescriptionChange && (
            <div className="body-map-with-severity__description-wrap">
              <label className="body-map-with-severity__description-label">Description</label>
              <textarea
                className="body-map-with-severity__description-input"
                value={descriptionValue}
                onChange={(e) => onDescriptionChange(activeRegionId, e.target.value)}
                placeholder="Notes for this area..."
                rows={3}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BodyMapWithSeverity;
