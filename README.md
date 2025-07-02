# Decoda Founding Engineer - Take Home Assignment

## Patient Profile Page Implementation

This project implements a patient profile page based on the provided sample patient data, designed to surface relevant patient information effectively and intuitively for healthcare professionals.

## 📋 Assignment Requirements Checklist

### Core Functionality

- [x] **Patient Information Display**

  - [x] Present important information about the patient in a clear and digestible manner
  - [x] Information hierarchy prioritizes what matters most to doctors/front desk staff
  - [x] Thoughtful consideration of what NOT to display to avoid information overload

- [x] **Quick Actions**

  - [x] Charge a payment method (functional button)
  - [x] Create a memo (functional button)
  - [x] Generate a doctor's note (functional button)
  - [x] Additional relevant quick actions implemented

- [x] **Additional Feature** (Choose one)
  - [x] AI/LLM tool (summary generator, doctor's note generator, etc.)

### Data Handling

- [x] **Various Data Scenarios**
  - [x] Handles patients with extensive records (many payments, notes, appointments)
  - [x] Handles brand-new patients with no data
  - [x] Handles partial data cases (e.g., 10 appointments but no doctor's notes)
  - [x] Stimulated APIs using next js server functions

### Technical Implementation

- [x] **Code Quality**

  - [x] Good code structure and organization
  - [x] Code is readable and well-commented
  - [x] Proper component structure
  - [x] Error handling implemented

- [x] **Deployment**
  - [x] Project deployed (Vercel, Netlify, etc.)
  - [x] Live URL: https://clinic-app-rose.vercel.app/

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🎯 Key Design Decisions

### User Considerations

- [x] **Target Users**: Doctors, Front desk staff, etc.
- [x] **Primary Use Cases**: Patient profile management, clinical documentation, payment processing
- [x] **Key Workflows**: View patient info, create memos, generate doctor's notes, manage charges and payments

### Additional Features Implemented

- [x] **Feature 1**: Generate Doctor's note using Openrouter free LLM
- [x] **Feature 2**: Comprehensive patient management system with tabbed interface
- [x] **Feature 3**: Advanced data grid with AG Grid for charges and appointments
- [x] **Feature 5**: Payment methods management
- [x] **Feature 6**: Full CRUD operations for memos, charges, and doctor's notes

## 📝 Notes & Future Improvements

### Out of Scope (Due to Time Constraints) and would Add with More Time

- [ ] Responsive UI for mobile screens
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Bulk operations
- [ ] Data export functionality

---

## Time Spent

**Estimated Time**: 7hrs

## Technology Stack

- [x] Next.js/React
- [x] TypeScript
- [x] Tailwind CSS
- [x] Shadcn UI Components
- [x] AG Grid (Data Tables)
- [x] React Query (Data Fetching)
- [x] OpenRouter AI API (LLM Integration)
