/**
 * Visual Floor Plan for Left Wing (L-101..110) & Right Wing (R-101..110)
 * Evaluates live availability computed dynamically from active IST bookings.
 */

import React, { useState } from 'react';
import { useApp, ComputedRoom } from '../../context/AppContext';
import { WingType } from '../../types';
import {
  Building,
  Tv,
  Check,
  Sparkles,
  Layers,
  Clock,
} from 'lucide-react';
import { formatTime12h } from '../../utils/istTime';

interface WingVisualPlanProps {
  onSelectRoomForBooking?: (roomNumber: string) => void;
  onSelectRoomForShift?: (roomNumber: string) => void;
  onSelectRoomForIssue?: (roomNumber: string) => void;
}

export const WingVisualPlan: React.FC<WingVisualPlanProps> = ({
  onSelectRoomForBooking,
  onSelectRoomForShift,
  onSelectRoomForIssue,
}) => {
  const { classrooms, currentUser } = useApp();
  const [selectedWing, setSelectedWing] = useState<'all' | WingType>('all');
  const [floorFilter, setFloorFilter] = useState<'all' | number>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Available' | 'Booked' | 'Maintenance'>('all');
  const [projectorOnly, setProjectorOnly] = useState<boolean>(false);

  const leftWingRooms = classrooms.filter((r) => r.wing === 'Left Wing');
  const rightWingRooms = classrooms.filter((r) => r.wing === 'Right Wing');

  const filterRoom = (r: ComputedRoom) => {
    if (selectedWing !== 'all' && r.wing !== selectedWing) return false;
    if (floorFilter !== 'all' && r.floor !== floorFilter) return false;
    if (statusFilter !== 'all' && r.liveStatus !== statusFilter) return false;
    if (projectorOnly && !r.hasProjector) return false;
    return true;
  };

  const getStatusBadge = (status: ComputedRoom['liveStatus']) => {
    switch (status) {
      case 'Available':
        return {
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          label: 'Available',
        };
      case 'Booked':
        return {
          bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
          dot: 'bg-rose-500',
          label: 'Booked',
        };
      case 'Maintenance':
        return {
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500',
          label: 'Maintenance',
        };
    }
  };

  const renderRoomCard = (room: ComputedRoom) => {
    const badge = getStatusBadge(room.liveStatus);

    return (
      <div
        key={room.id}
        className={`relative p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
          room.liveStatus === 'Available'
            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xs'
            : room.liveStatus === 'Booked'
            ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/60'
            : 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-1 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  {room.roomNumber}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Fl {room.floor}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                {room.wing}
              </span>
            </div>

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badge.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
              {badge.label}
            </span>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2 my-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Capacity</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {room.capacity} seats
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Projector</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                {room.hasProjector ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Yes
                  </span>
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </span>
            </div>
          </div>

          {/* Active Booking Banner */}
          {room.activeBooking && (
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-800 dark:text-rose-200 mb-2">
              <div className="font-semibold truncate">
                {room.activeBooking.bookedByName} ({room.activeBooking.section})
              </div>
              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  {room.activeBooking.startTime} - {room.activeBooking.endTime} IST
                </span>
              </div>
            </div>
          )}

          {/* Next Booking Banner */}
          {!room.activeBooking && room.nextBooking && (
            <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 mb-2 truncate">
              Next: <strong>{formatTime12h(room.nextBooking.startTime)}</strong> ({room.nextBooking.section})
            </div>
          )}

          {/* Facilities pills */}
          <div className="flex flex-wrap gap-1 mb-3">
            {room.facilities.slice(0, 2).map((fac, i) => (
              <span
                key={i}
                className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded"
              >
                {fac}
              </span>
            ))}
            {room.facilities.length > 2 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{room.facilities.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Card bottom actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          {currentUser && currentUser.role !== 'student' && onSelectRoomForBooking ? (
            <button
              onClick={() => onSelectRoomForBooking(room.roomNumber)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Book Room</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">
              {room.liveStatus === 'Available' ? 'Slot free' : 'Occupied'}
            </span>
          )}

          <div className="flex items-center gap-2">
            {onSelectRoomForShift && (
              <button
                onClick={() => onSelectRoomForShift(room.roomNumber)}
                className="text-amber-600 hover:underline text-[11px] cursor-pointer"
                title="Request shift to/from this room"
              >
                Shift
              </button>
            )}
            {onSelectRoomForIssue && (
              <button
                onClick={() => onSelectRoomForIssue(room.roomNumber)}
                className="text-slate-400 hover:text-rose-500 text-[11px] cursor-pointer"
                title="Report issue in this room"
              >
                Report
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Visual Header & Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>CSE Department Wing-Wise Floor Plan</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              20 Classrooms
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time occupancy status computed dynamically from active IST booking periods.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Wing segmented */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-xs font-semibold">
            <button
              onClick={() => setSelectedWing('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedWing === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Wings
            </button>
            <button
              onClick={() => setSelectedWing('Left Wing')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedWing === 'Left Wing'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Left Wing (10)
            </button>
            <button
              onClick={() => setSelectedWing('Right Wing')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedWing === 'Right Wing'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Right Wing (10)
            </button>
          </div>

          {/* Floor */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Floors</option>
            <option value={1}>Floor 1</option>
            <option value={2}>Floor 2</option>
            <option value={3}>Floor 3</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Available' | 'Booked' | 'Maintenance')}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          {/* Projector toggle */}
          <button
            onClick={() => setProjectorOnly(!projectorOnly)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition-colors ${
              projectorOnly
                ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-600 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Projector</span>
          </button>
        </div>
      </div>

      {/* Wings Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Wing (L-101 to L-110) */}
        {(selectedWing === 'all' || selectedWing === 'Left Wing') && (
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Left Wing · L-101 to L-110
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {leftWingRooms.filter((r) => r.liveStatus === 'Available').length} / {leftWingRooms.length} Free
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {leftWingRooms.filter(filterRoom).map(renderRoomCard)}
            </div>
          </div>
        )}

        {/* Right Wing (R-101 to R-110) */}
        {(selectedWing === 'all' || selectedWing === 'Right Wing') && (
          <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Right Wing · R-101 to R-110
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {rightWingRooms.filter((r) => r.liveStatus === 'Available').length} / {rightWingRooms.length} Free
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rightWingRooms.filter(filterRoom).map(renderRoomCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
