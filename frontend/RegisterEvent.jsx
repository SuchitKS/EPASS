import React, { useEffect } from 'react';

export default function RegisterEvent() {
  useEffect(() => {
    // Place any event loading logic here
  }, []);

  return (
    <div className="relative size-full min-h-screen flex-col group/design-root overflow-x-hidden" style={{ fontFamily: 'Plus Jakarta Sans, Noto Sans, sans-serif', background: 'linear-gradient(to right, #E4E5E6, #00416A)', display: 'flex' }}>
      <div className="layout-container flex h-full grow flex-col w-full">
        <div className="px-40 flex flex-1 justify-center py-5 w-full">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 bg-white rounded-xl p-6 shadow-lg">
            {/* Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <h1 className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">All Events</h1>
                <p className="text-[#6a7681] text-sm font-normal leading-normal">Discover and join events happening around you</p>
              </div>
              <div className="flex gap-2">
                <button id="filterAll" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#00416A] text-white text-sm font-medium leading-normal">All</button>
                <button id="filterUpcoming" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#f1f2f4] text-[#121416] text-sm font-medium leading-normal hover:bg-[#e1e2e4] transition-all">Upcoming</button>
                <button id="filterOngoing" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#f1f2f4] text-[#121416] text-sm font-medium leading-normal hover:bg-[#e1e2e4] transition-all">Ongoing</button>
                <button id="filterCompleted" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#f1f2f4] text-[#121416] text-sm font-medium leading-normal hover:bg-[#e1e2e4] transition-all">Completed</button>
              </div>
            </div>
            {/* Loading, Error, Events, No Events, Back Button sections would go here */}
          </div>
        </div>
      </div>
    </div>
  );
}
