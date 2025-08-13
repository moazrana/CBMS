import React, { useState, useMemo, useEffect } from 'react';
import './DataTable.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import Popup from '../Popup/Popup';
import { PermissionGuard } from '../PermissionGuard';
interface Column {
  header: string;
  accessor: string;
  sortable?: boolean;
  type?: 'number' | 'string' | 'date' | 'template'|'tenChars';
  template?: (row: Record<string, unknown>, rowIndex: number) => React.ReactNode;
  
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  title?: string;
  onDelete?:  (row: Record<string, any>) => void;
  onSort?: (key: string, direction: 'ASC' | 'DESC') => void;
  onSearch?: (searchTerm: string) => void;
  PerPage?: (number: number) => void;
  onAdd?: () => void;
  onEdit:  (row: Record<string, any>) => void;
  showActions?: boolean;
  addButton?: boolean;
  showSearch?:boolean;
  addPermission?:string;
}

const DataTable: React.FC<DataTableProps> = ({ 
  columns,
  data,
  title,
  onDelete, 
  onSort, 
  onSearch,
  PerPage,
  onAdd,
  onEdit,
  showActions = true,
  addButton = true,
  showSearch=true,
  addPermission=''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  useEffect(() => {
    if (PerPage) {
      PerPage(itemsPerPage);
    }
  }, [itemsPerPage]);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  }, [searchTerm]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ASC' | 'DESC';
  } | null>(null);

  const filteredAndSortedData = useMemo(() => {
    let filteredData = [...data];

    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortConfig.key];
        const bVal = (b as Record<string, unknown>)[sortConfig.key];
        const aStr = String(aVal);
        const bStr = String(bVal);
        if (aStr < bStr) {
          return sortConfig.direction === 'ASC' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === 'ASC' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [data, searchTerm, sortConfig, itemsPerPage]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const requestSort = (key: string) => {
    let direction: 'ASC' | 'DESC' = 'ASC';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ASC'
    ) {
      direction = 'DESC';
    }
    setSortConfig({ key, direction });
    if (onSort) {
      onSort(key, direction);
    }
  };

  interface DeletePopupState {
    isOpen: boolean;
    obj: { name?: string } | null;
  }
  const [deletePopup, setDeletePopup] = React.useState<DeletePopupState>({ isOpen: false, obj: null });
  const handleDelete = async (obj: Record<string, unknown>) => {
    setDeletePopup({ isOpen: true, obj });
  };
  const confirmDelete = async () => {
    if (deletePopup.obj) {
      if (onDelete) {
        await onDelete(deletePopup.obj);
      }
      setDeletePopup({ isOpen: false, obj: null });
    }
  };
  return (
    <>
      <div className="data-table">
        <div className="data-table-header">
          {title && <h2>{title}</h2>}
          <div className="search-box">
            {showSearch&&<input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              className='table-search'
              onChange={(e) => setSearchTerm(e.target.value)}
            />}
            {addButton && (
              <PermissionGuard permission={addPermission}>
                <button className="add-button" onClick={onAdd}>+</button>
              </PermissionGuard>
              )}
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessor}
                    onClick={() => column.sortable && requestSort(column.accessor)}
                    className={column.sortable ? 'sortable' : ''}
                  >
                    {column.header}
                    {sortConfig?.key === column.accessor && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'ASC' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </th>
                ))}
                {showActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr key={index}>
                  {columns.map((column,cindex) => (
                    (() => {
                      let tdClass=''
                      if(cindex==0)
                        tdClass='first-td-class'
                      if(cindex==columns.length-1)
                        tdClass='last-td-class'
                      const last=cindex==columns.length-1
                      if(column.accessor === 'num'){
                        return <td className={tdClass} key={column.accessor}><div className={last?"last-td-div":"td-div"}>{index + 1}</div></td>;
                      }
                      switch(column.type) {
                        case 'number':
                          return <td className={tdClass} key={column.accessor}><div className={last?"last-td-div":"td-div"}>{String(row[column.accessor])}</div></td>;
                        case 'string':
                          return row[column.accessor]!=null? <td className={tdClass} key={column.accessor}><div className={last?"last-td-div":"td-div"}>{String(row[column.accessor])}</div></td>:<td key={column.accessor}><div className={last?"last-td-div":"td-div"}>--</div></td>;
                        case 'date': {
                          const now = new Date();
                          const date = new Date(row[column.accessor] as string | number | Date);
                          const diffInMilliseconds = now.getTime() - date.getTime();
                          const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
                          const diffInHours = Math.floor(diffInMinutes / 60);
                          const diffInDays = Math.floor(diffInHours / 24);

                          let timeAgo;
                          if (diffInDays > 30) {
                            return <td className={tdClass} key={column.accessor}>{date.toLocaleDateString()}</td>;
                          } else if (diffInDays > 0) {
                            timeAgo = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
                          } else if (diffInHours > 0) {
                            timeAgo = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
                          } else if (diffInMinutes > 0) {
                            timeAgo = `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
                          } else {
                            timeAgo = 'just now';
                          }
                          return <td className={tdClass} key={column.accessor}><div className={last?"last-td-div":"td-div"}>{timeAgo}</div></td>;
                        }
                        case 'template':
                          if (column.template) {
                            return <td className={tdClass} key={column.accessor}><div className={last?"last-td-div":"td-div"}>{column.template(row, index)}</div></td>;
                          }
                          return <td className={tdClass} key={column.accessor}></td>;
                        case 'tenChars':
                          return <td title={String(row[column.accessor])}>
                            <div className={last?"last-td-div":"td-div"}>{String(row[column.accessor]).length>10?String(row[column.accessor]).slice(0,10)+'...':String(row[column.accessor])}</div></td>
                        default:
                          return <td className={tdClass} key={column.accessor}><div className={last?"last-td-div":"td-div"}>{String(row[column.accessor])}</div></td>;
                      }
                    })()
                  ))}
                  {showActions && (
                   <td className='last-td-class'>
                      <button 
                        id="edit" 
                        className="action-button"
                        onClick={()=>onEdit(row)}
                      >
                        <FontAwesomeIcon icon={faPencil} />
                      </button>
                      <button 
                        id="delete" 
                        className="action-button"
                        onClick={()=>handleDelete(row)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
       
        {totalPages > 0 && (
          <div className="pagination">
             <div className="items-per-page">
              <label htmlFor="itemsPerPage">per page: </label>
              <select 
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="items-per-page-select"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="pagination-buttons">
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`page-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      <Popup
        isOpen={deletePopup.isOpen}
        onClose={() => setDeletePopup({ isOpen: false, obj: null })}
        onConfirm={confirmDelete}
        title="Delete"
        message={`Are you sure you want to delete ${deletePopup.obj?.name || deletePopup.obj}`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default DataTable; 