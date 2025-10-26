import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { TodayWorkoutCard } from "@/components/dashboard/TodayWorkoutCard";
import { StatsWidget } from "@/components/dashboard/StatsWidget";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import { Weight, Dumbbell, Flame, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <WelcomeSection />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsWidget
              title="Current Weight"
              value="75 kg"
              icon={Weight}
              trend="-2kg this month"
              trendUp={true}
            />
            <StatsWidget
              title="Workouts"
              value="24"
              icon={Dumbbell}
              trend="+8 this week"
              trendUp={true}
            />
            <StatsWidget
              title="Calories Burned"
              value="3,420"
              icon={Flame}
              trend="+420 today"
              trendUp={true}
            />
            <StatsWidget
              title="Current Streak"
              value="12 days"
              icon={TrendingUp}
              trend="Personal best!"
              trendUp={true}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <TodayWorkoutCard />
              <ActivityFeed />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <QuickActions />
              <AchievementBadges />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
