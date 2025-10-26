import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Target, Award, Star, Zap } from "lucide-react";

const Achievements = () => {
  const achievements = [
    {
      id: "1",
      icon: Flame,
      title: "7 Day Streak",
      description: "Completed workouts for 7 consecutive days",
      progress: 100,
      unlocked: true,
      date: "2 days ago",
      color: "text-orange-500",
    },
    {
      id: "2",
      icon: Trophy,
      title: "First Win",
      description: "Completed your first workout",
      progress: 100,
      unlocked: true,
      date: "1 month ago",
      color: "text-yellow-500",
    },
    {
      id: "3",
      icon: Target,
      title: "Goal Crusher",
      description: "Reached your weekly workout goal",
      progress: 100,
      unlocked: true,
      date: "1 week ago",
      color: "text-emerald-500",
    },
    {
      id: "4",
      icon: Star,
      title: "Perfect Week",
      description: "Complete 7 workouts in one week",
      progress: 85,
      unlocked: false,
      target: "6/7 workouts",
      color: "text-blue-500",
    },
    {
      id: "5",
      icon: Zap,
      title: "Speed Demon",
      description: "Complete 10 HIIT workouts",
      progress: 60,
      unlocked: false,
      target: "6/10 workouts",
      color: "text-purple-500",
    },
    {
      id: "6",
      icon: Award,
      title: "Consistency King",
      description: "Maintain a 30-day streak",
      progress: 40,
      unlocked: false,
      target: "12/30 days",
      color: "text-pink-500",
    },
  ];

  const stats = {
    totalBadges: achievements.filter((a) => a.unlocked).length,
    totalPoints: 1250,
    rank: "Silver",
    nextRank: "Gold",
    rankProgress: 65,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Achievements</h1>
            <p className="text-muted-foreground">
              Track your progress and unlock rewards
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold mb-1">{stats.totalBadges}</div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold mb-1">{stats.totalPoints}</div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold mb-1">{stats.rank}</div>
                <p className="text-sm text-muted-foreground">Current Rank</p>
              </CardContent>
            </Card>
          </div>

          {/* Rank Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Rank Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stats.rank}</span>
                <span className="text-muted-foreground">
                  {stats.rankProgress}% to {stats.nextRank}
                </span>
              </div>
              <Progress value={stats.rankProgress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Earn {1000 - stats.totalPoints} more points to reach {stats.nextRank} rank
              </p>
            </CardContent>
          </Card>

          {/* Achievement Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4">All Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={achievement.unlocked ? "border-primary" : "opacity-75"}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          achievement.unlocked ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <achievement.icon
                          className={`h-6 w-6 ${
                            achievement.unlocked ? achievement.color : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          {achievement.unlocked && (
                            <Badge variant="secondary" className="text-xs">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>

                    {achievement.unlocked ? (
                      <p className="text-xs text-muted-foreground">
                        Earned {achievement.date}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <Progress value={achievement.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">{achievement.target}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
