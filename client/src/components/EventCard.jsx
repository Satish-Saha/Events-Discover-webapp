import React from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt } from 'react-icons/fa';

const EventCard = ({ event, onGetTickets }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-slate-100 dark:border-slate-700">
            <div className="relative h-48 overflow-hidden">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-slate-400">No Image</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {event.organizer}
                </div>
            </div>

            <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white line-clamp-2" title={event.title}>
                    {event.title}
                </h3>

                <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-start">
                        <FaCalendarAlt className="mt-1 mr-2 text-blue-500 shrink-0" />
                        <span>{event.date || 'Date TBA'}</span>
                    </div>
                    <div className="flex items-start">
                        <FaMapMarkerAlt className="mt-1 mr-2 text-red-500 shrink-0" />
                        <span className="line-clamp-1">{event.location || 'Location TBA'}</span>
                    </div>
                </div>

                {event.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 flex-grow">
                        {event.description}
                    </p>
                )}

                <div className="mt-auto pt-4">
                    <button
                        onClick={() => onGetTickets(event)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors group"
                    >
                        <FaTicketAlt className="mr-2 group-hover:rotate-12 transition-transform" />
                        GET TICKETS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;