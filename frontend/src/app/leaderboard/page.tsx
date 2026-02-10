"use client";

import { useState, useEffect } from "react";
import { getCached, setCache } from "@/lib/dataCache";
import Navbar from "@/components/layout/Navbar";
import {
  ScrollReveal,
  ScrollProgressBar,
  ScrollToTop,
} from "@/components/ui/ScrollAnimations";
import { Trophy, Medal, Crown, Star, TrendingUp, Loader2 } from "lucide-react";
import { gameAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  rank: number;
  username: string;
  display_name?: string;
  xp: number;
  level: number;
  current_streak: number;
  avatar: number | null;
}

type TimeFilter = "all-time" | "monthly" | "weekly";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all-time");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true); // Keep setLoading(true) here for initial load or cache miss

        const cached = getCached<LeaderboardEntry[]>("leaderboard");
        if (cached) {
          // Add rank to each entry for cached data as well
          const rankedCachedData = cached.map(
            (entry: LeaderboardEntry, index: number) => ({
              ...entry,
              rank: index + 1,
            }),
          );
          setLeaderboard(rankedCachedData);
          setLoading(false);
          // Find user's rank if logged in for cached data
          if (user) {
            const userEntry = rankedCachedData.find(
              (e: LeaderboardEntry) => e.username === user.username,
            );
            if (userEntry) {
              setUserRank(userEntry.rank);
            }
          }
          return;
        }

        const response = await gameAPI.getLeaderboard();
        const data = response.data.leaderboard || [];
        // Add rank to each entry
        const rankedData = data.map(
          (entry: LeaderboardEntry, index: number) => ({
            ...entry,
            rank: index + 1,
          }),
        );
        setLeaderboard(rankedData);
        setCache("leaderboard", data); // Cache the raw data, not the ranked data

        // Find user's rank if logged in
        if (user) {
          const userEntry = rankedData.find(
            (e: LeaderboardEntry) => e.username === user.username,
          );
          if (userEntry) {
            setUserRank(userEntry.rank);
          }
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
        // Use empty array on error
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeFilter, user]);

  const getRankDisplay = (rank: number) => {
    const rankNumber = (
      <span
        className={`font-bold text-center ${rank <= 3 ? "text-lg" : ""} ${
          rank === 1
            ? "text-yellow-400"
            : rank === 2
              ? "text-gray-300"
              : rank === 3
                ? "text-amber-600"
                : "text-gray-400"
        }`}
      >
        #{rank}
      </span>
    );
    return rankNumber;
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
      <ScrollProgressBar />
      <ScrollToTop />
      <div className="min-h-screen pb-8">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Title & Filters */}
          <ScrollReveal animation="fade-up">
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
                          ? "text-white"
                          : "bg-[#1a1a2e] text-gray-400 hover:text-white border border-[#2d2d44]"
                      }`}
                      style={
                        timeFilter === filter
                          ? { background: "var(--primary)" }
                          : undefined
                      }
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
          </ScrollReveal>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: "var(--primary)" }}
              />
            </div>
          ) : leaderboard.length === 0 ? (
            <ScrollReveal animation="fade-up">
              <div className="pixel-box p-8 text-center">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">
                  No Rankings Yet
                </h2>
                <p className="text-gray-400">
                  Be the first to start learning and claim the top spot!
                </p>
              </div>
            </ScrollReveal>
          ) : (
            <>
              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* 2nd Place */}
                {leaderboard[1] && (
                  <ScrollReveal animation="fade-up" delay={100}>
                    <div className="pixel-box p-4 text-center mt-8">
                      <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto mb-3 border-2 border-gray-400/30">
                        <img
                          src={`/avatars/avatar-${leaderboard[1].avatar || 1}.png`}
                          alt={leaderboard[1].username}
                          className="w-full h-full object-cover object-top scale-150"
                        />
                      </div>
                      <Medal className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-white font-bold truncate">
                        {leaderboard[1].display_name || leaderboard[1].username}
                      </p>
                      <p className="text-purple-400 font-bold">
                        {leaderboard[1].xp.toLocaleString()} XP
                      </p>
                      <p className="text-gray-500 text-sm">
                        Level {leaderboard[1].level}
                      </p>
                    </div>
                  </ScrollReveal>
                )}

                {/* 1st Place */}
                {leaderboard[0] && (
                  <ScrollReveal animation="fade-up">
                    <div className="pixel-box p-4 text-center border-yellow-500/30 bg-yellow-500/5">
                      <div className="w-20 h-20 rounded-lg overflow-hidden mx-auto mb-3 border-2 border-yellow-500/50">
                        <img
                          src={`/avatars/avatar-${leaderboard[0].avatar || 1}.png`}
                          alt={leaderboard[0].username}
                          className="w-full h-full object-cover object-top scale-150"
                        />
                      </div>
                      <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                      <p className="text-white font-bold text-lg truncate">
                        {leaderboard[0].display_name || leaderboard[0].username}
                      </p>
                      <p className="text-yellow-400 font-bold text-xl">
                        {leaderboard[0].xp.toLocaleString()} XP
                      </p>
                      <p className="text-gray-500 text-sm">
                        Level {leaderboard[0].level}
                      </p>
                    </div>
                  </ScrollReveal>
                )}

                {/* 3rd Place */}
                {leaderboard[2] && (
                  <ScrollReveal animation="fade-up" delay={200}>
                    <div className="pixel-box p-4 text-center mt-8">
                      <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto mb-3 border-2 border-amber-600/30">
                        <img
                          src={`/avatars/avatar-${leaderboard[2].avatar || 1}.png`}
                          alt={leaderboard[2].username}
                          className="w-full h-full object-cover object-top scale-150"
                        />
                      </div>
                      <Medal className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                      <p className="text-white font-bold truncate">
                        {leaderboard[2].display_name || leaderboard[2].username}
                      </p>
                      <p className="text-purple-400 font-bold">
                        {leaderboard[2].xp.toLocaleString()} XP
                      </p>
                      <p className="text-gray-500 text-sm">
                        Level {leaderboard[2].level}
                      </p>
                    </div>
                  </ScrollReveal>
                )}
              </div>

              {/* Full Leaderboard Table */}
              <ScrollReveal animation="fade-up" delay={100}>
                <div className="pixel-box overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#2d2d44]">
                    <h2 className="text-lg font-bold text-white">Rankings</h2>
                  </div>

                  <div className="divide-y divide-[#2d2d44]">
                    {leaderboard.map((player, index) => (
                      <div
                        key={player.rank}
                        className={`px-6 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors ${getRankBg(player.rank)} ${user && player.username === user.username ? "bg-purple-500/10 border-l-4 border-purple-500" : ""}`}
                        style={{
                          animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                        }}
                      >
                        {/* Rank */}
                        <div className="w-10 flex justify-center">
                          {getRankDisplay(player.rank)}
                        </div>

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-purple-500/30">
                          <img
                            src={`/avatars/avatar-${player.avatar || 1}.png`}
                            alt={player.username}
                            className="w-full h-full object-cover object-top scale-150"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {player.display_name || player.username}
                            {user && player.username === user.username && (
                              <span className="text-purple-400 text-sm ml-2">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Level {player.level}
                          </p>
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
              </ScrollReveal>
            </>
          )}

          {/* Your Rank Card */}
          {user && userRank && (
            <ScrollReveal animation="fade-up" delay={150}>
              <div className="pixel-box p-6 mt-8 border-purple-500/30 bg-purple-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-purple-500/50">
                      <img
                        src={`/avatars/avatar-${user.avatar || 1}.png`}
                        alt={user.username}
                        className="w-full h-full object-cover object-top scale-150"
                      />
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
                      <span className="text-2xl font-bold">#{userRank}</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {user.xp?.toLocaleString() || 0} XP
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </Navbar>
  );
}
