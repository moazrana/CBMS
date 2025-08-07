import React from 'react';
import beat from '../../../assets/safeguarding/beat.svg'
import home from '../../../assets/safeguarding/home.svg'
import calendar from '../../../assets/safeguarding/calendar.svg'
import extractDateAndTime  from '../../../functions/formatTimeRange';
import './llistComponent.scss'
interface ComponentProps{
    student:string
    subject:string
    eventTime:string | Date
    description:string
    location:string
    status:boolean
    onClick?:()=>void
}
const ListComponent:React.FC<ComponentProps>=({
    student,
    subject,
    eventTime,
    description,
    location,
    status,
    onClick
})=>{
    return(
        <div className="component-div" onClick={onClick}>
            <div className="upper-div">
                <div className="student">
                    <div className="student-name-div">
                        <p className="student-name">{student}</p>
                        <p className="loc-sub">({location}-{subject})</p>
                    </div>
                    <div className="buttons-div">
                        <div className="new-div">
                            <p>New</p>
                        </div>
                        <div className="status-div">
                            <img src={beat} alt="icon" style={{ width: 15, height: 15, marginRight: 8,filter: 'var(--status-color)' }} />Open
                        </div>
                    </div>
                </div>
                <div className='boxed-location-comp'><img src={home} alt="icon" style={{ width: 15, height: 15, marginRight: 8 }} />{location}</div>
            </div>
            <div className="down-div">
                <div className="description-div">
                    <p className="description-heading">Description</p>
                    <p className="compo-description">{description}</p>
                </div>
                <div className="date-div">
                    <div className="date-box">
                        <img src={calendar} alt="icon" style={{ width: 15, height: 15, marginRight: 8,filter: `var(--nav-icon-filter)`,fill: 'var(--nav-icon-filter)' }} />
                        {extractDateAndTime(typeof eventTime === 'string' ? eventTime : eventTime.toISOString()).date}
                    </div>
                    <div className="b-day-box">12345{status} </div>
                </div>
            </div>
                    
                   
                            
        </div>
    )
}

export default ListComponent