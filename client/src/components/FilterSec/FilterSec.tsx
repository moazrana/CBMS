import React, { useState } from 'react';
import ThreeDots from '../../assets/layout/threeDots.svg'
import './FilterSec.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp,faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
interface SecProps{
    secName:string,
    year?:string,
    content:React.ReactNode
    retractable?:boolean
}
const FilterSec:React.FC<SecProps>=({
    secName,
    year='2025',
    content,
    retractable=false
})=>{
    const [retracted,setRetracted]=useState<boolean>(false)
    return (
        <div className="filter-sec">
            <div className="sec-name-div">
                <p className='sec-name'>{secName}</p>
                {!retracted&&<p className="year">{year}</p>}
            </div>
            <div className="content-div">
            {!retracted&&content}
            </div>
            
            <div className="small-div">
                {retractable&&
                    <>
                        <div onClick={() => setRetracted(prev => !prev)}>
                            {retracted&&<FontAwesomeIcon icon={faChevronUp}/>}
                            {!retracted&&<FontAwesomeIcon icon={faChevronDown}/>}
                        </div>
                        
                    </>
                }
                {!retractable&&
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
                />}
                <div>
                    <button className='seach-btn'><FontAwesomeIcon icon={faMagnifyingGlass}/></button>
                </div>
            </div>
        </div>
    )
}
export default FilterSec