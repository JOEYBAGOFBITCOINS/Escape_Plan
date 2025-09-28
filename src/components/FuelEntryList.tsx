import React, { useState } from 'react';
import { List, Search, Filter, Car, Receipt, MapPin, Calendar, Fuel, DollarSign } from 'lucide-react';
import { Input } from './ui/input';
import { User, FuelEntry } from '../App';

interface FuelEntryListProps {
  fuelEntries: FuelEntry[];
  user: User;
}

export const FuelEntryList: React.FC<FuelEntryListProps> = ({ fuelEntries, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'thisMonth' | 'lastMonth'>('all');

  // Filter entries for current user if porter
  const userEntries = user.role === 'admin' ? fuelEntries : fuelEntries.filter(entry => entry.userId === user.id);

  // Apply search and filters
  const filteredEntries = userEntries.filter(entry => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      entry.stockNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filter
    const entryDate = new Date(entry.timestamp);
    const now = new Date();
    let matchesDateFilter = true;

    if (filterBy === 'thisMonth') {
      matchesDateFilter = entryDate.getMonth() === now.getMonth() && 
                          entryDate.getFullYear() === now.getFullYear();
    } else if (filterBy === 'lastMonth') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      matchesDateFilter = entryDate.getMonth() === lastMonth.getMonth() && 
                          entryDate.getFullYear() === lastMonth.getFullYear();
    }

    return matchesSearch && matchesDateFilter;
  });

  // Sort by most recent first
  const sortedEntries = filteredEntries.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="flex flex-col h-full px-6 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <List className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-white text-2xl mb-2">Fuel Entries</h2>
        <p className="text-slate-300/80">
          {user.role === 'admin' ? 'All submitted fuel entries' : 'Your fuel entry history'}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by stock #, VIN, user, or notes..."
              className="bg-white/5 border-white/20 text-white placeholder-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20 pl-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterBy('all')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filterBy === 'all'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilterBy('thisMonth')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filterBy === 'thisMonth'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilterBy('lastMonth')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filterBy === 'lastMonth'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                  : 'bg-white/5 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Last Month
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {sortedEntries.length > 0 && (
        <div className="bg-white/5 rounded-xl p-3 mb-4 flex justify-between items-center">
          <span className="text-slate-300 text-sm">
            {sortedEntries.length} {sortedEntries.length === 1 ? 'entry' : 'entries'} found
          </span>
          <span className="text-slate-300 text-sm">
            Total: ${sortedEntries.reduce((sum, entry) => sum + entry.fuelCost, 0).toFixed(2)}
          </span>
        </div>
      )}

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {sortedEntries.length > 0 ? (
          sortedEntries.map((entry, index) => (
            <div key={entry.id} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    {entry.stockNumber ? (
                      <Car className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Receipt className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {entry.stockNumber || (entry.vin === 'VIN_FROM_PHOTO' ? 'VIN from Photo' : `VIN: ${entry.vin?.slice(-6) || 'Unknown'}`)}
                    </h3>
                    <p className="text-slate-300 text-sm">
                      {user.role === 'admin' && `${entry.userName} • `}
                      {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-medium text-lg">${entry.fuelCost.toFixed(2)}</p>
                  <p className="text-slate-400 text-sm">{entry.fuelAmount} gal</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center mb-1">
                    <Fuel className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-slate-300 text-sm">Mileage</span>
                  </div>
                  <p className="text-white">{entry.mileage.toLocaleString()} mi</p>
                </div>

                <div className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center mb-1">
                    <DollarSign className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-slate-300 text-sm">Price/Gal</span>
                  </div>
                  <p className="text-white">${(entry.fuelCost / entry.fuelAmount).toFixed(2)}</p>
                </div>
              </div>

              {/* Vehicle Info */}
              {(entry.stockNumber || entry.vin) && (
                <div className="bg-white/5 rounded-xl p-3 mb-4">
                  <h4 className="text-white text-sm font-medium mb-2">Vehicle Information</h4>
                  <div className="space-y-1">
                    {entry.stockNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Stock Number:</span>
                        <span className="text-white text-sm font-mono">{entry.stockNumber}</span>
                      </div>
                    )}
                    {entry.vin && (
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">VIN:</span>
                        <span className="text-white text-sm font-mono">{entry.vin}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location */}
              {entry.location && (
                <div className="bg-white/5 rounded-xl p-3 mb-4">
                  <div className="flex items-center mb-1">
                    <MapPin className="w-4 h-4 text-purple-400 mr-2" />
                    <span className="text-slate-300 text-sm">Location</span>
                  </div>
                  <p className="text-white text-sm font-mono">
                    {entry.location.address}
                  </p>
                </div>
              )}

              {/* Notes */}
              {entry.notes && (
                <div className="bg-white/5 rounded-xl p-3 mb-4">
                  <h4 className="text-white text-sm font-medium mb-1">Notes</h4>
                  <p className="text-slate-300 text-sm">{entry.notes}</p>
                </div>
              )}

              {/* Photos */}
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center text-green-400">
                  <Receipt className="w-3 h-3 mr-1" />
                  Receipt Photo
                </div>
                {entry.vinPhoto && (
                  <div className="flex items-center text-blue-400">
                    <Car className="w-3 h-3 mr-1" />
                    VIN Photo
                  </div>
                )}
                <div className="flex items-center text-slate-400 ml-auto">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(entry.submittedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <List className="w-8 h-8 text-slate-400" />
              </div>
              {searchTerm || filterBy !== 'all' ? (
                <>
                  <p className="text-slate-400 mb-2">No entries match your search</p>
                  <p className="text-slate-500 text-sm">
                    Try adjusting your search terms or filters
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-400 mb-2">No fuel entries yet</p>
                  <p className="text-slate-500 text-sm">
                    Start by adding your first fuel entry
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      {sortedEntries.length > 0 && (
        <div className="mt-6 bg-white/5 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-white text-lg font-medium">{sortedEntries.length}</p>
              <p className="text-slate-400 text-xs">Entries</p>
            </div>
            <div>
              <p className="text-white text-lg font-medium">
                {sortedEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0).toFixed(1)}
              </p>
              <p className="text-slate-400 text-xs">Gallons</p>
            </div>
            <div>
              <p className="text-white text-lg font-medium">
                ${(sortedEntries.reduce((sum, entry) => sum + entry.fuelCost, 0) / 
                   sortedEntries.reduce((sum, entry) => sum + entry.fuelAmount, 0) || 0).toFixed(2)}
              </p>
              <p className="text-slate-400 text-xs">Avg $/Gal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};