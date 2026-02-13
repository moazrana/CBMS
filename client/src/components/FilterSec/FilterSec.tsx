import React, { useState } from 'react';
import ThreeDots from '../../assets/layout/threeDots.svg'
import './FilterSec.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface SecProps {
    secName: string;
    year?: string;
    content: React.ReactNode;
    retractable?: boolean;
    /** When set, the filter button shows this icon and calls onActionClick instead of default search */
    actionIcon?: IconDefinition;
    onActionClick?: () => void;
}

const FilterSec: React.FC<SecProps> = ({
    secName,
    content,
    retractable = false,
    actionIcon,
    onActionClick,
}) => {
    const [retracted, setRetracted] = useState<boolean>(false);
    const icon = actionIcon ?? faMagnifyingGlass;
    return (
        <div className="filter-sec">
            <div className="sec-name-div">
                <p className='sec-name'>{secName}</p>
            </div>
            <div className="content-div">
                {!retracted && content}
            </div>

            <div className="small-div">
                {retractable && (
                    <>
                        <div onClick={() => setRetracted(prev => !prev)}>
                            {retracted && <FontAwesomeIcon icon={faChevronUp} />}
                            {!retracted && <FontAwesomeIcon icon={faChevronDown} />}
                        </div>
                    </>
                )}
                {!retractable && (
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
                )}
                <div>
                    <button
                        type="button"
                        className="seach-btn"
                        onClick={onActionClick}
                        title={actionIcon ? 'Clear and show initial list' : undefined}
                    >
                        <FontAwesomeIcon icon={icon} />
                    </button>
                </div>
            </div>
        </div>
    );
};
export default FilterSec