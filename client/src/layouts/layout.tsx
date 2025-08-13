import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Sidebar from './../components/sidebar/Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faPlus } from '@fortawesome/free-solid-svg-icons';
import './layout.scss';
import { useNavigate } from 'react-router-dom';
import ComponentsView from '../assets/layout/componentsView.svg'
import TableView from '../assets/layout/tableView.svg'
import Filter from '../assets/layout/filter.svg'
import { PermissionGuard } from '../components/PermissionGuard';

type LayoutProps = {
  children: React.ReactNode;
  heading?: string;
  note?: string;
  showNew?: boolean;
  showPagination?: boolean;
  showFilter?: boolean;
  showViewType?: boolean;
  createLink?:string;
  view?:string;
  changeView?:()=>void;
  filters?:React.ReactNode;
  openFilters?:boolean;
  filtersBtnClicked?:()=>void;
  newPermission?:string;
};

export default function Layout({
  children,
  heading = '',
  note = '',
  showNew = false,
  showPagination = false,
  showFilter = false,
  showViewType = false,
  createLink='',
  view='table',
  changeView,
  filters,
  openFilters=false,
  filtersBtnClicked,
  newPermission,
}: LayoutProps) {
  const navigate = useNavigate();
  return (
    <div className="app-layout">
        <div className="navs">
            <Sidebar />
            <div className="app-main">
                <Navbar />
                <main className="app-content">
                  <div className="head">
                    <div className="heading-div">
                      <p className='heading'>{heading}</p>
                      <p className='note'>{note}</p>
                    </div>
                    <div className="btn-div">
                      {showNew && (
                        <PermissionGuard permission={newPermission}>
                          <button
                            className='create-btn'
                            onClick={() => createLink && navigate(createLink)}
                          >
                            <FontAwesomeIcon icon={faPlus}/> Create new
                          </button>
                        </PermissionGuard>
                      )}
                      {showFilter&&(
                        <button className='head-btn' onClick={filtersBtnClicked}> 
                          <img 
                            src={Filter} 
                            alt="icon" 
                            style={{ 
                              width: 15, 
                              height: 15, 
                              marginRight: 8,
                              filter: `var(--nav-icon-filter)`,
                              fill: 'var(--nav-icon-filter)'
                            }} 
                          />
                        </button>
                      )}
                      {showViewType&&(
                        <button className='head-btn' onClick={changeView}>
                          <img 
                            src={view=='table'?ComponentsView:TableView} 
                            alt="icon" 
                            style={{ 
                              width: 15, 
                              height: 15, 
                              marginRight: 8,
                              filter: `var(--nav-icon-filter)`,
                              fill: 'var(--nav-icon-filter)'
                            }} 
                          />
                        </button>
                      )}
                      {showPagination&&(
                        <>
                          <button className='head-btn circle' onClick={() => window.history.back()}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                          </button>
                          <button className='head-btn circle' onClick={() => window.history.forward()}>
                            <FontAwesomeIcon icon={faChevronRight} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {openFilters&&(
                    <div id="filter-div">
                      <div className="filter-header-div">
                        <p className="filter-header">Filter Overview.</p>
                      </div>
                      <div className="filter-content">
                        {filters}
                      </div>
                    </div>
                  )}
                  
                  <div id='child-div' >
                    {children}
                  </div>
                </main>
            </div>
        </div>
    </div>
  );
}
