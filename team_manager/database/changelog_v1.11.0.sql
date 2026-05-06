-- v1.11.0 - Full English Translation
INSERT INTO changelog (version, type, title, description, release_date)
VALUES (
  '1.11.0',
  'minor',
  'Complete English UI Translation',
  '## 🌍 Internationalization - Full English Translation

### Summary

Complete translation of all user interface strings from Italian to English across the entire application (44 files).

### Scope

**Pages Translated (7):**
- TeamView - Team management
- SprintView - Sprint planning
- TimelineView - Weekly allocations
- FeaturesView - Feature management
- TimeOffView - Time off tracking
- GanttView - Gantt visualization
- ChangelogView - Version history

**Components Translated (18+):**
- Team: RoleForm, RoleList, MemberForm, MemberList
- Sprint: SprintForm, SprintList
- Feature: FeatureForm, FeatureList
- Changelog: ChangelogEntry, ChangelogForm
- Timeline: All timeline components (FeatureGroup, NRTRow, KTLORow, GlobalTimeOffRow, CapacityRecapRow, etc.)
- UI: ColorPicker, ConfirmDialog, EmptyState, TimelineFilters, SettingsModal

### Translation Dictionary

**Navigation:**
- Ferie → Time Off
- Ferie & Assenze → Time Off & Absences
- Riepilogo Capacità → Capacity Summary
- Impostazioni Colori → Color Settings

**Actions:**
- Espandi tutto → Expand all
- Collassa tutto → Collapse all
- Nuova Feature → New Feature
- Modifica → Edit
- Elimina → Delete
- Salva → Save
- Annulla → Cancel
- Conferma → Confirm
- Aggiungi → Add
- Seleziona tutto → Select all
- Deseleziona tutto → Deselect all

**Units:**
- Giorno/Giorni/gg → Day/Days/d
- Settimana/Settimane/Sett → Week/Weeks/Wk
- Capacità settimanale → Weekly capacity
- Giorni lavorativi → Working days

**Entities:**
- Membro/Membri → Member/Members
- Ruolo/Ruoli → Role/Roles
- Allocazione/Allocazioni → Allocation/Allocations

**Messages:**
- Nessuno sprint creato → No sprints created
- Nessun membro nel team → No team members
- Nessuna feature creata → No features created
- Sei sicuro di voler eliminare → Are you sure you want to delete
- Questa azione non può essere annullata → This action cannot be undone

### Examples

**Before (Italian):**
```tsx
<h2>Gestione ruoli e membri del team</h2>
<button>Nuova Feature</button>
<p>Nessuno sprint creato. Vai alla sezione Sprint!</p>
<label>Capacità settimanale (giorni lavorativi)</label>
```

**After (English):**
```tsx
<h2>Manage roles and team members</h2>
<button>New Feature</button>
<p>No sprints created. Go to the Sprints section to get started!</p>
<label>Weekly capacity (working days)</label>
```

### Translation Consistency

Applied consistent terminology throughout:
- **Strategic** for "Strategica"
- **Small Change** kept as-is (product term)
- **Capacity** for "Capacità"
- **Allocation** for "Allocazione"
- **Time Off** for "Ferie" (professional standard)

### Technical Notes

**What was translated:**
- ✅ All user-facing strings
- ✅ Button labels
- ✅ Page titles and descriptions
- ✅ Form labels and placeholders
- ✅ Empty state messages
- ✅ Confirmation dialogs
- ✅ Tooltips and titles
- ✅ Error messages

**What was NOT modified:**
- ❌ Variable/function names
- ❌ Code comments
- ❌ CSS class names
- ❌ Import/export statements
- ❌ Technical constants

### Files Modified

Total: **44 files** across:
- `src/pages/` - All view pages
- `src/components/` - All UI components
- `src/components/team/` - Team management
- `src/components/sprints/` - Sprint management
- `src/components/features/` - Feature management
- `src/components/timeline/` - Timeline components
- `src/components/gantt/` - Gantt components
- `src/components/changelog/` - Changelog components
- `src/components/settings/` - Settings
- `src/components/ui/` - Reusable UI components

### Benefits

- 🌍 **International accessibility**: English as primary language
- 📊 **Professional standard**: Industry-standard terminology
- 🔄 **Consistency**: Unified translation across all components
- 📝 **Maintainability**: Clear, professional UI text
- 🌐 **Broader reach**: Accessible to international users

### Versioning

**v1.11.0** (MINOR) perché:
- ✅ Cambiamento significativo interfaccia
- ✅ Migliora accessibilità internazionale
- ✅ Retrocompatibile (nessun breaking change)
- ✅ Funzionalità invariate',
  '2026-05-06'
);

SELECT version, title FROM changelog WHERE version = '1.11.0';
