import React from 'react';
import './ContentBox.scss';

interface ContentBoxProps{
    children: React.ReactNode;
    label:string,
    icon?:string
}
const ContentBox:React.FC<ContentBoxProps>=({
    children,
    label='',
    icon
})=>{
    return(
        <div className="content-main-div">
            <label htmlFor={label}>
                {icon && <img 
                    src={icon} 
                    alt="icon" 
                    style={{ 
                        width: 19, 
                        height: 19, 
                        marginRight: 8,
                        filter: `var(--icon-filter)`,
                        fill: 'var(--main-text)'
                    }} 
                />}
                {label}
            </label>
            <div className="content">
                {children}
            </div>
        </div>
        )
}

export default ContentBox