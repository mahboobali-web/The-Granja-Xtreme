import re

with open('frontend/src/pages/AdminUpcomingBookings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Modify loadBookings to filter out Retail
load_bookings_orig = """  const loadBookings = async () => {
    try {
      const data = await fetchAPI('/bookings');
      // Show only operational statuses
      setBookings(data.filter((b: any) => ['Pending', 'Reserved', 'Upcoming', 'Active', 'Completed'].includes(b.status)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };"""
  
load_bookings_new = """  const loadBookings = async () => {
    try {
      const data = await fetchAPI('/bookings');
      // Show only operational statuses, exclude Retail which has no scheduling
      setBookings(data.filter((b: any) => 
        ['Pending', 'Reserved', 'Upcoming', 'Active', 'Completed'].includes(b.status) && b.bookingType !== 'Retail'
      ));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };"""

content = content.replace(load_bookings_orig, load_bookings_new)

with open('frontend/src/pages/AdminUpcomingBookings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
