import React from 'react';
import { BarChart3, TrendingUp, Fuel, DollarSign, Calendar, MapPin } from 'lucide-react';
import { User, FuelEntry } from '../App';

interface StatisticsProps {
  fuelEntries: FuelEntry[];
  user: User;
}

export const Statistics: React.FC<StatisticsProps> = ({ fuelEntries, user }) => {
  // Filter entries for current user if porter
  const userEntries = user.role === 'admin' ? fuelEntries : fuelEntries.filter(entry => entry.userId === user.id);

  // Calculate statistics
  const totalEntries = userEntries.length;
  const totalCost = userEntries.reduce((sum, entry) => sum + entry.fuelCost, 0);
  const totalGallons = userEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0);
  const avgCostPerGallon = totalGallons > 0 ? totalCost / totalGallons : 0;

  // Current month stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthEntries = userEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });
  const thisMonthCost = thisMonthEntries.reduce((sum, entry) => sum + entry.fuelCost, 0);
  const thisMonthGallons = thisMonthEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0);

  // Last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysEntries = userEntries.filter(entry => new Date(entry.timestamp) >= thirtyDaysAgo);
  const last30DaysCost = last30DaysEntries.reduce((sum, entry) => sum + entry.fuelCost, 0);

  // Monthly breakdown (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthEntries = userEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.getMonth() === month && entryDate.getFullYear() === year;
    });
    
    monthlyData.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      entries: monthEntries.length,
      cost: monthEntries.reduce((sum, entry) => sum + entry.fuelCost, 0),
      gallons: monthEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0)
    });
  }

  return (
    <div className="flex flex-col h-full px-6 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-white text-2xl mb-2">Statistics</h2>
        <p className="text-slate-300/80">
          {user.role === 'admin' ? 'All fuel entries' : 'Your fuel expense analytics'}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-2">
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-slate-300 text-sm">This Month</span>
          </div>
          <p className="text-white text-xl font-medium">{thisMonthEntries.length}</p>
          <p className="text-slate-400 text-xs">entries</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-2">
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-slate-300 text-sm">Month Cost</span>
          </div>
          <p className="text-white text-xl font-medium">${thisMonthCost.toFixed(0)}</p>
          <p className="text-slate-400 text-xs">{thisMonthGallons.toFixed(1)} gal</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mr-2">
              <Fuel className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-slate-300 text-sm">Total Entries</span>
          </div>
          <p className="text-white text-xl font-medium">{totalEntries}</p>
          <p className="text-slate-400 text-xs">all time</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mr-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-slate-300 text-sm">Avg $/Gal</span>
          </div>
          <p className="text-white text-xl font-medium">${avgCostPerGallon.toFixed(2)}</p>
          <p className="text-slate-400 text-xs">average</p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
        <h3 className="text-white text-lg mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          6-Month Trend
        </h3>
        
        <div className="space-y-3">
          {monthlyData.map((month, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-slate-300 text-sm w-8">{month.month}</span>
                <div className="flex-1">
                  <div className="bg-white/5 rounded-full h-2 w-20">
                    <div 
                      className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((month.entries / Math.max(...monthlyData.map(m => m.entries)) || 1) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">${month.cost.toFixed(0)}</p>
                <p className="text-slate-400 text-xs">{month.entries} entries</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-white text-lg mb-4">Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-300">Total Spent (All Time):</span>
              <span className="text-white font-medium">${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Total Gallons:</span>
              <span className="text-white">{totalGallons.toFixed(1)} gal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Last 30 Days:</span>
              <span className="text-white">${last30DaysCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Average Per Entry:</span>
              <span className="text-white">${totalEntries > 0 ? (totalCost / totalEntries).toFixed(2) : '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {userEntries.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <h3 className="text-white text-lg mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {userEntries.slice(0, 3).map((entry, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                      <Fuel className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm">
                        {entry.stockNumber || (entry.vin === 'VIN_FROM_PHOTO' ? 'VIN from Photo' : entry.vin?.slice(-6) || 'Unknown Vehicle')}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">${entry.fuelCost.toFixed(2)}</p>
                    <p className="text-slate-400 text-xs">{entry.fuelAmount} gal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {totalEntries === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-400 mb-2">No fuel entries yet</p>
            <p className="text-slate-500 text-sm">
              Start by adding your first fuel entry
            </p>
          </div>
        </div>
      )}
    </div>
  );
};