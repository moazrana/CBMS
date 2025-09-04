import React from 'react';
import skull from '../../../assets/safeguarding/bodymap/skull.svg';
import fullBody from '../../../assets/safeguarding/bodymap/fullBody.svg';

// interface RegionData {
//   value: number;
//   label: string;
//   color: string;
// }

// interface SelectedRegion {
//   id: string;
//   name: string;
//   data: RegionData;
// }

const BodyMapComponent: React.FC = () => {
  // const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null);
  
  // // Sample data for body regions
  // const bodyData: Record<string, RegionData> = {
  //   'head': { value: 25, label: '25%', color: '#ff6b6b' },
  //   'chest': { value: 75, label: '75%', color: '#4ecdc4' },
  //   'abdomen': { value: 45, label: '45%', color: '#45b7d1' },
  //   'left-arm': { value: 60, label: '60%', color: '#96ceb4' },
  //   'right-arm': { value: 80, label: '80%', color: '#feca57' },
  //   'left-leg': { value: 90, label: '90%', color: '#ff9ff3' },
  //   'right-leg': { value: 70, label: '70%', color: '#54a0ff' },
  // };

  // const handleRegionClick = (regionId: string) => {
  //   setSelectedRegion({ 
  //     id: regionId, 
  //     name: regionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
  //     data: bodyData[regionId] 
  //   });
  //   console.log('Clicked region:', regionId);
  // };

  // const getRegionColor = (regionId: string) => {
  //   if (selectedRegion?.id === regionId) {
  //     return '#66ccff';
  //   }
  //   return bodyData[regionId]?.color || '#f0f0f0';
  // };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Custom Body Map SVG */}
        <div>
          {/* <h3>Interactive Body Map</h3> */}
          <svg 
            width="600" 
            height="600" 
            viewBox="0 0 600 600"
            style={{ 
              // border: '2px solid #ccc', 
              // borderRadius: '8px',
              // boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              // background: '#fff'
            }}
          >
            {/* Full Body Outline - Left Side */}
            <g transform="translate(50, 50)">
              {/* Full Body */}
              <svg
                width="200"
                height="500"
                viewBox="0 0 200 500"
                style={{ display: 'block', margin: '0 auto' }}
              >
                <image href={fullBody} x="0" y="0" width="200" height="500" />
              </svg>
            </g>

            {/* Separate Head - Right Side */}
            <g transform="translate(250, 50)">
              {/* Head Outline */}
             <svg
               width="80"
               height="80"
               viewBox="0 0 80 80"
               style={{ display: 'block', margin: '0 auto' }}
             >
               <image href={skull} x="0" y="0" width="80" height="80" />
             </svg>
            
            </g>
          </svg>
        </div>

        {/* Information Panel */}
        {/* <div style={{ minWidth: '250px' }}>
          <h3>Information Panel</h3>
          
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

          <div style={{ marginTop: '20px' }}>
            <h4>Instructions:</h4>
            <ul style={{ fontSize: '14px', lineHeight: '1.5' }}>
              <li>Click on any body region to select it</li>
              <li>Selected regions are highlighted in blue</li>
              <li>Colors represent different data values</li>
            </ul>
          </div>
        </div> */}
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
              Value: {data.value} | Label: {data.label}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default BodyMapComponent; 