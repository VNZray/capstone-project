# Service Display & Inquiry System

## Overview

Services are now **display-only** listings with contact information. Instead of complex booking workflows, tourists can express interest and contact merchants directly through their preferred channels (Facebook, Phone, Email, etc.).

## Key Changes from Service Booking

### ❌ Removed (Service Booking System)
- Complex booking table with status workflows
- Payment processing for services
- Booking confirmation/cancellation flows
- Check-in/attendance tracking
- Service scheduling management
- `service_booking` table
- `serviceBookingController.js`
- `serviceBookingProcedures.js`
- `/api/service-bookings` routes

### ✅ Added (Service Display & Inquiry System)
- Contact information fields in `service` table
- Simple `service_inquiry` table for lead tracking
- Analytics for merchants on inquiry performance
- `/api/service-inquiries` endpoints

---

## Database Schema

### Service Table (Updated)

**New Contact Fields:**
```javascript
contact_phone           // Phone number
contact_email           // Email address
contact_facebook        // Facebook page URL
contact_viber           // Viber number
contact_whatsapp        // WhatsApp number
external_booking_url    // Link to merchant's own booking system
contact_notes           // Additional instructions (e.g., "Call 9 AM - 5 PM")
```

### Service Inquiry Table (New)

Tracks when tourists express interest in services:

```javascript
id                      // UUID primary key
service_id              // Which service
business_id             // Which business
user_id                 // Logged-in tourist (nullable)
guest_id                // Guest tourist (nullable)
inquiry_number          // Unique reference (e.g., "INQ-1728123456-ABC123")
message                 // Optional message from tourist
number_of_people        // How many people
preferred_date          // When they want the service
contact_method          // Which method they clicked (phone/facebook/etc)
status                  // new, contacted, converted, archived
merchant_viewed         // Has merchant seen it?
merchant_viewed_at      // When merchant viewed
merchant_notes          // Merchant's private notes
created_at
updated_at
```

---

## API Endpoints

### Service Inquiry Management

#### Create Inquiry
```http
POST /api/service-inquiries
```
**Body:**
```json
{
  "service_id": "uuid",
  "business_id": "uuid",
  "user_id": "uuid",          // OR guest_id (one required)
  "guest_id": "uuid",
  "message": "I'm interested in a volcano tour for 3 people",
  "number_of_people": 3,
  "preferred_date": "2025-10-15",
  "contact_method": "facebook"  // phone, email, facebook, viber, whatsapp
}
```

**Response:**
```json
{
  "message": "Service inquiry created successfully",
  "inquiry_number": "INQ-1728123456-ABC123",
  "inquiry_id": "uuid"
}
```

#### Get Business Inquiries
```http
GET /api/service-inquiries/business/:businessId
```

Returns all inquiries for a merchant with tourist details.

#### Get Inquiry Stats
```http
GET /api/service-inquiries/business/:businessId/stats
```

**Response:**
```json
{
  "total_inquiries": 45,
  "new_inquiries": 12,
  "contacted_inquiries": 20,
  "converted_inquiries": 10,
  "unviewed_inquiries": 8,
  "today_inquiries": 3,
  "this_week_inquiries": 15,
  "this_month_inquiries": 45
}
```

#### Get Popular Services
```http
GET /api/service-inquiries/business/:businessId/popular
```

Returns services ranked by inquiry count with conversion rates.

#### Update Inquiry Status
```http
PUT /api/service-inquiries/:id/status
```
**Body:**
```json
{
  "status": "contacted"  // new, contacted, converted, archived
}
```

#### Mark as Viewed
```http
PUT /api/service-inquiries/:id/viewed
```

Automatically marks inquiry as viewed by merchant.

#### Update Merchant Notes
```http
PUT /api/service-inquiries/:id/notes
```
**Body:**
```json
{
  "notes": "Called customer, scheduled for Oct 15 at 8 AM"
}
```

#### Get User's Inquiries
```http
GET /api/service-inquiries/user?userId=uuid
GET /api/service-inquiries/user?guestId=uuid
```

---

## Frontend Implementation Guide

### Service Display Page

**Show contact options as buttons:**

```jsx
// Example service display component
<ServiceCard service={service}>
  <h3>{service.name}</h3>
  <p>{service.description}</p>
  <p>Price: ₱{service.base_price} / {service.price_type}</p>
  
  <div className="contact-buttons">
    {service.contact_phone && (
      <ContactButton 
        icon="phone" 
        label="Call"
        onClick={() => handleContact('phone', service.contact_phone)}
      />
    )}
    
    {service.contact_facebook && (
      <ContactButton 
        icon="facebook" 
        label="Message on Facebook"
        onClick={() => handleContact('facebook', service.contact_facebook)}
      />
    )}
    
    {service.contact_email && (
      <ContactButton 
        icon="email" 
        label="Send Email"
        onClick={() => handleContact('email', service.contact_email)}
      />
    )}
    
    {service.external_booking_url && (
      <ContactButton 
        icon="link" 
        label="Book on Their Site"
        onClick={() => handleContact('external_booking', service.external_booking_url)}
      />
    )}
  </div>
  
  <Button onClick={() => setShowInquiryModal(true)}>
    I'm Interested
  </Button>
</ServiceCard>
```

### Inquiry Modal

When user clicks "I'm Interested":

```jsx
<InquiryModal service={service}>
  <form onSubmit={handleSubmitInquiry}>
    <Input 
      label="Number of People" 
      type="number" 
      name="number_of_people" 
      defaultValue={1}
    />
    
    <DateInput 
      label="Preferred Date" 
      name="preferred_date"
    />
    
    <Textarea 
      label="Message (Optional)" 
      name="message"
      placeholder="Any special requests or questions..."
    />
    
    <Select 
      label="How would you like to be contacted?" 
      name="contact_method"
    >
      <option value="phone">Phone</option>
      <option value="facebook">Facebook</option>
      <option value="email">Email</option>
    </Select>
    
    <Button type="submit">Submit Inquiry</Button>
  </form>
</InquiryModal>
```

### Handle Contact Click

Track which contact method user clicked:

```javascript
async function handleContact(method, contactInfo) {
  // Log inquiry with contact method
  await fetch('/api/service-inquiries', {
    method: 'POST',
    body: JSON.stringify({
      service_id: service.id,
      business_id: service.business_id,
      user_id: currentUser.id,
      contact_method: method
    })
  });
  
  // Open appropriate contact method
  switch(method) {
    case 'phone':
      window.open(`tel:${contactInfo}`);
      break;
    case 'facebook':
      window.open(contactInfo, '_blank');
      break;
    case 'email':
      window.open(`mailto:${contactInfo}`);
      break;
    case 'external_booking':
      window.open(contactInfo, '_blank');
      break;
  }
}
```

---

## Merchant Dashboard

### Inquiry List View

Show merchants all their service inquiries:

```jsx
<InquiryList>
  {inquiries.map(inquiry => (
    <InquiryCard key={inquiry.id}>
      <Badge status={inquiry.status} />
      {!inquiry.merchant_viewed && <Badge>NEW</Badge>}
      
      <h4>{inquiry.service_name}</h4>
      <p>From: {inquiry.inquirer_name}</p>
      <p>Phone: {inquiry.inquirer_phone}</p>
      <p>Email: {inquiry.inquirer_email}</p>
      <p>People: {inquiry.number_of_people}</p>
      <p>Preferred Date: {inquiry.preferred_date}</p>
      
      {inquiry.message && <p>Message: {inquiry.message}</p>}
      
      <p>Contact Method Used: {inquiry.contact_method}</p>
      
      <Button onClick={() => updateStatus(inquiry.id, 'contacted')}>
        Mark as Contacted
      </Button>
      
      <Button onClick={() => updateStatus(inquiry.id, 'converted')}>
        Mark as Converted
      </Button>
      
      <Textarea 
        placeholder="Add notes..."
        onBlur={(e) => updateNotes(inquiry.id, e.target.value)}
      />
    </InquiryCard>
  ))}
</InquiryList>
```

### Analytics Dashboard

```jsx
<InquiryStats businessId={businessId}>
  <StatCard>
    <h3>{stats.total_inquiries}</h3>
    <p>Total Inquiries</p>
  </StatCard>
  
  <StatCard>
    <h3>{stats.new_inquiries}</h3>
    <p>New Inquiries</p>
  </StatCard>
  
  <StatCard>
    <h3>{stats.converted_inquiries}</h3>
    <p>Conversions</p>
  </StatCard>
  
  <StatCard>
    <h3>{stats.this_month_inquiries}</h3>
    <p>This Month</p>
  </StatCard>
</InquiryStats>

<PopularServices businessId={businessId}>
  <h3>Most Inquired Services</h3>
  {popularServices.map(service => (
    <ServiceRow key={service.id}>
      <span>{service.name}</span>
      <span>{service.inquiry_count} inquiries</span>
      <span>{service.conversion_rate}% conversion</span>
    </ServiceRow>
  ))}
</PopularServices>
```

---

## Benefits of This Approach

### ✅ For Development
- **Much simpler** - No complex booking workflows
- **Faster to implement** - Display + contact info
- **Less maintenance** - No booking state management
- **Fewer edge cases** - No cancellations, refunds, etc.

### ✅ For Merchants
- **Uses their existing tools** - Facebook Messenger, WhatsApp, Phone
- **More control** - They manage their own schedule
- **Lower learning curve** - Don't need to learn new system
- **Can still track leads** - See who's interested

### ✅ For Tourists
- **Direct communication** - Talk to merchant directly
- **Familiar channels** - Use Facebook, phone, etc.
- **More flexible** - Can negotiate, ask questions
- **No commitment pressure** - Just expressing interest

### ✅ For Business Model
- **Still monetizable:**
  - Featured service listings
  - Premium service profiles
  - Lead generation fees
  - Analytics dashboards
  - Verified badges

---

## Migration Path

If you want to add full booking later:

1. The `service` table already has all display data
2. The `service_inquiry` table tracks interest
3. You can add a `service_booking` table later
4. Link bookings to inquiries with `inquiry_id` field
5. Gradually migrate merchants who want booking features

The inquiry system serves as **market validation** - see which services get interest before building complex booking.

---

## Testing Checklist

- [ ] Tourist can view service details
- [ ] Tourist can click contact buttons
- [ ] Tourist can submit "I'm Interested" inquiry
- [ ] Inquiry creates record in database
- [ ] Merchant receives notification (if notification system enabled)
- [ ] Merchant can view all inquiries
- [ ] Merchant can mark as contacted/converted
- [ ] Merchant can add private notes
- [ ] Stats dashboard shows accurate counts
- [ ] Popular services ranked correctly
- [ ] Both logged-in users and guests can inquire

---

## Future Enhancements (Optional)

1. **Email notifications** when new inquiry arrives
2. **SMS alerts** for high-priority inquiries
3. **Auto-response templates** for merchants
4. **Inquiry expiration** after X days
5. **Tourist follow-up reminders** if no response
6. **Review prompt** after conversion
7. **QR code** for quick service inquiry at physical location
8. **WhatsApp integration** for direct messaging

---

## Support

For questions or issues with the service inquiry system, contact the development team or refer to the API documentation at `/api/service-inquiries`.
