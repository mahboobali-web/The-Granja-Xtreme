import re

with open('frontend/src/pages/AdminBookings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Modify loadDashboardData to filter out Retail from bookings
load_data_orig = """    const loadDashboardData = async () => {
      try {
        const [bData, aData, sData] = await Promise.all([
          fetchAPI('/bookings'),
          fetchAPI('/atvs'),
          fetchAPI('/employees').catch(() => []) // Fallback if no permission
        ]);
        setBookings(bData);"""

load_data_new = """    const loadDashboardData = async () => {
      try {
        const [bData, aData, sData] = await Promise.all([
          fetchAPI('/bookings'),
          fetchAPI('/atvs'),
          fetchAPI('/employees').catch(() => []) // Fallback if no permission
        ]);
        // Exclude retail bookings from calendar
        setBookings(bData.filter((b: any) => b.bookingType !== 'Retail'));"""
        
content = content.replace(load_data_orig, load_data_new)

with open('frontend/src/pages/AdminBookings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
