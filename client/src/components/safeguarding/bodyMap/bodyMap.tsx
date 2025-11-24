import React, { useState } from 'react';
// import { BodyMap } from 'react-body-map';
import head from '../../../assets/safeguarding/bodymap/head.svg';
import neck from '../../../assets/safeguarding/bodymap/neck.svg';
import rightShoulder from '../../../assets/safeguarding/bodymap/shoulder.svg';
import chest from '../../../assets/safeguarding/bodymap/chest.svg';
import abdomen from '../../../assets/safeguarding/bodymap/abdomen.svg';
import rightTigh from '../../../assets/safeguarding/bodymap/rightThigh.svg'
import rightLeg from '../../../assets/safeguarding/bodymap/rightLeg.svg'
import foot from '../../../assets/safeguarding/bodymap/foot.svg'
import upperArm from '../../../assets/safeguarding/bodymap/upperArm.svg'
import lowerArm from '../../../assets/safeguarding/bodymap/lowerArm.svg'
import hand from '../../../assets/safeguarding/bodymap/hand.svg'
interface BodyMapData {
  [regionId: string]: {
    value: number;
    label?: string;
    color?: string;
  };
}

interface SelectedRegion {
  id: string;
  name: string;
  data: BodyMapData[string];
}

interface BodyMapComponentProps {
  data?: BodyMapData;
  onRegionSelect?: (regionId: string, region: any) => void;
  width?: number;
  height?: number;
  view?: 'front' | 'back' | 'both';
}

// Function to create custom regions from your SVG assets
// const createCustomRegions = () => {
//   // Use the actual head SVG path from your imported file
//   const customRegions = [
//     {
//       id: 'head-front',
//       name: 'Head',
//       path: 'M0 0 C7.82833199 7.25279343 14.91342129 15.81511975 18.875 25.8125 C19.21015625 26.65683594 19.5453125 27.50117187 19.890625 28.37109375 C24.94619986 42.27392462 26.31926066 57.1885502 27.875 71.8125 C29.76798828 72.23595703 29.76798828 72.23595703 31.69921875 72.66796875 C37.00232619 73.85426143 39.36434311 76.87022685 42.625 81.0625 C44.39172193 84.94928824 44.65189662 88.58029652 44.875 92.8125 C44.95427734 93.99199219 44.95427734 93.99199219 45.03515625 95.1953125 C45.48862491 107.45868222 41.72514248 117.41089355 33.875 126.8125 C29.71470668 130.84928461 25.79422981 134.12166126 20.3046875 136.09765625 C16.10854543 138.19572729 14.88577139 140.58513938 13.0625 144.6875 C10.42644935 150.08668724 7.58453057 154.95418711 3.875 159.6875 C3.45710205 160.22262207 3.0392041 160.75774414 2.60864258 161.30908203 C-0.00579671 164.58208177 -2.82209591 167.5725202 -5.75 170.5625 C-8.37029336 173.46922219 -9.67078955 175.36443131 -9.875 179.3125 C-9.16394844 184.73682992 -9.16394844 184.73682992 -5.125 192.8125 C-39.115 192.8125 -73.105 192.8125 -108.125 192.8125 C-106.125 186.8125 -106.125 186.8125 -105 184.9375 C-103.62407241 181.59596156 -103.54130075 178.33210701 -104.125 174.8125 C-105.78192414 172.46943549 -107.14474326 170.85483883 -109.1875 168.9375 C-110.20989335 167.89992016 -111.22811143 166.85821019 -112.2421875 165.8125 C-112.73944336 165.30460938 -113.23669922 164.79671875 -113.74902344 164.2734375 C-117.89887183 159.86735291 -121.13581164 154.78861831 -123.8359375 149.39453125 C-127.75180528 141.58281224 -131.38415026 137.33819781 -138.97070312 132.92675781 C-148.84594174 127.17776755 -153.63065747 119.55047961 -157.125 108.8125 C-158.33092023 104.24391759 -158.37931457 99.69750334 -158.4375 95 C-158.48100586 93.84661133 -158.48100586 93.84661133 -158.52539062 92.66992188 C-158.60077743 85.79812465 -156.69059709 80.52470263 -151.9375 75.5 C-149.39109763 73.97215858 -147.25195169 73.11089363 -144.44921875 72.20703125 C-143.23431763 71.81221558 -143.23431763 71.81221558 -141.99487305 71.40942383 C-141.37781494 71.21243896 -140.76075684 71.0154541 -140.125 70.8125 C-140.0748877 70.18907715 -140.02477539 69.5656543 -139.97314453 68.92333984 C-139.40098115 61.88222719 -138.78587599 54.8458517 -138.125 47.8125 C-138.05555176 47.06871094 -137.98610352 46.32492188 -137.91455078 45.55859375 C-136.17321423 28.01230175 -128.77196106 13.95759753 -116.125 1.8125 C-115.41601562 1.09449219 -114.70703125 0.37648438 -113.9765625 -0.36328125 C-83.44797654 -29.66001199 -30.70638849 -27.51023874 0 0 Z',
//       strokeColor: '#333',
//       strokeWidth: 2,
//       fill: '#FDD7BD',
//       transform: 'translate(170.125,35.1875)',
//     },
//     {
//       id: 'chest-front',
//       name: 'Chest',
//       path: 'M 120 180 C 120 180, 120 200, 120 220 C 120 240, 140 260, 160 260 C 180 260, 200 240, 200 220 C 200 200, 200 180, 180 180 Z',
//       strokeColor: '#333',
//       strokeWidth: 2,
//     },
//     {
//       id: 'abdomen-front',
//       name: 'Abdomen',
//       path: 'M 130 260 C 130 260, 130 280, 130 300 C 130 320, 150 340, 170 340 C 190 340, 210 320, 210 300 C 210 280, 210 260, 190 260 Z',
//       strokeColor: '#333',
//       strokeWidth: 2,
//     },
//     {
//       id: 'arm-left-front',
//       name: 'Left Arm',
//       path: 'M 80 120 C 60 120, 40 140, 40 160 C 40 180, 60 200, 80 200 C 100 200, 120 180, 120 160 C 120 140, 100 120, 80 120 Z',
//       strokeColor: '#333',
//       strokeWidth: 2,
//     },
//     {
//       id: 'arm-right-front',
//       name: 'Right Arm',
//       path: 'M 220 120 C 240 120, 260 140, 260 160 C 260 180, 240 200, 220 200 C 200 200, 180 180, 180 160 C 180 140, 200 120, 220 120 Z',
//       strokeColor: '#333',
//       strokeWidth: 2,
//     },
//     {
//       id: 'thigh-left-front',
//       name: 'Left Thigh',
//       path: 'M 140 340 C 140 340, 140 360, 140 380 C 140 400, 160 420, 180 420 C 200 420, 220 400, 220 380 C 220 360, 220 340, 200 340 Z',
//       strokeColor: '#333',
//       strokeWidth: 2,
//     },
//     {
//       id: 'thigh-right-front',
//       name: 'Right Thigh',
//       path: 'M 180 340 C 180 340, 180 360, 180 380 C 180 400, 200 420, 220 420 C 240 420, 260 400, 260 380 C 260 360, 260 340, 240 340 Z',
//       strokeColor: '#333',
//       strokeWidth: 2,
//     },
//     {
//       id: 'leg-left-front',
//       name: 'Left Leg',
//       path: 'M 150 420 C 150 420, 150 440, 150 460 C 150 480, 170 500, 190 500 C 210 500, 230 480, 230 460 C 230 440, 230 420, 210 420 Z',
//       strokeColor: '#333',
//       strokeWidth: 2,
//     },
//     {
//       id: 'leg-right-front',
//       name: 'Right Leg',
//       path: 'M 190 420 C 190 420, 190 440, 190 460 C 190 480, 210 500, 230 500 C 250 500, 270 480, 270 460 C 270 440, 270 420, 250 420 Z',
//       strokeColor: '#333',
//       strokeWidth: 2,
//     },
//   ];

//   return customRegions;
// };

// Function to extract paths from your custom SVG files (for future use)
// const extractPathsFromCustomSVGs = async () => {
//   try {
//     // This would require loading the SVG content and extracting paths
//     // For now, we'll use the simplified approach above
//     // You can implement this later to use your actual SVG paths
//     
//     // Example of how you could extract paths from your SVGs:
//     // const fullBodyPaths = await extractPathFromSVG(fullBody);
//     // const headPaths = await extractPathFromSVG(head);
//     // etc.
//     
//     return createCustomRegions();
//   } catch (error) {
//     console.error('Error extracting paths from SVGs:', error);
//     return createCustomRegions();
//   }
// };

const BodyMapComponent: React.FC<BodyMapComponentProps> = ({
  data = {},
  onRegionSelect,
  width = 400,
  height = 600,
  // view = 'both'
}) => {
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null);
  
  // Sample data for body regions if none provided
  const defaultData: BodyMapData = {
    'head-front': { value: 0, label: 'Head' },
    'neck-front': { value: 0, label: 'Neck' },
    'leftShoulder-front': { value: 0, label: 'Left Shoulder' },
    'rightShoulder-front': { value: 0, label: 'Right Shoulder' },
    'chest-front': { value: 0, label: 'Chest' },
    'abdomen-front': { value: 0, label: 'Abdomen' },
    'arm-left-front': { value: 0, label: 'Left Arm' },
    'arm-right-front': { value: 0, label: 'Right Arm' },
    'thigh-left-front': { value: 0, label: 'Left Thigh' },
    'thigh-right-front': { value: 0, label: 'Right Thigh' },
    'leg-left-front': { value: 0, label: 'Left Leg' },
    'leg-right-front': { value: 0, label: 'Right Leg' },
  };

  const bodyData = Object.keys(data).length > 0 ? data : defaultData;

  const handleRegionClick = (regionId: string, region: any) => {
    const regionData = bodyData[regionId];
    setSelectedRegion({ 
      id: regionId, 
      name: region.name, 
      data: regionData 
    });
    
    // Call parent callback if provided
    if (onRegionSelect) {
      onRegionSelect(regionId, region);
    }
    
    console.log('Clicked region:', regionId, region.name);
  };

  const handleRegionHover = (_regionId: string, region: any) => {
    console.log('Hovering over:', region.name);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Interactive Body Map */}
        <div>
          <div style={{ position: 'relative', width: width, height: height }}>
            {/* Your imported head SVG */}
            <img 
              src={head} 
              alt="Head SVG" 
              style={{ 
                width: '20%', 
                height: '20%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '10%',
                left: '40%',
                ...(selectedRegion?.id === 'head-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}
              onClick={() => handleRegionClick('head-front', { name: 'Head' })}
              onMouseEnter={() => handleRegionHover('head-front', { name: 'Head' })}
            />
            
            {/* Your imported neck SVG */}
            <img 
              src={neck} 
              alt="Neck SVG" 
              style={{ 
                width: '15%', 
                height: '15%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '19.5%',
                left: '42.5%',
                ...(selectedRegion?.id === 'neck-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('neck-front', { name: 'Neck' })}
              onMouseEnter={() => handleRegionHover('neck-front', { name: 'Neck' })}
            />
            
            {/* Your imported Left Shoulder SVG (flipped right shoulder) */}
            <img 
              src={rightShoulder} 
              alt="Left Shoulder SVG" 
            style={{ 
                width: '15%', 
                height: '15%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '21.7%',
                left: '50%',
                transform: 'scaleX(-1)',
                ...(selectedRegion?.id === 'leftShoulder-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('leftShoulder-front', { name: 'Left Shoulder' })}
              onMouseEnter={() => handleRegionHover('leftShoulder-front', { name: 'Left Shoulder' })}
            />
            
            {/* Your imported Right Shoulder SVG */}
            <img 
              src={rightShoulder} 
              alt="Right Shoulder SVG" 
              style={{ 
                width: '15%', 
                height: '15%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '21.7%',
                left: '35%',
                ...(selectedRegion?.id === 'rightShoulder-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('rightShoulder-front', { name: 'Right Shoulder' })}
              onMouseEnter={() => handleRegionHover('rightShoulder-front', { name: 'Right Shoulder' })}
            />

            {/* Your imported Chest SVG */}
            <img 
              src={chest} 
              alt="Right Shoulder SVG" 
              style={{ 
                width: '15%', 
                height: '15%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '28.3%',
                left: '42.5%',
                ...(selectedRegion?.id === 'chest-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('chest-front', { name: 'Chest' })}
              onMouseEnter={() => handleRegionHover('chest-front', { name: 'Chest' })}
            />

            {/* Your imported Abdomen SVG */}
            <img 
              src={abdomen} 
              alt="Abdomen SVG" 
              style={{ 
                width: '15%', 
                height: '15%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '34.7%',
                left: '42.5%',
                ...(selectedRegion?.id === 'abdomen-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('abdomen-front', { name: 'Abdomen' })}
              onMouseEnter={() => handleRegionHover('abdomen-front', { name: 'Abdomen' })}
            />
            
            {/* Your imported Right Thigh SVG */}
            <img 
              src={rightTigh} 
              alt="Right Thigh SVG" 
              style={{ 
                width: '8%', 
                height: '8%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '44.60%',
                left: '42.5%',
                ...(selectedRegion?.id === 'rightThigh-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('rightThigh-front', { name: 'Right Thigh' })}
              onMouseEnter={() => handleRegionHover('rightThigh-front', { name: 'Right Thigh' })}
            />

            {/* Your imported Left Thigh SVG (flipped right thigh) */}
            <img 
              src={rightTigh} 
              alt="Left Thigh SVG" 
              style={{ 
                width: '8%', 
                height: '8%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '44.60%',
                left: '49.5%',
                transform: 'scaleX(-1)',
                ...(selectedRegion?.id === 'leftThigh-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('leftThigh-front', { name: 'Left Thigh' })}
              onMouseEnter={() => handleRegionHover('leftThigh-front', { name: 'Left Thigh' })}
            />

            {/* Your imported Right Leg SVG */}
            <img 
              src={rightLeg} 
              alt="Right Leg SVG" 
              style={{ 
                width: '9%', 
                height: '9%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '52.5%',
                left: '41.5%',
                ...(selectedRegion?.id === 'rightLeg-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('rightLeg-front', { name: 'Right Leg' })}
              onMouseEnter={() => handleRegionHover('rightLeg-front', { name: 'Right Leg' })}
            />

            {/* Your imported Right Leg SVG */}
            <img 
              src={rightLeg} 
              alt="Right Leg SVG" 
              style={{ 
                width: '9%', 
                height: '9%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '52.5%',
                left: '49.5%',
                transform: 'scaleX(-1)',
                ...(selectedRegion?.id === 'leftLeg-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('leftLeg-front', { name: 'Left Leg' })}
              onMouseEnter={() => handleRegionHover('leftLeg-front', { name: 'Left Leg' })}
            />

            {/* Your imported foot SVG */}
            <img 
              src={foot} 
              alt="Foot SVG" 
              style={{ 
                width: '9%', 
                height: '9%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '59%',
                left: '40.5%',
                ...(selectedRegion?.id === 'right-foot-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('right-foot-front', { name: 'Right Foot' })}
              onMouseEnter={() => handleRegionHover('right-foot-front', { name: 'Right Foot' })}
            />

            {/* Your imported foot SVG */}
            <img 
              src={foot} 
              alt="Foot SVG" 
              style={{ 
                width: '9%', 
                height: '9%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '59%',
                left: '50.5%',
                transform: 'scaleX(-1)',
                ...(selectedRegion?.id === 'left-foot-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('right-foot-front', { name: 'Right Foot' })}
              onMouseEnter={() => handleRegionHover('right-foot-front', { name: 'Right Foot' })}
            />

            {/* Your imported upper arm SVG */}
            <img 
              src={upperArm} 
              alt="Upper Arm SVG" 
              style={{ 
                width: '9%', 
                height: '9%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '30.3%',
                left: '32.5%',
                ...(selectedRegion?.id === 'right-upper-arm-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('right-upper-arm-front', { name: 'Right Upper Arm' })}
              onMouseEnter={() => handleRegionHover('right-upper-arm-front', { name: 'Right Upper Arm' })}
            />

            {/* Your imported upper arm SVG */}
            <img 
              src={upperArm} 
              alt="Upper Arm SVG" 
              style={{ 
                width: '9%', 
                height: '9%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '30.3%',
                left: '58.5%',
                transform: 'scaleX(-1)',
                ...(selectedRegion?.id === 'left-upper-arm-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('left-upper-arm-front', { name: 'Left Upper Arm' })}
              onMouseEnter={() => handleRegionHover('left-upper-arm-front', { name: 'Left Upper Arm' })}
            />

            {/* Your imported lower arm SVG */}
            <img 
              src={lowerArm} 
              alt="Lower Arm SVG" 
              style={{ 
                width: '10%', 
                height: '9%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '35.7%',
                left: '30.0%',
                ...(selectedRegion?.id === 'right-lower-arm-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('right-lower-arm-front', { name: 'Right Lower Arm' })}
              onMouseEnter={() => handleRegionHover('right-lower-arm-front', { name: 'Right Lower Arm' })}
            />

            {/* Your imported lower arm SVG */}
            <img 
              src={lowerArm} 
              alt="Lower Arm SVG" 
              style={{ 
                width: '10%', 
                height: '9%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '35.7%',
                left: '59.9%',
                transform: 'scaleX(-1)',
                ...(selectedRegion?.id === 'left-lower-arm-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('left-lower-arm-front', { name: 'Left Lower Arm' })}
              onMouseEnter={() => handleRegionHover('left-lower-arm-front', { name: 'Left Lower Arm' })}
            />

            {/* Your imported hand SVG */}
            <img 
              src={hand} 
              alt="Hand SVG" 
              style={{ 
                width: '10%', 
                height: '9%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '42.0%',
                left: '27.1%',
                ...(selectedRegion?.id === 'right-hand-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('right-hand-front', { name: 'Right Hand' })}
              onMouseEnter={() => handleRegionHover('right-hand-front', { name: 'Right Hand' })}
            />

            {/* Your imported hand SVG */}
            <img 
              src={hand} 
              alt="Hand SVG" 
              style={{ 
                width: '10%', 
                height: '9%', 
                objectFit: 'contain',
                cursor: 'pointer',
                position: 'absolute',
                top: '42.0%',
                left: '62.9%',
                transform:'scaleX(-1)',
                ...(selectedRegion?.id === 'left-hand-front' ? { filter: 'brightness(0) saturate(100%) invert(17%) sepia(86%) saturate(6132%) hue-rotate(351deg) brightness(98%) contrast(98%)' } : {})
              }}    
              onClick={() => handleRegionClick('left-hand-front', { name: 'Left Hand' })}
              onMouseEnter={() => handleRegionHover('left-hand-front', { name: 'Left Hand' })}
            />
            {/* Overlay for other body parts if needed */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {/* You can add other body parts as overlays here */}
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div style={{ minWidth: '250px' }}>
          <h3>Body Map Information</h3>
          
          {selectedRegion ? (
            <div style={{ 
              padding: '15px', 
              background: '#e3f2fd', 
              borderRadius: '8px',
              borderLeft: '4px solid #2196f3'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#2196f3' }}>
                {selectedRegion.name}
              </h4>
              <p><strong>Value:</strong> {selectedRegion.data?.value || 'N/A'}</p>
              <p><strong>Label:</strong> {selectedRegion.data?.label || 'N/A'}</p>
              <p><strong>Color:</strong> {selectedRegion.data?.color || 'Default'}</p>
            </div>
          ) : (
            <div style={{ 
              padding: '15px', 
              background: '#fff3cd', 
              borderRadius: '8px',
              border: '1px solid #ffeaa7',
              color: '#856404'
            }}>
              <p>Click on a body region to see information</p>
            </div>
          )}

          {/* <div style={{ marginTop: '20px' }}>
            <h4>Instructions:</h4>
            <ul style={{ fontSize: '14px', lineHeight: '1.5' }}>
              <li>Click on any body region to select it</li>
              <li>Selected regions are highlighted in blue</li>
              <li>Colors represent different data values</li>
              <li>Hover over regions to see details</li>
            </ul>
          </div> */}
          </div>
      </div>

      {/* Data Display */}
      {/* <div style={{ marginTop: '30px' }}>
        <h3>Current Data</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '10px' 
        }}>
          {Object.entries(bodyData).map(([regionId, data]) => (
            <div key={regionId} style={{ 
              padding: '10px', 
              background: '#f8f9fa', 
              borderRadius: '5px',
              border: '1px solid #dee2e6'
            }}>
              <strong>{regionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
              <br />
              Value: {data.value} | Label: {data.label || 'N/A'}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default BodyMapComponent; 