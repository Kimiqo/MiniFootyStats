import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLeaderboard } from '../hooks/useAPI';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Loading, ErrorMessage } from '../components/Feedback';

export const Leaderboard = () => {
  const { groupId } = useParams();
  const { data: leaderboard, isLoading, error } = useLeaderboard(groupId);
  const [activeTab, setActiveTab] = useState('goals');

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load leaderboard" />;
  }

  const tabs = [
    { key: 'goals', label: '⚽ Goals', icon: '⚽' },
    { key: 'assists', label: '🎯 Assists', icon: '🎯' },
    { key: 'saves', label: '🧤 Saves', icon: '🧤' },
    { key: 'mvp', label: '🏆 MVP', icon: '🏆' },
    { key: 'appearances', label: '📊 Appearances', icon: '📊' },
  ];

  const getStatValue = (player) => {
    switch (activeTab) {
      case 'goals':
        return player.totalGoals;
      case 'assists':
        return player.totalAssists;
      case 'saves':
        return player.totalSaves;
      case 'mvp':
        return player.totalMVP;
      case 'appearances':
        return player.totalAppearances;
      default:
        return 0;
    }
  };

  const currentData = leaderboard[activeTab] || [];

  return (
    <div className="space-y-6">
      <div className="text-center py-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-xl">See who's leading the pack</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tabs.find((t) => t.key === activeTab)?.label || 'Rankings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentData.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data available yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Player</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">
                      {tabs.find((t) => t.key === activeTab)?.icon}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((player, index) => {
                    const statValue = getStatValue(player);

                    return (
                      <tr
                        key={player._id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                          index < 3 && statValue > 0 ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold text-lg ${
                              index === 0 && statValue > 0 ? 'text-yellow-500' :
                              index === 1 && statValue > 0 ? 'text-gray-400' :
                              index === 2 && statValue > 0 ? 'text-orange-600' :
                              'text-gray-500'
                            }`}>
                              {index + 1}
                            </span>
                            {index === 0 && statValue > 0 && <span className="text-2xl">👑</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-800">
                          {player.name}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                            {statValue}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="text-center py-6">
            <div className="text-4xl mb-2">⚽</div>
            <div className="text-3xl font-bold text-blue-600">
              {leaderboard.goals?.[0]?.totalGoals || 0}
            </div>
            <div className="text-gray-600 mt-1">Top Goals</div>
            <div className="text-sm text-gray-500 mt-1">
              {leaderboard.goals?.[0]?.name || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-3xl font-bold text-yellow-600">
              {leaderboard.mvp?.[0]?.totalMVP || 0}
            </div>
            <div className="text-gray-600 mt-1">Most MVPs</div>
            <div className="text-sm text-gray-500 mt-1">
              {leaderboard.mvp?.[0]?.name || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold text-green-600">
              {leaderboard.appearances?.[0]?.totalAppearances || 0}
            </div>
            <div className="text-gray-600 mt-1">Most Appearances</div>
            <div className="text-sm text-gray-500 mt-1">
              {leaderboard.appearances?.[0]?.name || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
