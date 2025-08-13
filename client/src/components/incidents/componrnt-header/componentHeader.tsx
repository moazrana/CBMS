import React from 'react';
import sortingArrows from '../../../assets/safeguarding/sorting-arrows.svg'
interface HeaderProps{
    secName:string,
    count:number
}
const ComponentHeader:React.FC<HeaderProps>=({
    secName,
    count
})=>{
    return (
        <div className="components-header-div">
            <p>{secName}</p>
            <div className="compo-count-div">
            <img 
                src={sortingArrows} 
                alt="icon" 
                style={{ 
                    width: 19, 
                    height: 15, 
                    marginRight: 8,
                    filter: `var(--nav-icon-filter)`,
                    fill: 'var(--nav-icon-filter)'
                }} 
                />
                {count}
            </div>
        </div>
    )
}

export default ComponentHeader; 