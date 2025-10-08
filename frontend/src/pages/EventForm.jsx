import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../contexts/ApiContext';
import { AuthContext } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import '../styles/EventForm.css';

const EventForm = () => {
  const { api } = useApi();
  const { user } = useContext(AuthContext);
  const { id: eventId } = useParams();
  const isEditMode = !!eventId;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    volunteerSlots: '',
    registrationFee: '',
    clubId: '',
    clubName: '',
    imageUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clubs, setClubs] = useState([]);
  const navigate = useNavigate();

  // Fetch event data if in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchEventData = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await api.getEvent(eventId);
        
        if (fetchError) throw new Error(fetchError);
        
        // Format the date and time from the event data
        const eventDate = parseISO(data.date);
        const formattedDate = format(eventDate, 'yyyy-MM-dd');
        const formattedTime = format(eventDate, 'HH:mm');
        
        setFormData({
          name: data.name || '',
          description: data.description || '',
          date: formattedDate,
          time: formattedTime,
          location: data.location || '',
          capacity: data.capacity || '',
          volunteerSlots: data.volunteerSlots || '',
          registrationFee: data.registrationFee || '0',
          clubId: data.club?._id || '',
          clubName: data.club?.name || '',
          imageUrl: data.imageUrl || ''
        });
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to load event data');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, isEditMode, api]);

  // Fetch user's clubs
  useEffect(() => {
    const fetchUserClubs = async () => {
      try {
        const { data, error: clubsError } = await api.getUserClubs();
        
        if (clubsError) throw new Error(clubsError);
        
        setClubs(data || []);
        
        // If there's only one club, pre-select it
        if (data?.length === 1 && !isEditMode) {
          setFormData(prev => ({
            ...prev,
            clubId: data[0]._id,
            clubName: data[0].name
          }));
        }
      } catch (err) {
        console.error('Error fetching clubs:', err);
        setError('Failed to load your clubs');
      }
    };

    fetchUserClubs();
  }, [isEditMode, api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If changing club ID, update club name as well
    if (name === 'clubId') {
      const selectedClub = clubs.find(club => club._id === value);
      setFormData(prev => ({
        ...prev,
        clubId: value,
        clubName: selectedClub?.name || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Event name is required');
      return false;
    }
    
    if (!formData.date) {
      setError('Event date is required');
      return false;
    }
    
    if (!formData.time) {
      setError('Event time is required');
      return false;
    }
    
    if (!formData.location.trim()) {
      setError('Event location is required');
      return false;
    }
    
    // Additional validations can be added here
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Combine date and time into a single ISO string
      const eventDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      const eventData = {
        name: formData.name,
        description: formData.description,
        date: eventDateTime,
        location: formData.location,
        capacity: parseInt(formData.capacity) || 0,
        volunteerSlots: parseInt(formData.volunteerSlots) || 0,
        registrationFee: parseFloat(formData.registrationFee) || 0,
        club: formData.clubId,
        imageUrl: formData.imageUrl
      };
      
      let response;
      
      if (isEditMode) {
        // Update existing event
        const { data, error: updateError } = await api.updateEvent(eventId, eventData);
        if (updateError) throw new Error(updateError);
        response = data;
      } else {
        // Create new event
        const { data, error: createError } = await api.createEvent(eventData);
        if (createError) throw new Error(createError);
        response = data;
      }
      
      // Redirect to event details or organizer dashboard
      navigate(isEditMode ? `/event/${eventId}` : '/organizers');
      
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.message || 'Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Event' : 'Create New Event'}
            </h1>
            <p className="text-gray-600">
              {isEditMode 
                ? 'Update your event details below.' 
                : 'Fill in the form below to create a new event.'}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Event Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter event name"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Provide a detailed description of your event"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter event location"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                      Maximum Participants
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      min="1"
                      value={formData.capacity}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="volunteerSlots" className="block text-sm font-medium text-gray-700">
                      Volunteer Slots
                    </label>
                    <input
                      type="number"
                      id="volunteerSlots"
                      name="volunteerSlots"
                      min="0"
                      value={formData.volunteerSlots}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Number of volunteers needed"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="registrationFee" className="block text-sm font-medium text-gray-700">
                      Registration Fee (₹)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        id="registrationFee"
                        name="registrationFee"
                        min="0"
                        step="0.01"
                        value={formData.registrationFee}
                        onChange={handleChange}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm" id="price-currency">
                          INR
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                      Event Image URL
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  {clubs.length > 0 && (
                    <div className="col-span-2">
                      <label htmlFor="clubId" className="block text-sm font-medium text-gray-700">
                        Organizing Club
                      </label>
                      <select
                        id="clubId"
                        name="clubId"
                        value={formData.clubId}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Select a club</option>
                        {clubs.map((club) => (
                          <option key={club._id} value={club._id}>
                            {club.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-5 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEditMode ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
