import React, { useState, useEffect } from 'react';
import Layout from '../../layouts/layout';
import students from '../../assets/dashboard/students.svg'
import teachers from '../../assets/dashboard/teachears.svg'
import staff from '../../assets/dashboard/staff.svg'
import './dashboard.scss'
const Dashboard: React.FC = () => {
    return (
        <Layout>
            <div className="dashboard">
                <p className='welcome'>Welcome.</p>
                <p className='note'>Let's Make Today Smoother - Track, Manage, & Support With Ease</p>
                <div className='counts'>
                    <div className='students-div'>
                        <div className='data-div'>
                            <p className='title'>Students</p>
                            <p className='count'>999+</p>
                        </div>
                        <div className="icon-div">
                            <img src={students} style={{ width: 50, height: 50}}/>
                        </div>
                    </div>
                    <div className="teachers-div">
                        <div className='data-div'>
                            <p className='title'>Teachers</p>
                            <p className='count'>150+</p>
                        </div>
                        <div className="icon-div">
                            <img src={teachers} style={{ width: 50, height: 50}}/>
                        </div>
                    </div>
                    <div className="staff-div">
                        <div className='data-div'>
                            <p className='title'>Staff</p>
                            <p className='count'>90+</p>
                        </div>
                        <div className="icon-div">
                            <img src={staff} style={{ width: 50, height: 50}}/>
                        </div>
                    </div>
                </div>
                <div className='graphs'>
                    <div className="overview-div attendance">
                        <div className="overview-header">
                            <div className="overview-heading">
                                <p className='overview-heading-text'>Attendance Overview</p>
                                <p className='overview-heading-year'></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
export default Dashboard