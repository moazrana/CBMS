import React, { useState } from "react";
import './box.scss';

interface BoxProps{
    body:React.ReactNode;
    heading:string;
    subHeading:string;
    monthsDropdown:boolean;
    yearsDropdown:boolean;
    headerLeft:React.ReactNode;
}

const months = [
    { name: "January", value: 1 },
    { name: "February", value: 2 },
    { name: "March", value: 3 },
    { name: "April", value: 4 },
    { name: "May", value: 5 },
    { name: "June", value: 6 },
    { name: "July", value: 7 },
    { name: "August", value: 8 },
    { name: "September", value: 9 },
    { name: "October", value: 10 },
    { name: "November", value: 11 },
    { name: "December", value: 12 }
];

const years = [
    { name: "2023", value: 2023 },
    { name: "2024", value: 2024 },
    { name: "2025", value: 2025 },
    { name: "2026", value: 2026 },
    { name: "2027", value: 2027 },
    { name: "2028", value: 2028 },
    { name: "2029", value: 2029 },
    { name: "2030", value: 2030 }
];

const Box=({
    body,
    heading,
    subHeading,
    monthsDropdown=false,
    yearsDropdown=false,
    headerLeft=null
}:BoxProps)=>{      
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    return (
        <div className="box">
            <div className="header-div">
                <div className="right-div">
                    <div className="box-heading">
                        <p className="box-heading-text">
                            {heading}
                        </p>
                        
                        <p className="box-heading-sub-heading">
                            {subHeading}
                        </p>
                    </div>    
                    <div className="drop-down-div">
                        {monthsDropdown && (
                            <select 
                                className="dropdown months"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            >
                                {months.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        {yearsDropdown && (
                            <select 
                                className="dropdown"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {years.map((year) => (
                                    <option key={year.value} value={year.value}>
                                        {year.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    
                </div>
                <div className="left-div">
                    <div className="left-div-content">
                        {headerLeft}                        
                    </div>
                    <div className="left-div-icon">
                        
                    </div>
                </div>
            </div>
            <div className="body-div">
                {body}
            </div>
        </div>
    )
}

export default Box;