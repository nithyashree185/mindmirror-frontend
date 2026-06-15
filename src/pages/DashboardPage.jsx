import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getStreak, 
  getInsightsProfile, 
  getInsightsWeekly, 
  getInsightsTriggers,
  getMoods 
} from '../api/services';
import { Flame, PenTool, Sparkles, Activity, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

const DashboardPage = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(null);
  const [profile, setProfile] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [triggers, setTriggers] = useState([]);
  const [moods, setMoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streakData, profileData, weeklyData, triggersData, moodData] = await Promise.all([
          getStreak(user.id).catch(() => ({})),
          getInsightsProfile(user.id).catch(() => ({})),
          getInsightsWeekly(user.id).catch(() => ({})),
          getInsightsTriggers(user.id).catch(() => ({ triggers: {} })),
          getMoods(user.id).catch(() => [])
        ]);
        
        setStreak(streakData);
        setProfile(profileData);
        setWeekly(weeklyData);
        
        const triggerObj = triggersData?.triggers || {};
        const triggerArray = Object.keys(triggerObj).map(k => ({ name: k, emotion: triggerObj[k] }));
        setTriggers(triggerArray);
        
        setMoods(moodData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) fetchData();
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-[#64748b]">Loading your space...</div>;
  }

  const moodChartData = weekly?.moodCount 
    ? Object.entries(weekly.moodCount).map(([key, val]) => ({ name: key, value: val }))
    : [];

  const topTrigger = triggers.length > 0 ? triggers[0] : null;
  const hasData = streak?.totalJournalDays > 0;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-[#2f4f4f] mb-2">
          {greeting()}, {user?.name || 'there'}
        </h1>
        <p className="text-lg text-[#64748b]">
          "The clearest way into the Universe is through a forest wilderness." – John Muir
        </p>
      </header>

      <section className="mb-8">
        <Link 
          to="/journal" 
          onClick={() => {
            localStorage.removeItem('currentChatId');
            window.dispatchEvent(new Event('storage'));
          }}
          className="group block w-full bg-[#483d8b] hover:bg-[#5e50a8] transition-colors rounded-2xl p-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Sparkles className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-full text-white backdrop-blur-sm">
              <PenTool className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-1">New Reflection</h2>
              <p className="text-white/80 text-lg">Take a moment to reflect on your day right now.</p>
            </div>
          </div>
        </Link>
      </section>

      {hasData ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white border-[#e5e7eb]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#64748b]">Current Streak</span>
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-3xl font-bold text-[#2f4f4f]">{streak?.currentStreak || 0}</span>
                <p className="text-xs text-[#9ca3af] mt-1">Longest: {streak?.longestStreak || 0}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-[#e5e7eb]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#64748b]">Total Days</span>
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-3xl font-bold text-[#2f4f4f]">{streak?.totalJournalDays || 0}</span>
                <p className="text-xs text-[#9ca3af] mt-1 line-clamp-1">{streak?.badge || 'No badge yet'}</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#e5e7eb]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#64748b]">Dominant Mood</span>
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-2xl font-bold text-[#2f4f4f] capitalize line-clamp-1">{profile?.dominantMood || 'Neutral'}</span>
                <p className="text-xs text-[#9ca3af] mt-1">From recent entries</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#e5e7eb]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#64748b]">Stress Level</span>
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-2xl font-bold text-[#2f4f4f] capitalize">{profile?.stressLevel || 'Unknown'}</span>
                <p className="text-xs text-[#9ca3af] mt-1">
                  Positivity: <span className="capitalize">{profile?.positivity || 'Unknown'}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="flex flex-col">
              <CardHeader className="bg-[#faf9f6] border-b border-[#e5e7eb] py-4">
                <CardTitle className="text-lg">Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <p className="text-[#2f4f4f] leading-relaxed mb-6">
                  {weekly?.summary || "You haven't logged enough entries this week for a comprehensive analysis. Keep journaling to unlock deep insights."}
                </p>
                {weekly?.suggestion && (
                  <div className="bg-[#f5f3ff] p-4 rounded-xl border border-[#ede9fe] flex gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <p className="text-sm text-[#483d8b] italic">{weekly.suggestion}</p>
                  </div>
                )}
                {topTrigger && (
                  <div className="mt-4 text-sm text-[#64748b]">
                    Top recent trigger: <span className="font-semibold text-[#2f4f4f] capitalize">{topTrigger.name}</span> 
                    {' '} (associated with {topTrigger.emotion})
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-[#faf9f6] border-b border-[#e5e7eb] py-4">
                <CardTitle className="text-lg">Mood Distribution (7 Days)</CardTitle>
              </CardHeader>
              <CardContent className="h-64 p-0">
                {moodChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={moodChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {moodChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#9ca3af] text-sm">No data for the past 7 days</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="bg-[#faf9f6] border-b border-[#e5e7eb] py-4">
                <CardTitle className="text-lg">Recent Entries</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 {moods.length > 0 ? (
                    <div className="divide-y divide-[#f1f5f9] max-h-80 overflow-y-auto custom-scrollbar">
                      {moods.slice(0, 8).map((m, i) => (
                        <div key={i} className="p-4 hover:bg-[#faf9f6] transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs text-[#9ca3af]">
                              {new Date(m.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <div className="px-2 py-0.5 rounded-md bg-[#e6e6fa] text-[#483d8b] text-[10px] uppercase font-bold tracking-wider">
                              {m.mood}
                            </div>
                          </div>
                          <p className="text-sm text-[#2f4f4f] line-clamp-2">{m.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-[#9ca3af]">No recent entries to display.</div>
                  )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-[#faf9f6] border-b border-[#e5e7eb] py-4">
                <CardTitle className="text-lg">Emotional Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Overall Stability</span>
                  <span className="font-semibold text-[#2f4f4f] capitalize">{profile?.emotionalStability || 'Not enough data'}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Stress Outlook</span>
                  <span className="font-semibold text-[#2f4f4f] capitalize">{profile?.stressLevel || 'Not enough data'}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[#f1f5f9]">
                  <span className="text-[#64748b]">Positive Affect</span>
                  <span className="font-semibold text-[#2f4f4f] capitalize">{profile?.positivity || 'Not enough data'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748b]">Total Entries</span>
                  <span className="font-semibold text-[#2f4f4f]">{moods.length} logged</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="w-full bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-2xl p-16 text-center shadow-sm">
          <Activity className="w-16 h-16 text-[#cbd5e1] mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-[#334155] mb-3">Your emotional journey begins here.</h3>
          <p className="text-[#64748b] text-lg max-w-md mx-auto">Write your first reflection to unlock your dashboard insights and begin tracking your emotional landscape over time.</p>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;
