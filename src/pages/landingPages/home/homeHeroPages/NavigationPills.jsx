import React from 'react';

const NavigationPills = ({ activeTab, setActiveTab, contentData }) => {
    return (
        <>
            {/* Section Title */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-6 text-center">
                <h2 className="text-[#1a1a1a] text-[36px] lg:text-[44px] xl:text-[48px] font-bold leading-tight tracking-tight">
                    Explore EduCollaborate's AI Tools
                </h2>
            </div>

            {/* Navigation Pills - Matching Image Design */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-16">
                <div className="flex justify-center overflow-x-auto no-scrollbar">
                    
                    <nav className="inline-flex items-center bg-white rounded-full px-2 py-2 shadow-[8px_12px_35px_rgba(0,0,0,0.08)] border border-gray-200/50 min-w-max">
                        {Object.keys(contentData).map((tab) => {
                            const isActive = activeTab === tab;
                            const isTryItNow = tab === 'Try It Now';
                            return (
                                <div key={tab} className="flex items-center">
                                    <button
                                        onClick={() => setActiveTab(tab)}
                                        className={`
                                            ${isTryItNow ? 'px-6' : 'px-6'} py-3.5 rounded-full text-[16px] transition-all duration-300 whitespace-nowrap
                                            ${isActive 
                                                ? `bg-gradient-to-r ${contentData[tab]?.color || 'from-[#00c4cc] to-[#6366f1]'} text-white font-semibold shadow-sm hover:shadow-md scale-[1.02]` 
                                                : 'text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        {tab}
                                    </button>
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default NavigationPills;
