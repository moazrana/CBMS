import React from 'react';
import ThreeDots from '../../assets/layout/threeDots.svg'
import './FilterSec.scss'
interface SecProps{
    secName:string,
    year?:string,
    content:React.ReactNode
}
const FilterSec:React.FC<SecProps>=({
    secName,
    year='2025',
    content
})=>{
    return (
        <div className="filter-sec">
            <div className="sec-name-div">
                <p className='sec-name'>{secName}</p>
                <p className="year">{year}</p>
            </div>
            <div className="content-div">
                {content}
            </div>
            <div className="small-div">
            <img 
                src={ThreeDots} 
                alt="icon" 
                style={{ 
                    width: 19, 
                    height: 19, 
                    marginRight: 8,
                    filter: `var(--nav-icon-filter)`,
                    fill: 'var(--nav-icon-filter)'
                }} 
            />
            </div>
        </div>
    )
}
export default FilterSec