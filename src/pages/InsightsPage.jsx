import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInsightsWeekly, getInsightsTriggers, getInsightsProfile } from '../api/services';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { BrainCircuit, Lightbulb, AlertCircle, Activity, TrendingUp } from 'lucide-react';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'];

const InsightsPage = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState(null);
  const [triggers, setTriggers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [weeklyRes, triggerRes, profileRes] = await Promise.all([
          getInsightsWeekly(user.id).catch(() => ({})),
          getInsightsTriggers(user.id).catch(() => ({ triggers: {} })),
          getInsightsProfile(user.id).catch(() => ({}))
        ]);
        
        setWeeklyData(weeklyRes);
        setProfile(profileRes);
        
        const triggerObj = triggerRes?.triggers || {};
        const triggerArray = Object.keys(triggerObj).map(k => ({ name: k, emotion: triggerObj[k] }));
        setTriggers(triggerArray);
      } catch (error) {
        console.error("Failed to fetch insights", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) fetchInsights();
  }, [user]);

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-[#64748b]">Analyzing your patterns...</div>;
  }

  const hasWeeklyData = weeklyData && (weeklyData.summary || weeklyData.moodCount);
  const moodChartData = weeklyData?.percentages
    ? Object.entries(weeklyData.percentages).map(([key, val]) => ({ name: key, value: val }))
    : [];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[#2f4f4f] mb-2">Emotional Insights</h1>
        <p className="text-[#64748b]">Understand the deeper patterns behind your feelings.</p>
      </header>

      {/* Weekly Synthesis */}
      {hasWeeklyData ? (
        <Card className="bg-gradient-to-br from-white to-[#f5f3ff] border-[#e5e7eb] shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="bg-[#e6e6fa] p-3 rounded-xl shadow-sm text-[#483d8b]">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#483d8b] mb-3">AI Weekly Synthesis</h3>
                <p className="text-[#2f4f4f] leading-relaxed text-lg mb-4">
                  {weeklyData?.summary}
                </p>
                {weeklyData?.causes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-1">Potential Causes</h4>
                    <p className="text-[#2f4f4f] leading-relaxed">{weeklyData.causes}</p>
                  </div>
                )}
                {weeklyData?.suggestion && (
                  <div className="bg-white/60 p-4 rounded-xl border border-white mt-2">
                    <h4 className="text-sm font-semibold text-[#8b5cf6] flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4" /> Recommendation
                    </h4>
                    <p className="text-[#2f4f4f] text-sm leading-relaxed">{weeklyData.suggestion}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-2xl p-12 text-center">
          <BrainCircuit className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#334155] mb-2">Weekly patterns will appear as you journal.</h3>
          <p className="text-[#64748b] max-w-md mx-auto">AI-generated summaries, emotional causes, and behavioral recommendations will populate here after a few days of reflecting.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-[#e5e7eb]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#64748b]">Stress Baseline</span>
              <Activity className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-2xl font-bold text-[#2f4f4f] capitalize">{profile?.stressLevel || 'Unknown'}</span>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#e5e7eb]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#64748b]">Positivity Baseline</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-bold text-[#2f4f4f] capitalize">{profile?.positivity || 'Unknown'}</span>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#e5e7eb]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#64748b]">Stability Score</span>
              <BrainCircuit className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-2xl font-bold text-[#2f4f4f] capitalize">{profile?.emotionalStability || 'Unknown'}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Distribution */}
        <Card>
          <CardHeader className="bg-[#faf9f6] border-b border-[#e5e7eb] py-4">
            <CardTitle>Mood Distribution (%)</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            {moodChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {moodChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => `${value}%`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#9ca3af] text-sm">No percentage data available</div>
            )}
            
            {weeklyData?.dominantMood && (
              <div className="text-center mt-4 text-sm">
                <span className="text-[#64748b]">Dominant Week Emotion: </span>
                <span className="font-semibold text-[#8b5cf6] capitalize">{weeklyData.dominantMood}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Potential Triggers */}
        <Card>
          <CardHeader className="bg-[#faf9f6] border-b border-[#e5e7eb] py-4">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Detected Triggers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {triggers.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {triggers.map((trigger, i) => (
                  <div key={i} className="p-4 border border-[#e5e7eb] rounded-xl bg-white shadow-sm flex flex-col gap-1 hover:border-[#a78bfa] transition-colors">
                    <span className="font-semibold text-[#2f4f4f] capitalize">{trigger.name}</span>
                    <span className="text-sm text-[#64748b]">Triggers: <span className="font-medium text-[#483d8b] capitalize">{trigger.emotion}</span></span>
                  </div>
                ))}
               </div>
            ) : (
              <div className="p-8 text-center text-[#9ca3af] border border-dashed border-[#d1d5db] rounded-xl bg-[#faf9f6]">
                Triggers will be discovered naturally over time as you continue journaling.
              </div>
            )}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl text-blue-800 text-sm leading-relaxed">
              <strong>How this works:</strong> MindMirror analyzes the context of your reflections to map real-life situations (triggers) to the emotional states they produce.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsightsPage;
