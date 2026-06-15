import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './Tooltip'; // We need a simple Tooltip. I will create it.

export const Heatmap = ({ moods = [], days = 30 }) => {
  // Group moods by date string YYYY-MM-DD
  const activityMap = useMemo(() => {
    const map = {};
    moods.forEach(entry => {
      const dateObj = new Date(entry.createdAt);
      if (isNaN(dateObj)) return;
      
      const dateStr = dateObj.toISOString().split('T')[0];
      if (!map[dateStr]) map[dateStr] = { count: 0, moods: [] };
      map[dateStr].count += 1;
      map[dateStr].moods.push(entry.mood);
    });
    return map;
  }, [moods]);

  // Generate grid for the last X days
  const grid = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysArray = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      daysArray.push({
        dateStr,
        dateObj: d,
        data: activityMap[dateStr] || { count: 0, moods: [] }
      });
    }
    return daysArray;
  }, [activityMap, days]);

  // Color mapping based on intensity
  const getColor = (count) => {
    if (count === 0) return 'bg-[#f1f5f9]'; // Slate-100 (Empty)
    if (count === 1) return 'bg-[#d8b4e2]'; // Light Purple
    if (count === 2) return 'bg-[#b678c4]'; // Medium Purple
    if (count === 3) return 'bg-[#924da3]'; // Darker Purple
    return 'bg-[#483d8b]'; // Deep Purple (Brand Accent)
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 flex-wrap items-center">
        {grid.map((day, idx) => {
          const { count, moods } = day.data;
          const displayDate = day.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          return (
            <TooltipProvider key={day.dateStr}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={cn(
                      "w-4 h-4 rounded-sm transition-transform hover:scale-110 cursor-pointer border border-black/5",
                      getColor(count)
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent className="bg-[#2f4f4f] text-white text-xs border-none shadow-md px-3 py-1.5 rounded-md">
                  <div className="font-semibold">{displayDate}</div>
                  <div>{count} {count === 1 ? 'entry' : 'entries'}</div>
                  {count > 0 && (
                    <div className="text-white/70 mt-0.5 capitalize text-[10px]">
                      Moods: {Array.from(new Set(moods)).join(', ')}
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-[#64748b]">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-[#f1f5f9] border border-black/5" />
          <div className="w-3 h-3 rounded-sm bg-[#d8b4e2] border border-black/5" />
          <div className="w-3 h-3 rounded-sm bg-[#b678c4] border border-black/5" />
          <div className="w-3 h-3 rounded-sm bg-[#924da3] border border-black/5" />
          <div className="w-3 h-3 rounded-sm bg-[#483d8b] border border-black/5" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
