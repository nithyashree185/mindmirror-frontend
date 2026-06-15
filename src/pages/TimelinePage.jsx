import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInsightsTimeline, getMoods } from '../api/services';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const TimelinePage = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const [timelineRes, moodsRes] = await Promise.all([
          getInsightsTimeline(user.id).catch(() => []),
          getMoods(user.id).catch(() => [])
        ]);

        let finalTimelineData = [];

        if (moodsRes && moodsRes.length > 0) {
          // Sort chronologically ascending
          const sortedMoods = [...moodsRes].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          const moodColors = {
            // Negative / Stress (Intensity 1)
            sad: '#ef4444',
            anxious: '#f97316',
            angry: '#ef4444',
            stressed: '#f97316',
            overwhelmed: '#f97316',
            fearful: '#ef4444',
            depressed: '#b91c1c',
            
            // Neutral / Calm (Intensity 2)
            neutral: '#3b82f6',
            calm: '#3b82f6',
            peaceful: '#3b82f6',
            content: '#3b82f6',
            
            // Positive (Intensity 3)
            happy: '#10b981',
            joyful: '#10b981',
            excited: '#10b981',
            grateful: '#10b981',
            proud: '#10b981'
          };

          const moodIntensities = {
            sad: 1, anxious: 1, angry: 1, stressed: 1, overwhelmed: 1, fearful: 1, depressed: 1,
            neutral: 2, calm: 2, peaceful: 2, content: 2,
            happy: 3, joyful: 3, excited: 3, grateful: 3, proud: 3
          };

          finalTimelineData = sortedMoods.map(m => {
            const dateObj = new Date(m.createdAt);
            const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            const moodKey = m.mood?.toLowerCase() || 'neutral';
            
            return {
              date: dateObj.toLocaleDateString(undefined, { weekday: 'short' }),
              fullDate: `${formattedDate} ${formattedTime}`,
              mood: m.mood || 'Neutral',
              intensity: moodIntensities[moodKey] || 2,
              color: moodColors[moodKey] || '#3b82f6'
            };
          });
        }
        
        if (finalTimelineData.length === 0 && Array.isArray(timelineRes) && timelineRes.length > 0) {
          finalTimelineData = timelineRes;
        }

        setData(finalTimelineData);
      } catch (error) {
        console.error("Failed to fetch timeline", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) fetchTimeline();
  }, [user]);

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-[#64748b]">Loading emotional timeline...</div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-[#e5e7eb]">
          <p className="font-semibold text-[#2f4f4f] mb-1">{dataPoint.fullDate} ({dataPoint.date})</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#64748b]">Detected Mood:</span>
            <span className="text-sm font-semibold capitalize px-2 py-0.5 rounded-md" style={{ backgroundColor: `${dataPoint.color === 'red' ? '#fee2e2' : dataPoint.color === 'orange' ? '#ffedd5' : dataPoint.color === 'green' ? '#dcfce3' : '#e0e7ff'}`, color: dataPoint.color }}>
              {dataPoint.mood || 'Neutral'}
            </span>
          </div>
          <p className="text-xs text-[#9ca3af] mt-2">Intensity Score: {dataPoint.intensity}/3</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[#2f4f4f] mb-2">Emotional Timeline</h1>
        <p className="text-[#64748b]">Observe the ebb and flow of your emotional state over time.</p>
      </header>

      <Card className="flex-1 flex flex-col min-h-[500px]">
        <CardHeader className="bg-[#faf9f6] border-b border-[#e5e7eb] py-4">
          <CardTitle>Recent Emotional Landscape</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-6 relative">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="fullDate" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 4]} // Intensity is 1-3
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  ticks={[1, 2, 3]}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#c4b5fd', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="intensity" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIntensity)" 
                  activeDot={{ r: 6, fill: '#483d8b', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-[#f5f3ff] text-[#a78bfa] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <h3 className="text-[#2f4f4f] font-semibold text-lg mb-1">Your emotional timeline will grow with each reflection.</h3>
              <p className="text-[#64748b] max-w-sm">
                Every journal entry adds a point to this graph. Even a single reflection will begin forming your emotional landscape.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimelinePage;
