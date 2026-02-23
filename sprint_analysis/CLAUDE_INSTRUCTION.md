# Sprint Analysis Dashboard - POC Development Brief

## 🎯 Project Context

I'm a Principal Product Manager at Qubica managing a distributed team working on a POS integration project. I need a web application to analyze sprint data across 1,500+ work items organized in a 3-level hierarchy: **Epic → Feature → User Story/Tech Story/Bug/Task**.

The goal is to classify work items as **Strategic**, **KTLO**, or **Small Change** and analyze effort distribution across professional families (Backend, Frontend, Design, Analysis) over time.

## 📊 Data Structure

### Input File: Excel with 1,501 rows
**Hierarchy:**
- **Epic** (61 items) - No parent, high-level initiatives
- **Feature** (185 items) - Children of Epics, contain classification tags
- **User Story/Tech Story/Bug/Task** (1,255 items) - Children of Features, contain effort data

**Key Columns:**
```
- ID: Unique identifier (integer)
- Work Item Type: Epic | Feature | User Story | Tech Story | Bug | Task | Issue
- Title: Work item description
- State: New | Active | ToDo | Closed
- Parent: ID of parent work item (null for Epics)
- Tags: Classification info (strategic, Small Change, ktlo, CRM & Loyalty, etc.)
- Iteration Path: Format "Main" for Epic/Feature, "Main\2025-Q3\150" for sprint items
- Effort Analysis: Hours spent by Analysis team
- Effort BE: Hours spent by Backend team
- Effort Design: Hours spent by Design team
- Effort FE: Hours spent by Frontend team
- Effort Automation: Hours spent on automation
- Effort Native: Hours spent on native development
- Effort Platform Eng: Hours spent by Platform Engineering
```

### Classification Logic
**Features are classified based on Tags:**
- **Strategic**: Tags contain "strategic"
- **KTLO**: Tags contain "ktlo"
- **Small Change**: Tags contain "Small Change"
- **Other**: Has tags but none of the above (e.g., "CRM & Loyalty", "Packages")
- **Unclassified**: No tags or empty

**All child items (User Stories, Bugs, etc.) inherit classification from their parent Feature.**

### Sprint Extraction
From `Iteration Path` like "Main\2025-Q3\150":
- Year: 2025
- Quarter: Q3 (1-4)
- Sprint: 150

Items with "Main" have no sprint assignment (typically Epics and Features).

## 📈 Current Data Insights (to validate POC)

**Classification Distribution (1,501 items):**
- Unclassified: 643 (42.8%)
- Other: 524 (34.9%)
- KTLO: 186 (12.4%)
- Strategic: 142 (9.5%)
- Small Change: 6 (0.4%)

**Effort Distribution by Classification (2,196 total hours):**
- Unclassified: 953h (44.4%)
- Other: 771h (35.9%)
- KTLO: 270h (12.6%)
- Strategic: 202h (9.4%)
- Small Change: 0h (0%)

**Effort by Professional Family:**
- Backend (BE): 1,134h across 311 items
- Design: 467h across 140 items
- Analysis: 347h across 102 items
- Frontend (FE): 241h across 127 items

**Active Sprint Range:** Sprint 78 (2022-Q4) to Sprint 161 (2026-Q1)

## 🎨 POC Requirements

### Tech Stack
- **Frontend**: React with TypeScript
- **UI Library**: Shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **Data Processing**: Client-side (no backend needed for POC)
- **File Upload**: Excel file parsing with SheetJS (xlsx library)

### Core Features

#### 1. File Upload & Data Processing
- Upload Excel file (Sprint_analysis.xlsx format)
- Parse and validate data structure
- Build parent-child hierarchy tree
- Apply classification logic to all items
- Extract sprint/quarter/year from Iteration Path
- Calculate total effort per item and aggregates

#### 2. Executive Dashboard
Display key metrics with cards:
- Total work items by classification (pie chart)
- Total effort hours by classification (horizontal bar chart)
- Effort distribution by professional family (stacked bar)
- Top 10 Epics by total effort
- Classification coverage % (classified vs unclassified)

#### 3. Sprint Timeline View
- X-axis: Sprints (chronological, grouped by quarter)
- Y-axis: Effort hours
- Stacked area chart showing Strategic/KTLO/Small Change/Other over time
- Ability to filter by professional family
- Show trend line for Strategic work %

#### 4. Effort Breakdown Table
Sortable/filterable table showing:
- Sprint | Quarter | Strategic | KTLO | Small Change | Other | Unclassified | Total
- Row-level drill down to see work items in that sprint/classification
- Export to CSV capability

#### 5. Epic Explorer
- List of all Epics with expand/collapse
- Show Features under each Epic with classification tag
- Show rollup of effort by classification per Epic
- Click Feature to see all child work items

#### 6. Professional Family Analysis
- Tab for each family (BE, FE, Design, Analysis)
- Show effort distribution across classifications
- Top contributors (User Stories with most hours)
- Utilization over time (sprint by sprint)

#### 7. Unclassified Items Report
- List all Features without classification
- Show count of child items and total effort
- Provide quick action to flag for review
- Export list for manual classification

### UI/UX Guidelines
- Clean, modern interface with clear data hierarchy
- Responsive design (desktop primary, mobile friendly)
- Use Qubica brand colors if possible (or neutral professional palette)
- Loading states during file processing
- Error handling for invalid files
- Empty states with helpful messages

### Technical Considerations
- Handle 1,500+ rows efficiently (virtualization if needed)
- Memoize expensive calculations
- Persist uploaded data in localStorage (with clear option)
- Add sample data button for demo without file upload
- Include data export functionality (processed data to Excel)

## 🚀 POC Deliverables

1. **Functional React App** that can:
   - Upload and parse Excel file
   - Display all 7 core features listed above
   - Navigate between views smoothly
   - Export reports and processed data

2. **Sample Data** (embedded):
   - Include a subset of real data structure for demo
   - 10 Epics, 30 Features, 100 work items minimum

3. **Documentation**:
   - README with setup instructions
   - Data structure documentation
   - Known limitations and future enhancements

4. **Deployment Ready**:
   - Vercel/Netlify compatible
   - Environment setup guide
   - Build optimization for production

## 📝 Development Approach

**Phase 1: Foundation (Day 1)**
- Project setup (Vite + React + TypeScript)
- Install dependencies (shadcn, recharts, xlsx)
- Create data models and TypeScript interfaces
- Build Excel parser and hierarchy builder
- Test with actual data file

**Phase 2: Core Views (Day 2-3)**
- Executive Dashboard with key metrics
- Sprint Timeline visualization
- Epic Explorer tree view
- Basic navigation and routing

**Phase 3: Advanced Features (Day 4-5)**
- Professional Family analysis tabs
- Effort Breakdown table with filters
- Unclassified Items report
- Export functionality

**Phase 4: Polish (Day 6)**
- Responsive design refinement
- Loading states and error handling
- Sample data integration
- Performance optimization

## 🎯 Success Criteria

The POC is successful if:
1. ✅ Uploads real Excel file and processes all 1,501 rows without errors
2. ✅ Correctly builds Epic → Feature → Work Item hierarchy
3. ✅ Accurately applies classification logic (validate against known totals)
4. ✅ Displays effort distribution matching expected totals (2,196h total)
5. ✅ Sprint timeline clearly shows trend from Q1 2025 to Q1 2026
6. ✅ Can identify and list 65 unclassified Features
7. ✅ Professional family breakdown shows BE as highest (1,134h)
8. ✅ UI is intuitive and usable by non-technical product managers

## 📦 File Locations

After creating the app, please:
- Save working code to `/home/claude/sprint-dashboard/`
- Move final build to `/mnt/user-data/outputs/sprint-dashboard/` for user access
- Include the Excel file parser as a standalone utility if useful

## 🔍 Validation Data Points

Use these to verify your implementation:
- Total items: 1,501
- Epic count: 61
- Feature count: 185  
- User Story count: 720
- Total effort: 2,196 hours
- Unclassified items: 643 (42.8%)
- KTLO effort: 270h (12.6%)
- Strategic effort: 202h (9.4%)
- Backend effort: 1,134h (highest)
- Active sprints: ~46 unique sprints
- Latest sprint: 161 (2026-Q1)

## 💡 Future Enhancements (Out of Scope for POC)

- Multi-file comparison (sprint vs sprint)
- Forecast/projection models
- Team capacity planning
- Integration with Azure DevOps API
- Custom classification rules editor
- Automated reporting (weekly email)
- Collaboration features (comments, sharing)

---

## 🎬 Ready to Start?

1. Confirm you have access to the Excel file structure
2. Ask clarifying questions if anything is unclear
3. Set up the project and share your development plan
4. Build incrementally and show progress after each phase
5. Let's create something awesome! 🚀
