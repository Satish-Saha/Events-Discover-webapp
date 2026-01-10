import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import EventCard from './components/EventCard';
import EmailModal from './components/EmailModal';
import ChatBot from './components/FloatingChatButton'
import { fetchEvents } from './services/api';
import { FaSpinner } from 'react-icons/fa';

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('events');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetTickets = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-white cursor-default">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-grow container mx-auto px-4 py-8">
        {currentPage === 'about' ? (
          <section className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">About Sydney Events</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Sydney Events is a simple way to see what&apos;s happening in and around the city right now.
              We bring together events like meetups, concerts, nights out, and more into one easy place
              so you don&apos;t have to jump between different websites.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              The Events page is the main view of the site. It shows a live feed of upcoming events with
              key details such as the name, date and time, where it&apos;s happening, and a direct link to
              the original event page where you can read more or grab tickets.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              New events are checked for regularly in the background, so when you open this site you&apos;re
              always looking at fresh listings rather than an outdated calendar.
            </p>
          </section>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
                Discover Sydney's Best Events
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Explore the latest concerts, theatre, exhibitions, and more currently valid in Sydney.
                Updated hourly from sources like Eventbrite and Meetup.
              </p>
            </div>

            {error && (
              <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg mb-8">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
              </div>
            ) : (
              <>
                {events.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-2xl text-slate-400">No events found at the moment.</p>
                    <p className="text-slate-500 mt-2">Please check back later or try triggering a refresh.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {events.map((event) => (
                      <EventCard
                        key={event.originalUrl}
                        event={event}
                        onGetTickets={handleGetTickets}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <Footer />

      <EmailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
      <ChatBot />
    </div>
  );
}

export default App;