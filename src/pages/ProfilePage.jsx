import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInsightsProfile, getStreak, getMoods } from '../api/services';
import { User, Mail, Calendar, LogOut, Award, Flame, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Heatmap } from '../components/ui/Heatmap';
import { cn } from '../lib/utils';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [streak, setStreak] = useState(null);
  const [moods, setMoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileData, streakData, moodData] = await Promise.all([
          getInsightsProfile(user.id).catch(() => ({})),
          getStreak(user.id).catch(() => ({ currentStreak: 0, longestStreak: 0, totalJournalDays: 0 })),
          getMoods(user.id).catch(() => [])
        ]);
        setProfile(profileData);
        setStreak(streakData);
        setMoods(moodData);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) fetchProfile();
  }, [user]);

  const getCalculatedDominantMood = () => {
    if (profile?.dominantMood && profile.dominantMood !== 'neutral') {
      return profile.dominantMood;
    }
    if (moods.length > 0) {
      const counts = {};
      moods.forEach(m => {
        if (m.mood) {
          counts[m.mood] = (counts[m.mood] || 0) + 1;
        }
      });
      let maxMood = '';
      let maxCount = 0;
      Object.entries(counts).forEach(([mood, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxMood = mood;
        }
      });
      if (maxMood) return maxMood;
    }
    return profile?.dominantMood || 'neutral';
  };

  const getCalculatedStressLevel = () => {
    if (profile?.stressLevel && profile.stressLevel !== 'unknown' && profile.stressLevel !== 'medium') {
      return profile.stressLevel;
    }
    if (moods.length > 0) {
      const stressMoods = ['sad', 'anxious', 'angry', 'stressed', 'overwhelmed', 'fearful', 'depressed'];
      const count = moods.filter(m => stressMoods.includes(m.mood?.toLowerCase())).length;
      const ratio = count / moods.length;
      if (ratio > 0.5) return 'high';
      if (ratio > 0.2) return 'medium';
      return 'low';
    }
    return profile?.stressLevel || 'low';
  };

  const getCalculatedPositivity = () => {
    if (profile?.positivity && profile.positivity !== 'unknown' && profile.positivity !== 'medium') {
      return profile.positivity;
    }
    if (moods.length > 0) {
      const positiveMoods = ['happy', 'joyful', 'excited', 'calm', 'peaceful', 'content', 'grateful', 'proud'];
      const count = moods.filter(m => positiveMoods.includes(m.mood?.toLowerCase())).length;
      const ratio = count / moods.length;
      if (ratio > 0.6) return 'high';
      if (ratio > 0.3) return 'medium';
      return 'low';
    }
    return profile?.positivity || 'medium';
  };

  const getCalculatedStability = () => {
    if (profile?.emotionalStability && profile.emotionalStability !== 'unknown' && profile.emotionalStability !== 'medium') {
      return profile.emotionalStability;
    }
    if (moods.length > 0) {
      const uniqueMoods = new Set(moods.map(m => m.mood?.toLowerCase()).filter(Boolean));
      if (uniqueMoods.size <= 2) return 'high';
      if (uniqueMoods.size <= 4) return 'medium';
      return 'low';
    }
    return profile?.emotionalStability || 'medium';
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-[#64748b]">Loading profile...</div>;
  }

  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  const totalEntries = moods.length;
  const currentStreak = streak?.currentStreak || 0;
  const hasData = totalEntries > 0;
  
  const achievements = [
    { name: '7-Day Streak', icon: Flame, unlocked: currentStreak >= 7, color: 'text-orange-500', bg: 'bg-orange-100' },
    { name: '10 Entries', icon: BookOpen, unlocked: totalEntries >= 10, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: '30 Entries', icon: BookOpen, unlocked: totalEntries >= 30, color: 'text-purple-500', bg: 'bg-purple-100' },
    { name: '100 Entries', icon: BrainCircuit, unlocked: totalEntries >= 100, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-[#e6e6fa] rounded-full flex items-center justify-center text-[#483d8b]">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2f4f4f] mb-1">
              {user?.name || 'User'}
            </h1>
            <div className="flex items-center gap-4 text-[#64748b] mt-2">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>{user?.email || 'Not available'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#ef4444] font-medium hover:bg-[#fef2f2] transition-colors text-sm border border-[#ef4444]/20"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-[#e5e7eb]">
          <CardContent className="p-5 flex flex-col gap-2">
            <p className="text-sm text-[#64748b]">Current Streak</p>
            <p className="text-2xl font-bold text-[#2f4f4f] flex items-center gap-2">
              {currentStreak} <Flame className="w-5 h-5 text-orange-500" />
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e7eb]">
          <CardContent className="p-5 flex flex-col gap-2">
            <p className="text-sm text-[#64748b]">Longest Streak</p>
            <p className="text-2xl font-bold text-[#2f4f4f]">
              {streak?.longestStreak || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e7eb]">
          <CardContent className="p-5 flex flex-col gap-2">
            <p className="text-sm text-[#64748b]">Total Entries</p>
            <p className="text-2xl font-bold text-[#2f4f4f] flex items-center gap-2">
              {totalEntries} <BookOpen className="w-5 h-5 text-blue-500" />
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e5e7eb]">
          <CardContent className="p-5 flex flex-col gap-2">
            <p className="text-sm text-[#64748b]">Dominant Mood</p>
            <p className="text-2xl font-bold text-[#2f4f4f] capitalize">
              {hasData ? getCalculatedDominantMood() : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <CardHeader className="bg-[#faf9f6] border-b border-[#e5e7eb] py-4">
              <CardTitle className="text-lg">Activity Landscape (35 Days)</CardTitle>
            </CardHeader>
            <CardContent className="p-8 overflow-x-auto">
              <Heatmap moods={moods} days={35} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="w-5 h-5 text-[#8b5cf6]" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasData ? (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {achievements.map((ach, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-4 border rounded-xl flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 transition-all",
                        ach.unlocked ? "border-[#e5e7eb] bg-white shadow-sm" : "border-dashed border-[#d1d5db] bg-gray-50 opacity-60 grayscale"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", ach.bg)}>
                        <ach.icon className={cn("w-5 h-5", ach.color)} />
                      </div>
                      <div>
                        <p className="font-medium text-[#2f4f4f] text-sm">{ach.name}</p>
                        <p className="text-[11px] text-[#64748b] uppercase tracking-wider font-semibold mt-1">
                          {ach.unlocked ? 'Unlocked' : 'Locked'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-[#9ca3af] border border-dashed border-[#d1d5db] rounded-xl bg-[#faf9f6] mt-4">
                  Start journaling to unlock achievements.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {hasData ? (
            <Card>
              <CardHeader className="bg-[#faf9f6] border-b border-[#e5e7eb] py-4">
                <CardTitle className="text-lg">Emotional Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#64748b]">Stress Level</span>
                    <span className="text-sm font-bold text-[#2f4f4f] capitalize">{getCalculatedStressLevel()}</span>
                  </div>
                  <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      getCalculatedStressLevel() === 'high' ? 'w-full bg-rose-500' :
                      getCalculatedStressLevel() === 'medium' ? 'w-1/2 bg-amber-500' : 'w-1/4 bg-emerald-500'
                    )} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#64748b]">Positivity</span>
                    <span className="text-sm font-bold text-[#2f4f4f] capitalize">{getCalculatedPositivity()}</span>
                  </div>
                  <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      getCalculatedPositivity() === 'high' ? 'w-full bg-emerald-500' :
                      getCalculatedPositivity() === 'medium' ? 'w-1/2 bg-amber-500' : 'w-1/4 bg-rose-500'
                    )} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#64748b]">Emotional Stability</span>
                    <span className="text-sm font-bold text-[#2f4f4f] capitalize">{getCalculatedStability()}</span>
                  </div>
                  <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      getCalculatedStability() === 'high' ? 'w-full bg-[#8b5cf6]' :
                      getCalculatedStability() === 'medium' ? 'w-1/2 bg-[#a78bfa]' : 'w-1/4 bg-[#ddd6fe]'
                    )} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="bg-[#faf9f6] border-b border-[#e5e7eb] py-4">
                <CardTitle className="text-lg">Emotional Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center text-[#9ca3af]">
                Your emotional profile will build as you reflect. Write your first journal entry to begin.
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="bg-[#faf9f6] border-b border-[#e5e7eb] py-4">
              <CardTitle className="text-lg">Recent Moods</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {moods.length > 0 ? (
                <div className="divide-y divide-[#f1f5f9]">
                  {moods.slice(0, 5).map((m, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-[#faf9f6] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                        <span className="text-sm font-medium text-[#2f4f4f] capitalize">{m.mood}</span>
                      </div>
                      <span className="text-xs text-[#9ca3af]">
                        {new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-[#9ca3af]">Your recent moods will appear here after journaling.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
