"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Trophy, Medal, Crown, Flame, Star, TrendingUp } from "lucide-react";

// Mock leaderboard data - will be replaced with API data later
const mockLeaderboardData = [
  {
    rank: 1,
    username: "CodeMaster99",
    xp: 45200,
    level: 46,
    streak: 120,
    avatar: null,
  },
  {
    rank: 2,
    username: "DevNinja",
    xp: 42100,
    level: 43,
    streak: 89,
    avatar: null,
  },
  {
    rank: 3,
    username: "ByteWarrior",
    xp: 38900,
    level: 39,
    streak: 67,
    avatar: null,
  },
  {
    rank: 4,
    username: "PixelCoder",
    xp: 35600,
    level: 36,
    streak: 54,
    avatar: null,
  },
  {
    rank: 5,
    username: "SyntaxSamurai",
    xp: 32400,
    level: 33,
    streak: 45,
    avatar: null,
  },
  {
    rank: 6,
    username: "LogicLord",
    xp: 29800,
    level: 30,
    streak: 38,
    avatar: null,
  },
  {
    rank: 7,
    username: "BugHunter",
    xp: 27200,
    level: 28,
    streak: 32,
    avatar: null,
  },
  {
    rank: 8,
    username: "AlgoAce",
    xp: 24500,
    level: 25,
    streak: 28,
    avatar: null,
  },
  {
    rank: 9,
    username: "DataDragon",
    xp: 22100,
    level: 23,
    streak: 21,
    avatar: null,
  },
  {
    rank: 10,
    username: "ScriptWizard",
    xp: 19800,
    level: 20,
    streak: 18,
    avatar: null,
  },
  {
    rank: 11,
    username: "FunctionFury",
    xp: 17600,
    level: 18,
    streak: 15,
    avatar: null,
  },
  {
    rank: 12,
    username: "LoopLegend",
    xp: 15400,
    level: 16,
    streak: 12,
    avatar: null,
  },
  {
    rank: 13,
    username: "VariableViking",
    xp: 13200,
    level: 14,
    streak: 10,
    avatar: null,
  },
  {
    rank: 14,
    username: "ArrayArcher",
    xp: 11000,
    level: 12,
    streak: 8,
    avatar: null,
  },
  {
    rank: 15,
    username: "StackSurfer",
    xp: 9500,
    level: 10,
    streak: 7,
    avatar: null,
  },
];

type TimeFilter = "all-time" | "monthly" | "weekly";

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all-time");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="text-gray-400 font-bold w-6 text-center">
            {rank}
          </span>
        );
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/30";
      case 2:
        return "bg-gray-400/10 border-gray-400/30";
      case 3:
        return "bg-amber-600/10 border-amber-600/30";
      default:
        return "";
    }
  };

  return (
    <Navbar>
      <div className="min-h-screen pb-8">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Title & Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Top Coders
              </h1>
              <p className="text-gray-400 mt-1">
                Compete with others and climb the ranks!
              </p>
            </div>

            {/* Time Filter */}
            <div className="flex gap-2">
              {(["all-time", "monthly", "weekly"] as TimeFilter[]).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 md:px-4 py-2 text-sm font-medium transition-colors ${
                      timeFilter === filter
                        ? "bg-purple-500 text-white"
                        : "bg-[#1a1a2e] text-gray-400 hover:text-white border border-[#2d2d44]"
                    }`}
                  >
                    {filter === "all-time"
                      ? "All Time"
                      : filter === "monthly"
                        ? "This Month"
                        : "This Week"}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="pixel-box p-4 text-center mt-8">
              <div className="w-16 h-16 bg-gray-500/20 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-gray-400">
                {mockLeaderboardData[1].username.charAt(0)}
              </div>
              <Medal className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-white font-bold truncate">
                {mockLeaderboardData[1].username}
              </p>
              <p className="text-purple-400 font-bold">
                {mockLeaderboardData[1].xp.toLocaleString()} XP
              </p>
              <p className="text-gray-500 text-sm">
                Level {mockLeaderboardData[1].level}
              </p>
            </div>

            {/* 1st Place */}
            <div className="pixel-box p-4 text-center border-yellow-500/30 bg-yellow-500/5">
              <div className="w-20 h-20 bg-yellow-500/20 mx-auto mb-3 flex items-center justify-center text-3xl font-bold text-yellow-400">
                {mockLeaderboardData[0].username.charAt(0)}
              </div>
              <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
              <p className="text-white font-bold text-lg truncate">
                {mockLeaderboardData[0].username}
              </p>
              <p className="text-yellow-400 font-bold text-xl">
                {mockLeaderboardData[0].xp.toLocaleString()} XP
              </p>
              <p className="text-gray-500 text-sm">
                Level {mockLeaderboardData[0].level}
              </p>
            </div>

            {/* 3rd Place */}
            <div className="pixel-box p-4 text-center mt-8">
              <div className="w-16 h-16 bg-amber-600/20 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-amber-500">
                {mockLeaderboardData[2].username.charAt(0)}
              </div>
              <Medal className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-white font-bold truncate">
                {mockLeaderboardData[2].username}
              </p>
              <p className="text-purple-400 font-bold">
                {mockLeaderboardData[2].xp.toLocaleString()} XP
              </p>
              <p className="text-gray-500 text-sm">
                Level {mockLeaderboardData[2].level}
              </p>
            </div>
          </div>

          {/* Full Leaderboard Table */}
          <div className="pixel-box overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2d2d44]">
              <h2 className="text-lg font-bold text-white">Rankings</h2>
            </div>

            <div className="divide-y divide-[#2d2d44]">
              {mockLeaderboardData.map((player) => (
                <div
                  key={player.rank}
                  className={`px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors ${getRankBg(player.rank)}`}
                >
                  {/* Rank */}
                  <div className="w-8 flex justify-center">
                    {getRankIcon(player.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                    {player.username.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {player.username}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Level {player.level}
                    </p>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center gap-1 text-orange-400">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-medium">{player.streak}</span>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-purple-400">
                      <Star className="w-4 h-4" />
                      <span className="font-bold">
                        {player.xp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Rank Card */}
          <div className="pixel-box p-6 mt-8 border-purple-500/30 bg-purple-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl">
                  Y
                </div>
                <div>
                  <p className="text-white font-bold">Your Ranking</p>
                  <p className="text-gray-400 text-sm">
                    Keep learning to climb higher!
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-purple-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-2xl font-bold">#42</span>
                </div>
                <p className="text-gray-500 text-sm">1,250 XP to next rank</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
