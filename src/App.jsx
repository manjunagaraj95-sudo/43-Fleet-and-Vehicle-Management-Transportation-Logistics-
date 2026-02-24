
import React, { useState, useEffect } from 'react';

// Centralized ROLES and PERMISSIONS configuration
const ROLES = {
  ADMIN: 'Admin',
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  MAINTENANCE_TEAM: 'Maintenance Team',
  OPERATIONS_TEAM: 'Operations Team',
};

const PERMISSIONS = {
  CAN_VIEW_ALL_VEHICLES: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.OPERATIONS_TEAM, ROLES.MAINTENANCE_TEAM],
  CAN_EDIT_VEHICLES: [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  CAN_ADD_VEHICLES: [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  CAN_VIEW_ALL_DRIVERS: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.OPERATIONS_TEAM],
  CAN_EDIT_DRIVERS: [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  CAN_ADD_DRIVERS: [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  CAN_VIEW_ALL_MAINTENANCE: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.MAINTENANCE_TEAM],
  CAN_EDIT_MAINTENANCE: [ROLES.ADMIN, ROLES.MAINTENANCE_TEAM],
  CAN_ADD_MAINTENANCE: [ROLES.ADMIN, ROLES.MAINTENANCE_TEAM],
  CAN_VIEW_AUDIT_LOGS: [ROLES.ADMIN],
  CAN_VIEW_DASHBOARD: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.OPERATIONS_TEAM],
  CAN_ACCESS_SETTINGS: [ROLES.ADMIN],
};

// Standardized status keys and UI labels mapping
const STATUS_MAPPING = {
  VEHICLE: {
    ACTIVE: { label: 'Active', colorClass: 'status-card--ACTIVE' },
    IN_MAINTENANCE: { label: 'In Maintenance', colorClass: 'status-card--IN_MAINTENANCE' },
    RETIRED: { label: 'Retired', colorClass: 'status-card--RETIRED' },
    PENDING_APPROVAL: { label: 'Pending Approval', colorClass: 'status-card--PENDING' },
  },
  DRIVER: {
    ACTIVE: { label: 'Active', colorClass: 'status-card--ACTIVE' },
    ON_LEAVE: { label: 'On Leave', colorClass: 'status-card--ON_LEAVE' },
    TERMINATED: { label: 'Terminated', colorClass: 'status-card--TERMINATED' },
  },
  MAINTENANCE: {
    SCHEDULED: { label: 'Scheduled', colorClass: 'status-card--SCHEDULED' },
    IN_PROGRESS: { label: 'In Progress', colorClass: 'status-card--IN_PROGRESS' },
    COMPLETED: { label: 'Completed', colorClass: 'status-card--COMPLETED' },
    CANCELLED: { label: 'Cancelled', colorClass: 'status-card--CANCELLED' },
    OVERDUE: { label: 'Overdue (Breached)', colorClass: 'status-card--BREACHED' },
    UPCOMING: { label: 'Upcoming', colorClass: 'status-card--UPCOMING' },
  },
  SLA: {
    MET: { label: 'Met', colorClass: 'status-card--COMPLETED' },
    BREACHED: { label: 'Breached', colorClass: 'status-card--BREACHED' },
  },
};

// Dummy Data
const DUMMY_DATA = {
  VEHICLES: [
    { id: 'veh001', make: 'Ford', model: 'Transit', year: 2020, vin: '1FAHAPCA6LGXXXXXXXX', licensePlate: 'ABC-123', status: 'ACTIVE', fuelLevel: 85, mileage: 75230, currentDriverId: 'drv001', lastMaintenanceId: 'maint001', nextMaintenanceDate: '2024-08-15', purchaseDate: '2020-03-10', cost: 35000, assignedTo: 'John Doe', documentId: 'doc_veh001' },
    { id: 'veh002', make: 'Mercedes-Benz', model: 'Sprinter', year: 2021, vin: 'WDA9061611KXXXXXXXX', licensePlate: 'DEF-456', status: 'IN_MAINTENANCE', fuelLevel: 30, mileage: 52100, currentDriverId: null, lastMaintenanceId: 'maint002', nextMaintenanceDate: '2024-07-20', purchaseDate: '2021-06-20', cost: 45000, assignedTo: null, documentId: 'doc_veh002' },
    { id: 'veh003', make: 'Chevrolet', model: 'Express', year: 2019, vin: '1GCHJRC07KFXXXXXXXX', licensePlate: 'GHI-789', status: 'ACTIVE', fuelLevel: 60, mileage: 98765, currentDriverId: 'drv002', lastMaintenanceId: 'maint003', nextMaintenanceDate: '2024-09-01', purchaseDate: '2019-09-05', cost: 32000, assignedTo: 'Jane Smith', documentId: 'doc_veh003' },
    { id: 'veh004', make: 'Ram', model: 'ProMaster', year: 2022, vin: '2C3FCCF78NHXXXXXXXX', licensePlate: 'JKL-012', status: 'ACTIVE', fuelLevel: 95, mileage: 30500, currentDriverId: 'drv003', lastMaintenanceId: null, nextMaintenanceDate: '2024-10-10', purchaseDate: '2022-01-20', cost: 40000, assignedTo: 'Mike Johnson', documentId: 'doc_veh004' },
    { id: 'veh005', make: 'Nissan', model: 'NV200', year: 2018, vin: 'JN3E1CAW0JTXXXXXXXX', licensePlate: 'MNO-345', status: 'RETIRED', fuelLevel: 10, mileage: 150000, currentDriverId: null, lastMaintenanceId: 'maint004', nextMaintenanceDate: '2024-06-30', purchaseDate: '2018-05-01', cost: 25000, assignedTo: null, documentId: 'doc_veh005' },
    { id: 'veh006', make: 'Ford', model: 'F-150', year: 2023, vin: '1FTFW1E68RFXXXXXXXX', licensePlate: 'PQR-678', status: 'ACTIVE', fuelLevel: 70, mileage: 12000, currentDriverId: 'drv001', lastMaintenanceId: null, nextMaintenanceDate: '2024-11-01', purchaseDate: '2023-02-14', cost: 55000, assignedTo: 'John Doe', documentId: 'doc_veh006' },
    { id: 'veh007', make: 'Tesla', model: 'Semi', year: 2024, vin: '5YJSA1E67RFXXXXXXXX', licensePlate: 'STU-901', status: 'PENDING_APPROVAL', fuelLevel: 100, mileage: 500, currentDriverId: null, lastMaintenanceId: null, nextMaintenanceDate: '2025-01-01', purchaseDate: '2024-01-05', cost: 180000, assignedTo: null, documentId: 'doc_veh007' },
  ],
  DRIVERS: [
    { id: 'drv001', name: 'John Doe', licenseNumber: 'D1234567', status: 'ACTIVE', assignedVehicleId: 'veh001', contact: 'john.doe@example.com', phone: '555-1111', licenseExpiry: '2026-01-01', employmentDate: '2019-01-15' },
    { id: 'drv002', name: 'Jane Smith', licenseNumber: 'D8765432', status: 'ACTIVE', assignedVehicleId: 'veh003', contact: 'jane.smith@example.com', phone: '555-2222', licenseExpiry: '2025-06-30', employmentDate: '2020-03-01' },
    { id: 'drv003', name: 'Mike Johnson', licenseNumber: 'D1122334', status: 'ACTIVE', assignedVehicleId: 'veh004', contact: 'mike.j@example.com', phone: '555-3333', licenseExpiry: '2027-03-15', employmentDate: '2021-07-20' },
    { id: 'drv004', name: 'Sarah Lee', licenseNumber: 'D4455667', status: 'ON_LEAVE', assignedVehicleId: null, contact: 'sarah.l@example.com', phone: '555-4444', licenseExpiry: '2024-12-01', employmentDate: '2022-01-10' },
    { id: 'drv005', name: 'Chris Green', licenseNumber: 'D7788990', status: 'TERMINATED', assignedVehicleId: null, contact: 'chris.g@example.com', phone: '555-5555', licenseExpiry: '2023-05-10', employmentDate: '2018-08-01' },
    { id: 'drv006', name: 'Emily White', licenseNumber: 'D0011223', status: 'ACTIVE', assignedVehicleId: null, contact: 'emily.w@example.com', phone: '555-6666', licenseExpiry: '2026-09-20', employmentDate: '2023-11-01' },
  ],
  MAINTENANCE: [
    { id: 'maint001', vehicleId: 'veh001', type: 'Oil Change', status: 'COMPLETED', scheduleDate: '2024-03-01', completionDate: '2024-03-01', cost: 120, performedBy: 'Quick Lube', notes: 'Standard oil and filter change.', slaStatus: 'MET' },
    { id: 'maint002', vehicleId: 'veh002', type: 'Tire Rotation', status: 'IN_PROGRESS', scheduleDate: '2024-06-25', completionDate: null, cost: 80, performedBy: 'Fleet Repair Co.', notes: 'Waiting for parts.', slaStatus: 'MET' },
    { id: 'maint003', vehicleId: 'veh003', type: 'Brake Inspection', status: 'SCHEDULED', scheduleDate: '2024-09-01', completionDate: null, cost: 150, performedBy: 'Auto Services Inc.', notes: 'Scheduled for Q3.', slaStatus: 'MET' },
    { id: 'maint004', vehicleId: 'veh005', type: 'Engine Check', status: 'COMPLETED', scheduleDate: '2023-11-10', completionDate: '2023-11-12', cost: 450, performedBy: 'Main Garage', notes: 'Fixed minor oil leak.', slaStatus: 'MET' },
    { id: 'maint005', vehicleId: 'veh001', type: 'Transmission Service', status: 'OVERDUE', scheduleDate: '2024-05-01', completionDate: null, cost: 600, performedBy: 'Specialty Auto', notes: 'Overdue service, pending approval.', slaStatus: 'BREACHED' },
    { id: 'maint006', vehicleId: 'veh004', type: 'Annual Inspection', status: 'UPCOMING', scheduleDate: '2024-10-10', completionDate: null, cost: 200, performedBy: 'Certified Auto', notes: 'Mandatory annual safety check.', slaStatus: 'UPCOMING' },
  ],
  AUDIT_LOGS: [
    { id: 'aud001', entity: 'Vehicle', recordId: 'veh001', action: 'Update Status', user: 'Admin', timestamp: '2024-06-20T10:30:00Z', details: 'Status changed from IN_MAINTENANCE to ACTIVE' },
    { id: 'aud002', entity: 'Driver', recordId: 'drv002', action: 'Assign Vehicle', user: 'Fleet Manager', timestamp: '2024-06-19T14:15:00Z', details: 'Assigned veh003 to Jane Smith' },
    { id: 'aud003', entity: 'Maintenance', recordId: 'maint002', action: 'Update Status', user: 'Maintenance Team', timestamp: '2024-06-18T09:00:00Z', details: 'Status changed from SCHEDULED to IN_PROGRESS' },
    { id: 'aud004', entity: 'Vehicle', recordId: 'veh002', action: 'Create Record', user: 'Admin', timestamp: '2021-06-15T11:00:00Z', details: 'New vehicle record created' },
    { id: 'aud005', entity: 'Driver', recordId: 'drv001', action: 'Update Contact Info', user: 'Admin', timestamp: '2024-06-10T16:45:00Z', details: 'Phone number updated' },
  ],
  DOCUMENTS: {
    'doc_veh001': 'Vehicle_Registration_veh001.pdf',
    'doc_veh002': 'Maintenance_History_veh002.pdf',
    'doc_veh003': 'Insurance_Policy_veh003.pdf',
    'doc_veh004': 'Warranty_Details_veh004.pdf',
    'doc_veh005': 'Retirement_Approval_veh005.pdf',
    'doc_veh006': 'Vehicle_Manual_veh006.pdf',
    'doc_veh007': 'Purchase_Order_veh007.pdf',
  }
};


function App() {
  const [view, setView] = useState({ screen: 'LOGIN', params: {} });
  const [currentUserRole, setCurrentUserRole] = useState(null); // e.g., 'Admin', 'Fleet Manager'
  const [loggedIn, setLoggedIn] = useState(false);

  // Helper function to navigate
  const navigate = (screen, params = {}) => {
    setView({ screen, params });
  };

  // Check if current user has a specific permission
  const hasPermission = (permission) => {
    return loggedIn && PERMISSIONS[permission]?.includes(currentUserRole);
  };

  // Form submission handler (generic)
  const handleSubmit = (entityType, formData) => {
    console.log(`Submitting ${entityType} form:`, formData);
    // In a real app, this would send data to an API
    // For this demo, we'll just simulate success and navigate back
    alert(`${entityType} saved successfully!`);
    if (entityType === 'Vehicle') navigate('VEHICLES_LIST');
    if (entityType === 'Driver') navigate('DRIVERS_LIST');
    if (entityType === 'Maintenance') navigate('MAINTENANCE_LIST');
  };

  const handleDelete = (entityType, id) => {
    if (window.confirm(`Are you sure you want to delete this ${entityType} record?`)) {
      console.log(`Deleting ${entityType} with ID:`, id);
      alert(`${entityType} deleted successfully!`);
      // In a real app, filter out the deleted item from DUMMY_DATA
      if (entityType === 'Vehicle') navigate('VEHICLES_LIST');
      if (entityType === 'Driver') navigate('DRIVERS_LIST');
      if (entityType === 'Maintenance') navigate('MAINTENANCE_LIST');
    }
  };

  const handleLogin = (role) => {
    setCurrentUserRole(role);
    setLoggedIn(true);
    navigate('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUserRole(null);
    setLoggedIn(false);
    navigate('LOGIN');
  };

  // Helper for Breadcrumbs
  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Home', screen: 'DASHBOARD' }];
    switch (view.screen) {
      case 'DASHBOARD':
        crumbs.push({ label: 'Dashboard', screen: 'DASHBOARD' });
        break;
      case 'VEHICLES_LIST':
        crumbs.push({ label: 'Vehicles', screen: 'VEHICLES_LIST' });
        break;
      case 'VEHICLE_DETAIL':
      case 'VEHICLE_EDIT':
      case 'VEHICLE_ADD': {
        crumbs.push({ label: 'Vehicles', screen: 'VEHICLES_LIST' });
        const vehicle = DUMMY_DATA.VEHICLES.find(v => v.id === view.params?.vehicleId);
        if (view.screen === 'VEHICLE_ADD') {
          crumbs.push({ label: 'Add New Vehicle', screen: 'VEHICLE_ADD' });
        } else if (vehicle) {
          crumbs.push({ label: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`, screen: 'VEHICLE_DETAIL', params: { vehicleId: vehicle.id } });
          if (view.screen === 'VEHICLE_EDIT') crumbs.push({ label: 'Edit', screen: 'VEHICLE_EDIT', params: { vehicleId: vehicle.id } });
        }
        break;
      }
      case 'DRIVERS_LIST':
        crumbs.push({ label: 'Drivers', screen: 'DRIVERS_LIST' });
        break;
      case 'DRIVER_DETAIL':
      case 'DRIVER_EDIT':
      case 'DRIVER_ADD': {
        crumbs.push({ label: 'Drivers', screen: 'DRIVERS_LIST' });
        const driver = DUMMY_DATA.DRIVERS.find(d => d.id === view.params?.driverId);
        if (view.screen === 'DRIVER_ADD') {
          crumbs.push({ label: 'Add New Driver', screen: 'DRIVER_ADD' });
        } else if (driver) {
          crumbs.push({ label: driver.name, screen: 'DRIVER_DETAIL', params: { driverId: driver.id } });
          if (view.screen === 'DRIVER_EDIT') crumbs.push({ label: 'Edit', screen: 'DRIVER_EDIT', params: { driverId: driver.id } });
        }
        break;
      }
      case 'MAINTENANCE_LIST':
        crumbs.push({ label: 'Maintenance', screen: 'MAINTENANCE_LIST' });
        break;
      case 'MAINTENANCE_DETAIL':
      case 'MAINTENANCE_EDIT':
      case 'MAINTENANCE_ADD': {
        crumbs.push({ label: 'Maintenance', screen: 'MAINTENANCE_LIST' });
        const maintenance = DUMMY_DATA.MAINTENANCE.find(m => m.id === view.params?.maintenanceId);
        if (view.screen === 'MAINTENANCE_ADD') {
          crumbs.push({ label: 'Add New Maintenance', screen: 'MAINTENANCE_ADD' });
        } else if (maintenance) {
          crumbs.push({ label: `${maintenance.type} for ${maintenance.vehicleId}`, screen: 'MAINTENANCE_DETAIL', params: { maintenanceId: maintenance.id } });
          if (view.screen === 'MAINTENANCE_EDIT') crumbs.push({ label: 'Edit', screen: 'MAINTENANCE_EDIT', params: { maintenanceId: maintenance.id } });
        }
        break;
      }
      case 'AUDIT_LOGS':
        crumbs.push({ label: 'Audit Logs', screen: 'AUDIT_LOGS' });
        break;
      case 'SETTINGS':
        crumbs.push({ label: 'Settings', screen: 'SETTINGS' });
        break;
      default:
        break;
    }
    return crumbs;
  };

  // Render Breadcrumbs component
  const Breadcrumbs = () => (
    <div className="breadcrumbs">
      {getBreadcrumbs()?.map((crumb, index, arr) => (
        <React.Fragment key={crumb.label}>
          {index < arr.length - 1 ? (
            <>
              <a onClick={() => navigate(crumb.screen, crumb.params)}>{crumb.label}</a>
              <span> / </span>
            </>
          ) : (
            <span className="current-page">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // AuthWrapper for RBAC based UI variations/visibility
  const AuthWrapper = ({ permission, children }) => {
    if (!permission || hasPermission(permission)) {
      return <>{children}</>;
    }
    return null; // Or render an unauthorized message
  };

  // Generic List View Toolbar
  const ListViewToolbar = ({ entityName, showAddButton, onAddClick }) => (
    <div className="toolbar">
      <input type="text" placeholder={`Search ${entityName}...`} className="form-group__input toolbar__search-input" />
      <select className="toolbar__dropdown">
        <option>All Statuses</option>
        <option>Active</option>
        <option>Pending</option>
        <option>Completed</option>
      </select>
      <select className="toolbar__dropdown">
        <option>Sort by Date (Newest)</option>
        <option>Sort by Name (A-Z)</option>
      </select>
      <select className="toolbar__dropdown">
        <option>Saved View: Default</option>
        <option>Saved View: My Active Items</option>
      </select>
      <div className="toolbar__action-group">
        <button className="button button--secondary">Filter</button>
        <button className="button button--secondary">Export</button>
        <button className="button button--secondary">Bulk Actions</button>
        {showAddButton && (
          <button className="button" onClick={onAddClick}>+ Add New {entityName}</button>
        )}
      </div>
    </div>
  );

  // Document Preview Placeholder
  const DocumentPreview = ({ documentId, entityType }) => {
    const docName = DUMMY_DATA.DOCUMENTS?.[documentId];
    if (!docName) return <p>No document found for this record.</p>;

    const viewDocument = () => {
      // In a real app, this would open a modal with the PDF/image viewer
      alert(`Simulating document preview for: ${docName} (entity: ${entityType}, ID: ${documentId})`);
      window.open(`https://example.com/documents/${docName}`, '_blank'); // Placeholder URL
    };

    return (
      <div>
        <h3>Documents</h3>
        <p><strong>Attachment:</strong> <a onClick={viewDocument} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{docName}</a></p>
      </div>
    );
  };


  // Main Application Render
  if (!loggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Fleet and Vehicle Management</h2>
          <p>Select your role to log in:</p>
          <div className="button-group" style={{ justifyContent: 'center' }}>
            {Object.values(ROLES).map(role => (
              <button key={role} className="button" onClick={() => handleLogin(role)}>
                Log in as {role}
              </button>
            ))}
          </div>
          <p style={{ marginTop: 'var(--spacing-lg)' }}>* Role-based access and UI variations will be applied.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <span className="header__logo">FleetMan</span>
        <nav className="header__nav">
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_DASHBOARD}>
            <a onClick={() => navigate('DASHBOARD')} className={view.screen === 'DASHBOARD' ? 'nav-item nav-item--active' : 'nav-item'}>Dashboard</a>
          </AuthWrapper>
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_ALL_VEHICLES}>
            <a onClick={() => navigate('VEHICLES_LIST')} className={view.screen.startsWith('VEHICLE') ? 'nav-item nav-item--active' : 'nav-item'}>Vehicles</a>
          </AuthWrapper>
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_ALL_DRIVERS}>
            <a onClick={() => navigate('DRIVERS_LIST')} className={view.screen.startsWith('DRIVER') ? 'nav-item nav-item--active' : 'nav-item'}>Drivers</a>
          </AuthWrapper>
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_ALL_MAINTENANCE}>
            <a onClick={() => navigate('MAINTENANCE_LIST')} className={view.screen.startsWith('MAINTENANCE') ? 'nav-item nav-item--active' : 'nav-item'}>Maintenance</a>
          </AuthWrapper>
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_AUDIT_LOGS}>
            <a onClick={() => navigate('AUDIT_LOGS')} className={view.screen === 'AUDIT_LOGS' ? 'nav-item nav-item--active' : 'nav-item'}>Audit Logs</a>
          </AuthWrapper>
          <AuthWrapper permission={PERMISSIONS.CAN_ACCESS_SETTINGS}>
            <a onClick={() => navigate('SETTINGS')} className={view.screen === 'SETTINGS' ? 'nav-item nav-item--active' : 'nav-item'}>Settings</a>
          </AuthWrapper>
        </nav>
        <div className="header__user-menu">
          <span>Logged in as <strong>{currentUserRole}</strong></span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <Breadcrumbs />

        {/* Dashboard Screen */}
        {view.screen === 'DASHBOARD' && (
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_DASHBOARD}>
            <h1>Dashboard</h1>
            <div className="toolbar">
              <input type="text" placeholder="Global Search..." className="form-group__input toolbar__search-input" />
              <button className="button button--secondary">Apply Filters</button>
              <select className="toolbar__dropdown">
                <option>Saved Filters: All Time</option>
                <option>Saved Filters: Last 30 Days</option>
              </select>
              <button className="button">Export Dashboard</button>
            </div>

            <h2>Key Performance Indicators</h2>
            <div className="kpi-grid margin-bottom-lg">
              <div className="kpi-card kpi-card--realtime">
                <div className="kpi-card__title">Total Vehicles</div>
                <div className="kpi-card__value">{DUMMY_DATA.VEHICLES?.length}</div>
                <div className="kpi-card__subtext">Live Update</div>
              </div>
              <div className="kpi-card kpi-card--realtime">
                <div className="kpi-card__title">Available Vehicles</div>
                <div className="kpi-card__value">{DUMMY_DATA.VEHICLES?.filter(v => v.status === 'ACTIVE').length}</div>
                <div className="kpi-card__subtext">Live Update</div>
              </div>
              <div className="kpi-card kpi-card--realtime">
                <div className="kpi-card__title">Maintenance Due Soon</div>
                <div className="kpi-card__value">{DUMMY_DATA.MAINTENANCE?.filter(m => m.status === 'SCHEDULED' || m.status === 'UPCOMING' || m.status === 'OVERDUE').length}</div>
                <div className="kpi-card__subtext">Live Update</div>
              </div>
              <div className="kpi-card kpi-card--realtime">
                <div className="kpi-card__title">Drivers On Duty</div>
                <div className="kpi-card__value">{DUMMY_DATA.DRIVERS?.filter(d => d.status === 'ACTIVE').length}</div>
                <div className="kpi-card__subtext">Live Update</div>
              </div>
            </div>

            <h2>Operational Performance</h2>
            <div className="chart-grid margin-bottom-lg">
              <div className="chart-container">Bar Chart: Vehicle Status</div>
              <div className="chart-container">Line Chart: Fuel Usage Trend</div>
              <div className="chart-container">Donut Chart: Maintenance Types</div>
              <div className="chart-container">Gauge Chart: Fleet Utilization</div>
            </div>

            <h2>Recent Activities</h2>
            <div className="card-grid">
              {DUMMY_DATA.AUDIT_LOGS?.slice(0, 5).map(activity => (
                <div key={activity.id} className="card" onClick={() => navigate('AUDIT_LOGS')}>
                  <div className="card-header">
                    <span className="card-title">{activity.action} - {activity.entity} {activity.recordId}</span>
                    <span className="card-status status-card--ACTIVE">Recent</span> {/* Generic color for recent activity */}
                  </div>
                  <div className="card-body">
                    <p>{activity.details}</p>
                    <small>By {activity.user} on {new Date(activity.timestamp).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </AuthWrapper>
        )}

        {/* Vehicles List Screen */}
        {view.screen === 'VEHICLES_LIST' && (
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_ALL_VEHICLES}>
            <h1>Vehicles</h1>
            <ListViewToolbar
              entityName="Vehicle"
              showAddButton={hasPermission(PERMISSIONS.CAN_ADD_VEHICLES)}
              onAddClick={() => navigate('VEHICLE_ADD')}
            />
            <div className="card-grid">
              {DUMMY_DATA.VEHICLES?.map(vehicle => (
                <div key={vehicle.id} className="card" onClick={() => navigate('VEHICLE_DETAIL', { vehicleId: vehicle.id })}>
                  <div className="card-header">
                    <span className="card-title">{vehicle.make} {vehicle.model} ({vehicle.year})</span>
                    <span className={`card-status ${STATUS_MAPPING.VEHICLE?.[vehicle.status]?.colorClass || 'status-card--inactive'}`}>
                      {STATUS_MAPPING.VEHICLE?.[vehicle.status]?.label || vehicle.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p>License: {vehicle.licensePlate}</p>
                    <p>Mileage: {vehicle.mileage?.toLocaleString()} km</p>
                    <p>Current Driver: {DUMMY_DATA.DRIVERS?.find(d => d.id === vehicle.currentDriverId)?.name || 'N/A'}</p>
                  </div>
                  <div className="card-footer">
                    <span>VIN: {vehicle.vin?.slice(-6)}</span>
                    <button className="button--icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AuthWrapper>
        )}

        {/* Vehicle Detail Screen */}
        {view.screen === 'VEHICLE_DETAIL' && (
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_ALL_VEHICLES}>
            <div className="detail-container">
              <div className="detail-header">
                {(() => {
                  const vehicle = DUMMY_DATA.VEHICLES?.find(v => v.id === view.params?.vehicleId);
                  return (
                    vehicle ? (
                      <>
                        <h1>{vehicle.make} {vehicle.model} ({vehicle.licensePlate})</h1>
                        <div className="detail-header-actions">
                          <AuthWrapper permission={PERMISSIONS.CAN_EDIT_VEHICLES}>
                            <button className="button" onClick={() => navigate('VEHICLE_EDIT', { vehicleId: vehicle.id })}>Edit Vehicle</button>
                          </AuthWrapper>
                          <AuthWrapper permission={PERMISSIONS.CAN_EDIT_VEHICLES}>
                            <button className="button button--danger" onClick={() => handleDelete('Vehicle', vehicle.id)}>Delete</button>
                          </AuthWrapper>
                        </div>
                      </>
                    ) : (
                      <h1>Vehicle Not Found</h1>
                    )
                  );
                })()}
              </div>
              {(() => {
                const vehicle = DUMMY_DATA.VEHICLES?.find(v => v.id === view.params?.vehicleId);
                const currentDriver = DUMMY_DATA.DRIVERS?.find(d => d.id === vehicle?.currentDriverId);
                const lastMaintenance = DUMMY_DATA.MAINTENANCE?.find(m => m.id === vehicle?.lastMaintenanceId);

                if (!vehicle) return <p>Vehicle data not available.</p>;

                return (
                  <>
                    <div className="detail-section">
                      <h3>Vehicle Information</h3>
                      <div className="detail-item"><span className="detail-item-label">Status:</span><span className={`detail-item-value detail-item-status ${STATUS_MAPPING.VEHICLE?.[vehicle.status]?.colorClass || 'status-card--inactive'}`}>{STATUS_MAPPING.VEHICLE?.[vehicle.status]?.label || vehicle.status}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Make:</span><span className="detail-item-value">{vehicle.make}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Model:</span><span className="detail-item-value">{vehicle.model}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Year:</span><span className="detail-item-value">{vehicle.year}</span></div>
                      <div className="detail-item"><span className="detail-item-label">VIN:</span><span className="detail-item-value">{vehicle.vin}</span></div>
                      <div className="detail-item"><span className="detail-item-label">License Plate:</span><span className="detail-item-value">{vehicle.licensePlate}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Mileage:</span><span className="detail-item-value">{vehicle.mileage?.toLocaleString()} km</span></div>
                      <div className="detail-item"><span className="detail-item-label">Fuel Level:</span><span className="detail-item-value">{vehicle.fuelLevel}%</span></div>
                      <div className="detail-item"><span className="detail-item-label">Purchase Date:</span><span className="detail-item-value">{vehicle.purchaseDate}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Cost:</span><span className="detail-item-value">${vehicle.cost?.toLocaleString()}</span></div>
                    </div>

                    <div className="detail-section">
                      <h3>Driver Assignment</h3>
                      {currentDriver ? (
                        <>
                          <div className="detail-item"><span className="detail-item-label">Assigned Driver:</span><span className="detail-item-value"><a onClick={() => navigate('DRIVER_DETAIL', { driverId: currentDriver.id })}>{currentDriver.name}</a></span></div>
                          <div className="detail-item"><span className="detail-item-label">Contact:</span><span className="detail-item-value">{currentDriver.contact}</span></div>
                        </>
                      ) : (
                        <p>No driver currently assigned.</p>
                      )}
                    </div>

                    <div className="detail-section">
                      <h3>Maintenance History</h3>
                      {lastMaintenance ? (
                        <>
                          <div className="detail-item"><span className="detail-item-label">Last Maintenance:</span><span className="detail-item-value"><a onClick={() => navigate('MAINTENANCE_DETAIL', { maintenanceId: lastMaintenance.id })}>{lastMaintenance.type} on {lastMaintenance.completionDate || lastMaintenance.scheduleDate}</a></span></div>
                          <div className="detail-item"><span className="detail-item-label">Next Service Due:</span><span className="detail-item-value">{vehicle.nextMaintenanceDate}</span></div>
                        </>
                      ) : (
                        <p>No recent maintenance records.</p>
                      )}
                      <h4>All Maintenance for this Vehicle</h4>
                      <div className="related-records-list">
                        {DUMMY_DATA.MAINTENANCE?.filter(m => m.vehicleId === vehicle.id).map(maint => (
                          <div key={maint.id} className="related-record-item" onClick={() => navigate('MAINTENANCE_DETAIL', { maintenanceId: maint.id })}>
                            <span>{maint.type} - {maint.scheduleDate}</span>
                            <span className={`card-status ${STATUS_MAPPING.MAINTENANCE?.[maint.status]?.colorClass || 'status-card--inactive'}`}>{STATUS_MAPPING.MAINTENANCE?.[maint.status]?.label || maint.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="detail-section">
                      <DocumentPreview documentId={vehicle.documentId} entityType="Vehicle" />
                    </div>

                    <AuthWrapper permission={PERMISSIONS.CAN_VIEW_AUDIT_LOGS}>
                      <div className="detail-section">
                        <h3>Audit Logs</h3>
                        <div className="audit-logs-list">
                          {DUMMY_DATA.AUDIT_LOGS?.filter(log => log.entity === 'Vehicle' && log.recordId === vehicle.id).map(log => (
                            <div key={log.id} className="audit-log-item">
                              <span>{log.action}</span>
                              <span>By: {log.user}</span>
                              <span>Date: {new Date(log.timestamp).toLocaleString()}</span>
                              <span>Details: {log.details}</span>
                            </div>
                          ))}
                          {DUMMY_DATA.AUDIT_LOGS?.filter(log => log.entity === 'Vehicle' && log.recordId === vehicle.id).length === 0 && (
                            <p>No audit logs for this vehicle.</p>
                          )}
                        </div>
                      </div>
                    </AuthWrapper>
                  </>
                );
              })()}
            </div>
          </AuthWrapper>
        )}

        {/* Vehicle Add/Edit Form */}
        {(view.screen === 'VEHICLE_ADD' || view.screen === 'VEHICLE_EDIT') && (
          <AuthWrapper permission={view.screen === 'VEHICLE_ADD' ? PERMISSIONS.CAN_ADD_VEHICLES : PERMISSIONS.CAN_EDIT_VEHICLES}>
            {(() => {
              const isEdit = view.screen === 'VEHICLE_EDIT';
              const initialVehicle = isEdit ? DUMMY_DATA.VEHICLES?.find(v => v.id === view.params?.vehicleId) : {};
              const [formData, setFormData] = useState(initialVehicle || {
                make: '', model: '', year: '', vin: '', licensePlate: '', status: 'ACTIVE', fuelLevel: 100, mileage: 0, purchaseDate: '', cost: 0,
              });

              useEffect(() => {
                if (isEdit && !initialVehicle) {
                  // Handle case where vehicle is not found for editing
                  alert('Vehicle not found for editing.');
                  navigate('VEHICLES_LIST');
                }
              }, [isEdit, initialVehicle, navigate]);

              const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData(prev => ({ ...prev, [name]: value }));
              };

              const handleFileChange = (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log('File selected:', file.name);
                  // In a real app, upload the file and store its ID/URL
                  setFormData(prev => ({ ...prev, documentId: `temp_doc_${Date.now()}` })); // Placeholder
                }
              };

              const handleFormSubmit = (e) => {
                e.preventDefault();
                // Simple validation
                if (!formData.make || !formData.model || !formData.year || !formData.licensePlate) {
                  alert('Please fill in all mandatory fields.');
                  return;
                }
                handleSubmit('Vehicle', formData);
              };

              // Autopopulate example: if model changes, suggest a common make/year
              const handleModelChange = (e) => {
                const { value } = e.target;
                let suggestedMake = formData.make;
                let suggestedYear = formData.year;
                if (value.toLowerCase().includes('transit') && !formData.make) suggestedMake = 'Ford';
                if (value.toLowerCase().includes('sprinter') && !formData.make) suggestedMake = 'Mercedes-Benz';
                if (!formData.year && suggestedMake) suggestedYear = new Date().getFullYear().toString(); // Default to current year
                setFormData(prev => ({ ...prev, model: value, make: suggestedMake, year: suggestedYear }));
              };

              return (
                <div className="detail-container">
                  <h1>{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
                  <form onSubmit={handleFormSubmit}>
                    <div className="form-group">
                      <label htmlFor="make">Make <span className="form-required-star">*</span></label>
                      <input type="text" id="make" name="make" value={formData.make || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="model">Model <span className="form-required-star">*</span></label>
                      <input type="text" id="model" name="model" value={formData.model || ''} onChange={handleModelChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="year">Year <span className="form-required-star">*</span></label>
                      <input type="number" id="year" name="year" value={formData.year || ''} onChange={handleChange} required min="1900" max={new Date().getFullYear() + 1} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="vin">VIN</label>
                      <input type="text" id="vin" name="vin" value={formData.vin || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="licensePlate">License Plate <span className="form-required-star">*</span></label>
                      <input type="text" id="licensePlate" name="licensePlate" value={formData.licensePlate || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select id="status" name="status" value={formData.status || 'ACTIVE'} onChange={handleChange}>
                        {Object.keys(STATUS_MAPPING.VEHICLE)?.map(statusKey => (
                          <option key={statusKey} value={statusKey}>{STATUS_MAPPING.VEHICLE[statusKey].label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="mileage">Mileage (km)</label>
                      <input type="number" id="mileage" name="mileage" value={formData.mileage || 0} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="fuelLevel">Fuel Level (%)</label>
                      <input type="number" id="fuelLevel" name="fuelLevel" value={formData.fuelLevel || 0} onChange={handleChange} min="0" max="100" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="purchaseDate">Purchase Date</label>
                      <input type="date" id="purchaseDate" name="purchaseDate" value={formData.purchaseDate || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cost">Cost ($)</label>
                      <input type="number" id="cost" name="cost" value={formData.cost || 0} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="document">Upload Document</label>
                      <input type="file" id="document" name="document" onChange={handleFileChange} />
                      {formData.documentId && <small style={{ display: 'block', marginTop: 'var(--spacing-xs)' }}>Existing Document: {DUMMY_DATA.DOCUMENTS?.[formData.documentId]}</small>}
                    </div>
                    <div className="form-actions">
                      <button type="button" className="button button--secondary" onClick={() => navigate('VEHICLES_LIST')}>Cancel</button>
                      <button type="submit" className="button">{isEdit ? 'Save Changes' : 'Add Vehicle'}</button>
                    </div>
                  </form>
                </div>
              );
            })()}
          </AuthWrapper>
        )}

        {/* Drivers List Screen */}
        {view.screen === 'DRIVERS_LIST' && (
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_ALL_DRIVERS}>
            <h1>Drivers</h1>
            <ListViewToolbar
              entityName="Driver"
              showAddButton={hasPermission(PERMISSIONS.CAN_ADD_DRIVERS)}
              onAddClick={() => navigate('DRIVER_ADD')}
            />
            <div className="card-grid">
              {DUMMY_DATA.DRIVERS?.map(driver => (
                <div key={driver.id} className="card" onClick={() => navigate('DRIVER_DETAIL', { driverId: driver.id })}>
                  <div className="card-header">
                    <span className="card-title">{driver.name}</span>
                    <span className={`card-status ${STATUS_MAPPING.DRIVER?.[driver.status]?.colorClass || 'status-card--inactive'}`}>
                      {STATUS_MAPPING.DRIVER?.[driver.status]?.label || driver.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p>License: {driver.licenseNumber}</p>
                    <p>Vehicle: {DUMMY_DATA.VEHICLES?.find(v => v.id === driver.assignedVehicleId)?.licensePlate || 'N/A'}</p>
                    <p>Expiry: {driver.licenseExpiry}</p>
                  </div>
                  <div className="card-footer">
                    <span>Contact: {driver.phone}</span>
                    <button className="button--icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AuthWrapper>
        )}

        {/* Driver Detail Screen */}
        {view.screen === 'DRIVER_DETAIL' && (
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_ALL_DRIVERS}>
            <div className="detail-container">
              <div className="detail-header">
                {(() => {
                  const driver = DUMMY_DATA.DRIVERS?.find(d => d.id === view.params?.driverId);
                  return (
                    driver ? (
                      <>
                        <h1>{driver.name}</h1>
                        <div className="detail-header-actions">
                          <AuthWrapper permission={PERMISSIONS.CAN_EDIT_DRIVERS}>
                            <button className="button" onClick={() => navigate('DRIVER_EDIT', { driverId: driver.id })}>Edit Driver</button>
                          </AuthWrapper>
                          <AuthWrapper permission={PERMISSIONS.CAN_EDIT_DRIVERS}>
                            <button className="button button--danger" onClick={() => handleDelete('Driver', driver.id)}>Delete</button>
                          </AuthWrapper>
                        </div>
                      </>
                    ) : (
                      <h1>Driver Not Found</h1>
                    )
                  );
                })()}
              </div>
              {(() => {
                const driver = DUMMY_DATA.DRIVERS?.find(d => d.id === view.params?.driverId);
                const assignedVehicle = DUMMY_DATA.VEHICLES?.find(v => v.id === driver?.assignedVehicleId);

                if (!driver) return <p>Driver data not available.</p>;

                return (
                  <>
                    <div className="detail-section">
                      <h3>Driver Information</h3>
                      <div className="detail-item"><span className="detail-item-label">Status:</span><span className={`detail-item-value detail-item-status ${STATUS_MAPPING.DRIVER?.[driver.status]?.colorClass || 'status-card--inactive'}`}>{STATUS_MAPPING.DRIVER?.[driver.status]?.label || driver.status}</span></div>
                      <div className="detail-item"><span className="detail-item-label">License No:</span><span className="detail-item-value">{driver.licenseNumber}</span></div>
                      <div className="detail-item"><span className="detail-item-label">License Expiry:</span><span className="detail-item-value">{driver.licenseExpiry}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Contact Email:</span><span className="detail-item-value">{driver.contact}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Phone:</span><span className="detail-item-value">{driver.phone}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Employment Date:</span><span className="detail-item-value">{driver.employmentDate}</span></div>
                    </div>

                    <div className="detail-section">
                      <h3>Assigned Vehicle</h3>
                      {assignedVehicle ? (
                        <>
                          <div className="detail-item"><span className="detail-item-label">Vehicle:</span><span className="detail-item-value"><a onClick={() => navigate('VEHICLE_DETAIL', { vehicleId: assignedVehicle.id })}>{assignedVehicle.make} {assignedVehicle.model} ({assignedVehicle.licensePlate})</a></span></div>
                          <div className="detail-item"><span className="detail-item-label">Status:</span><span className="detail-item-value">{STATUS_MAPPING.VEHICLE?.[assignedVehicle.status]?.label || assignedVehicle.status}</span></div>
                        </>
                      ) : (
                        <p>No vehicle currently assigned.</p>
                      )}
                    </div>

                    <AuthWrapper permission={PERMISSIONS.CAN_VIEW_AUDIT_LOGS}>
                      <div className="detail-section">
                        <h3>Audit Logs</h3>
                        <div className="audit-logs-list">
                          {DUMMY_DATA.AUDIT_LOGS?.filter(log => log.entity === 'Driver' && log.recordId === driver.id).map(log => (
                            <div key={log.id} className="audit-log-item">
                              <span>{log.action}</span>
                              <span>By: {log.user}</span>
                              <span>Date: {new Date(log.timestamp).toLocaleString()}</span>
                              <span>Details: {log.details}</span>
                            </div>
                          ))}
                           {DUMMY_DATA.AUDIT_LOGS?.filter(log => log.entity === 'Driver' && log.recordId === driver.id).length === 0 && (
                            <p>No audit logs for this driver.</p>
                          )}
                        </div>
                      </div>
                    </AuthWrapper>
                  </>
                );
              })()}
            </div>
          </AuthWrapper>
        )}

        {/* Driver Add/Edit Form */}
        {(view.screen === 'DRIVER_ADD' || view.screen === 'DRIVER_EDIT') && (
          <AuthWrapper permission={view.screen === 'DRIVER_ADD' ? PERMISSIONS.CAN_ADD_DRIVERS : PERMISSIONS.CAN_EDIT_DRIVERS}>
            {(() => {
              const isEdit = view.screen === 'DRIVER_EDIT';
              const initialDriver = isEdit ? DUMMY_DATA.DRIVERS?.find(d => d.id === view.params?.driverId) : {};
              const [formData, setFormData] = useState(initialDriver || {
                name: '', licenseNumber: '', status: 'ACTIVE', contact: '', phone: '', licenseExpiry: '', employmentDate: '', assignedVehicleId: null
              });

              useEffect(() => {
                if (isEdit && !initialDriver) {
                  alert('Driver not found for editing.');
                  navigate('DRIVERS_LIST');
                }
              }, [isEdit, initialDriver, navigate]);

              const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData(prev => ({ ...prev, [name]: value }));
              };

              const handleFormSubmit = (e) => {
                e.preventDefault();
                if (!formData.name || !formData.licenseNumber || !formData.licenseExpiry || !formData.contact) {
                  alert('Please fill in all mandatory fields.');
                  return;
                }
                handleSubmit('Driver', formData);
              };

              return (
                <div className="detail-container">
                  <h1>{isEdit ? 'Edit Driver' : 'Add New Driver'}</h1>
                  <form onSubmit={handleFormSubmit}>
                    <div className="form-group">
                      <label htmlFor="name">Name <span className="form-required-star">*</span></label>
                      <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="licenseNumber">License Number <span className="form-required-star">*</span></label>
                      <input type="text" id="licenseNumber" name="licenseNumber" value={formData.licenseNumber || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="licenseExpiry">License Expiry Date <span className="form-required-star">*</span></label>
                      <input type="date" id="licenseExpiry" name="licenseExpiry" value={formData.licenseExpiry || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select id="status" name="status" value={formData.status || 'ACTIVE'} onChange={handleChange}>
                        {Object.keys(STATUS_MAPPING.DRIVER)?.map(statusKey => (
                          <option key={statusKey} value={statusKey}>{STATUS_MAPPING.DRIVER[statusKey].label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="contact">Contact Email <span className="form-required-star">*</span></label>
                      <input type="email" id="contact" name="contact" value={formData.contact || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input type="text" id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="employmentDate">Employment Date</label>
                      <input type="date" id="employmentDate" name="employmentDate" value={formData.employmentDate || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="assignedVehicleId">Assign Vehicle</label>
                      <select id="assignedVehicleId" name="assignedVehicleId" value={formData.assignedVehicleId || ''} onChange={handleChange}>
                        <option value="">-- No Vehicle --</option>
                        {DUMMY_DATA.VEHICLES?.filter(v => v.status === 'ACTIVE' && (!v.currentDriverId || v.currentDriverId === formData.id))
                          .map(vehicle => (
                            <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} ({vehicle.licensePlate})</option>
                          ))}
                      </select>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="button button--secondary" onClick={() => navigate('DRIVERS_LIST')}>Cancel</button>
                      <button type="submit" className="button">{isEdit ? 'Save Changes' : 'Add Driver'}</button>
                    </div>
                  </form>
                </div>
              );
            })()}
          </AuthWrapper>
        )}

        {/* Maintenance List Screen */}
        {view.screen === 'MAINTENANCE_LIST' && (
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_ALL_MAINTENANCE}>
            <h1>Maintenance Activities</h1>
            <ListViewToolbar
              entityName="Maintenance"
              showAddButton={hasPermission(PERMISSIONS.CAN_ADD_MAINTENANCE)}
              onAddClick={() => navigate('MAINTENANCE_ADD')}
            />
            <div className="card-grid">
              {DUMMY_DATA.MAINTENANCE?.map(maintenance => (
                <div key={maintenance.id} className="card" onClick={() => navigate('MAINTENANCE_DETAIL', { maintenanceId: maintenance.id })}>
                  <div className="card-header">
                    <span className="card-title">{maintenance.type}</span>
                    <span className={`card-status ${STATUS_MAPPING.MAINTENANCE?.[maintenance.status]?.colorClass || 'status-card--inactive'}`}>
                      {STATUS_MAPPING.MAINTENANCE?.[maintenance.status]?.label || maintenance.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p>Vehicle: {DUMMY_DATA.VEHICLES?.find(v => v.id === maintenance.vehicleId)?.licensePlate || 'N/A'}</p>
                    <p>Schedule Date: {maintenance.scheduleDate}</p>
                    <p>Performed By: {maintenance.performedBy}</p>
                  </div>
                  <div className="card-footer">
                    <span>Cost: ${maintenance.cost?.toLocaleString()}</span>
                    <button className="button--icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AuthWrapper>
        )}

        {/* Maintenance Detail Screen */}
        {view.screen === 'MAINTENANCE_DETAIL' && (
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_ALL_MAINTENANCE}>
            <div className="detail-container">
              <div className="detail-header">
                {(() => {
                  const maintenance = DUMMY_DATA.MAINTENANCE?.find(m => m.id === view.params?.maintenanceId);
                  return (
                    maintenance ? (
                      <>
                        <h1>{maintenance.type}</h1>
                        <div className="detail-header-actions">
                          <AuthWrapper permission={PERMISSIONS.CAN_EDIT_MAINTENANCE}>
                            <button className="button" onClick={() => navigate('MAINTENANCE_EDIT', { maintenanceId: maintenance.id })}>Edit Maintenance</button>
                          </AuthWrapper>
                          <AuthWrapper permission={PERMISSIONS.CAN_EDIT_MAINTENANCE}>
                            <button className="button button--danger" onClick={() => handleDelete('Maintenance', maintenance.id)}>Delete</button>
                          </AuthWrapper>
                        </div>
                      </>
                    ) : (
                      <h1>Maintenance Record Not Found</h1>
                    )
                  );
                })()}
              </div>
              {(() => {
                const maintenance = DUMMY_DATA.MAINTENANCE?.find(m => m.id === view.params?.maintenanceId);
                const vehicle = DUMMY_DATA.VEHICLES?.find(v => v.id === maintenance?.vehicleId);

                if (!maintenance) return <p>Maintenance data not available.</p>;

                return (
                  <>
                    <div className="detail-section">
                      <h3>Maintenance Details</h3>
                      <div className="detail-item"><span className="detail-item-label">Status:</span><span className={`detail-item-value detail-item-status ${STATUS_MAPPING.MAINTENANCE?.[maintenance.status]?.colorClass || 'status-card--inactive'}`}>{STATUS_MAPPING.MAINTENANCE?.[maintenance.status]?.label || maintenance.status}</span></div>
                      <div className="detail-item"><span className="detail-item-label">SLA Status:</span><span className={`detail-item-value detail-item-status ${STATUS_MAPPING.SLA?.[maintenance.slaStatus]?.colorClass || 'status-card--COMPLETED'}`}>{STATUS_MAPPING.SLA?.[maintenance.slaStatus]?.label || maintenance.slaStatus}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Type:</span><span className="detail-item-value">{maintenance.type}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Scheduled Date:</span><span className="detail-item-value">{maintenance.scheduleDate}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Completion Date:</span><span className="detail-item-value">{maintenance.completionDate || 'N/A'}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Cost:</span><span className="detail-item-value">${maintenance.cost?.toLocaleString()}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Performed By:</span><span className="detail-item-value">{maintenance.performedBy}</span></div>
                      <div className="detail-item"><span className="detail-item-label">Notes:</span><span className="detail-item-value">{maintenance.notes || 'N/A'}</span></div>
                    </div>

                    <div className="detail-section">
                      <h3>Related Vehicle</h3>
                      {vehicle ? (
                        <>
                          <div className="detail-item"><span className="detail-item-label">Vehicle:</span><span className="detail-item-value"><a onClick={() => navigate('VEHICLE_DETAIL', { vehicleId: vehicle.id })}>{vehicle.make} {vehicle.model} ({vehicle.licensePlate})</a></span></div>
                          <div className="detail-item"><span className="detail-item-label">Mileage:</span><span className="detail-item-value">{vehicle.mileage?.toLocaleString()} km</span></div>
                        </>
                      ) : (
                        <p>Vehicle not found.</p>
                      )}
                    </div>

                    <AuthWrapper permission={PERMISSIONS.CAN_VIEW_AUDIT_LOGS}>
                      <div className="detail-section">
                        <h3>Audit Logs</h3>
                        <div className="audit-logs-list">
                          {DUMMY_DATA.AUDIT_LOGS?.filter(log => log.entity === 'Maintenance' && log.recordId === maintenance.id).map(log => (
                            <div key={log.id} className="audit-log-item">
                              <span>{log.action}</span>
                              <span>By: {log.user}</span>
                              <span>Date: {new Date(log.timestamp).toLocaleString()}</span>
                              <span>Details: {log.details}</span>
                            </div>
                          ))}
                          {DUMMY_DATA.AUDIT_LOGS?.filter(log => log.entity === 'Maintenance' && log.recordId === maintenance.id).length === 0 && (
                            <p>No audit logs for this maintenance record.</p>
                          )}
                        </div>
                      </div>
                    </AuthWrapper>
                  </>
                );
              })()}
            </div>
          </AuthWrapper>
        )}

        {/* Maintenance Add/Edit Form */}
        {(view.screen === 'MAINTENANCE_ADD' || view.screen === 'MAINTENANCE_EDIT') && (
          <AuthWrapper permission={view.screen === 'MAINTENANCE_ADD' ? PERMISSIONS.CAN_ADD_MAINTENANCE : PERMISSIONS.CAN_EDIT_MAINTENANCE}>
            {(() => {
              const isEdit = view.screen === 'MAINTENANCE_EDIT';
              const initialMaintenance = isEdit ? DUMMY_DATA.MAINTENANCE?.find(m => m.id === view.params?.maintenanceId) : {};
              const [formData, setFormData] = useState(initialMaintenance || {
                vehicleId: '', type: '', status: 'SCHEDULED', scheduleDate: '', completionDate: '', cost: 0, performedBy: '', notes: '', slaStatus: 'MET'
              });

              useEffect(() => {
                if (isEdit && !initialMaintenance) {
                  alert('Maintenance record not found for editing.');
                  navigate('MAINTENANCE_LIST');
                }
              }, [isEdit, initialMaintenance, navigate]);

              const handleChange = (e) => {
                const { name, value } = e.target;
                setFormData(prev => ({ ...prev, [name]: value }));
              };

              const handleFormSubmit = (e) => {
                e.preventDefault();
                if (!formData.vehicleId || !formData.type || !formData.scheduleDate) {
                  alert('Please fill in all mandatory fields.');
                  return;
                }
                handleSubmit('Maintenance', formData);
              };

              return (
                <div className="detail-container">
                  <h1>{isEdit ? 'Edit Maintenance' : 'Add New Maintenance Activity'}</h1>
                  <form onSubmit={handleFormSubmit}>
                    <div className="form-group">
                      <label htmlFor="vehicleId">Vehicle <span className="form-required-star">*</span></label>
                      <select id="vehicleId" name="vehicleId" value={formData.vehicleId || ''} onChange={handleChange} required>
                        <option value="">-- Select Vehicle --</option>
                        {DUMMY_DATA.VEHICLES?.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} ({vehicle.licensePlate})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="type">Type <span className="form-required-star">*</span></label>
                      <input type="text" id="type" name="type" value={formData.type || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select id="status" name="status" value={formData.status || 'SCHEDULED'} onChange={handleChange}>
                        {Object.keys(STATUS_MAPPING.MAINTENANCE)?.map(statusKey => (
                          <option key={statusKey} value={statusKey}>{STATUS_MAPPING.MAINTENANCE[statusKey].label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="scheduleDate">Scheduled Date <span className="form-required-star">*</span></label>
                      <input type="date" id="scheduleDate" name="scheduleDate" value={formData.scheduleDate || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="completionDate">Completion Date</label>
                      <input type="date" id="completionDate" name="completionDate" value={formData.completionDate || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cost">Cost ($)</label>
                      <input type="number" id="cost" name="cost" value={formData.cost || 0} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="performedBy">Performed By</label>
                      <input type="text" id="performedBy" name="performedBy" value={formData.performedBy || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="notes">Notes</label>
                      <textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange}></textarea>
                    </div>
                    <div className="form-group">
                      <label htmlFor="slaStatus">SLA Status</label>
                      <select id="slaStatus" name="slaStatus" value={formData.slaStatus || 'MET'} onChange={handleChange}>
                        {Object.keys(STATUS_MAPPING.SLA)?.map(statusKey => (
                          <option key={statusKey} value={statusKey}>{STATUS_MAPPING.SLA[statusKey].label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="button button--secondary" onClick={() => navigate('MAINTENANCE_LIST')}>Cancel</button>
                      <button type="submit" className="button">{isEdit ? 'Save Changes' : 'Add Maintenance'}</button>
                    </div>
                  </form>
                </div>
              );
            })()}
          </AuthWrapper>
        )}

        {/* Audit Logs Screen */}
        {view.screen === 'AUDIT_LOGS' && (
          <AuthWrapper permission={PERMISSIONS.CAN_VIEW_AUDIT_LOGS}>
            <h1>Audit Logs</h1>
            <div className="toolbar">
              <input type="text" placeholder="Search logs..." className="form-group__input toolbar__search-input" />
              <select className="toolbar__dropdown">
                <option>All Entities</option>
                <option>Vehicle</option>
                <option>Driver</option>
                <option>Maintenance</option>
              </select>
              <select className="toolbar__dropdown">
                <option>All Users</option>
                {Object.values(ROLES)?.map(role => <option key={role}>{role}</option>)}
              </select>
              <select className="toolbar__dropdown">
                <option>Sort by Date (Newest)</option>
                <option>Sort by Date (Oldest)</option>
              </select>
              <div className="toolbar__action-group">
                <button className="button button--secondary">Apply Filters</button>
                <button className="button button--secondary">Export Logs</button>
              </div>
            </div>
            <div className="audit-logs-list">
              {DUMMY_DATA.AUDIT_LOGS?.map(log => (
                <div key={log.id} className="audit-log-item">
                  <span><strong>{log.action}</strong> ({log.entity})</span>
                  <span>Record ID: {log.recordId}</span>
                  <span>By: {log.user}</span>
                  <span>Date: {new Date(log.timestamp).toLocaleString()}</span>
                  <span>Details: {log.details}</span>
                </div>
              ))}
            </div>
          </AuthWrapper>
        )}

        {/* Settings Screen */}
        {view.screen === 'SETTINGS' && (
          <AuthWrapper permission={PERMISSIONS.CAN_ACCESS_SETTINGS}>
            <h1>Settings</h1>
            <div className="detail-container">
              <div className="detail-section">
                <h3>User Management</h3>
                <p>Manage users and assign roles.</p>
                <button className="button">View Users</button>
              </div>
              <div className="detail-section">
                <h3>Role & Permission Configuration</h3>
                <p>Define and adjust role-based access controls.</p>
                <button className="button">Edit Roles</button>
              </div>
              <div className="detail-section">
                <h3>System Preferences</h3>
                <p>Configure global application settings, integrations, and alerts.</p>
                <button className="button">Configure System</button>
              </div>
            </div>
          </AuthWrapper>
        )}
      </main>
    </div>
  );
}

export default App;